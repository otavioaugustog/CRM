-- ============================================================
-- Migration 006: Correções de segurança RLS
--
-- BUG CRÍTICO (001): workspace_members_insert bootstrap
-- ─────────────────────────────────────────────────────────
-- A branch "NOT EXISTS" na policy original rodava com RLS
-- ativo, então qualquer usuário sem memberships via
-- get_user_workspace_ids() recebia NOT EXISTS = TRUE e
-- podia se auto-inserir em qualquer workspace existente.
--
-- Correção: substituir bootstrap por trigger AFTER INSERT
-- em workspaces que insere o criador como admin atomicamente.
--
-- AJUSTE (005): UNIQUE(workspace_id, email) em invitations
-- ─────────────────────────────────────────────────────────
-- Bloqueava reenvio de convite após aceitação ou expiração.
-- Substituído por partial unique index (apenas pendentes).
--
-- AJUSTE (005): accept_invitation sem auth
-- ─────────────────────────────────────────────────────────
-- Sem guard explícito para auth.uid() = NULL a função
-- retornava "convite pertence a outro e-mail", mas a
-- mensagem expunha que o token é válido. Corrigido.
-- ============================================================

-- ─── FIX 1: workspace_members bootstrap ─────────────────────

-- 1a. Remove a policy vulnerável
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;

-- 1b. Nova policy: apenas admins podem inserir membros diretamente
--     (o criador do workspace é inserido pelo trigger abaixo)
CREATE POLICY "workspace_members_insert"
  ON public.workspace_members FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 1c. Trigger: ao criar workspace, insere o criador como admin
--     SECURITY DEFINER para bypass de RLS no INSERT
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, auth.uid(), 'admin');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_workspace_creator ON public.workspaces;
CREATE TRIGGER trg_new_workspace_creator
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- ─── FIX 2: invitations — policy select usa auth.jwt() ──────

-- SELECT FROM auth.users não é acessível ao role anon.
-- Substituído por auth.jwt()->>'email' (disponível a todos os roles).
DROP POLICY IF EXISTS "invitations_select" ON public.invitations;

CREATE POLICY "invitations_select"
  ON public.invitations FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR (auth.uid() IS NOT NULL AND email = (auth.jwt()->>'email'))
  );

-- ─── FIX 3: invitations — partial unique index ───────────────

-- Remove constraint que bloqueava reenvio após expiração/aceitação
ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_workspace_id_email_key;

-- Partial unique index: bloqueia apenas convites ainda pendentes
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_pending
  ON public.invitations(workspace_id, email)
  WHERE accepted_at IS NULL;

-- ─── FIX 3: accept_invitation — guard para auth.uid() NULL ──

CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_invitation  public.invitations%ROWTYPE;
  v_user_email  TEXT;
BEGIN
  -- Rejeita imediatamente chamadas sem sessão autenticada
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('error', 'Autenticação necessária');
  END IF;

  -- Busca e valida o convite pelo token
  SELECT * INTO v_invitation
  FROM public.invitations
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Convite inválido ou expirado');
  END IF;

  -- Confirma que o e-mail do convite bate com o usuário logado
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  IF v_user_email IS DISTINCT FROM v_invitation.email THEN
    RETURN json_build_object('error', 'Este convite não pertence à sua conta');
  END IF;

  -- Cria a associação (ou ignora se já existir)
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_invitation.workspace_id, auth.uid(), v_invitation.role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Marca como aceito atomicamente
  UPDATE public.invitations
  SET accepted_at = now()
  WHERE id = v_invitation.id;

  RETURN json_build_object(
    'workspace_id', v_invitation.workspace_id,
    'role', v_invitation.role
  );
END;
$$;
