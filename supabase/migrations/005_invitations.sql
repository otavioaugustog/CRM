-- ============================================================
-- Migration 005: Invitations (Convites por e-mail)
-- Depende de: 001_workspaces.sql
-- ============================================================

-- gen_random_bytes requer pgcrypto (habilitado por padrão no Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.invitations (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email         TEXT        NOT NULL,
  token         TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  role          TEXT        NOT NULL DEFAULT 'member'
                              CHECK (role IN ('admin', 'member')),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  -- Nota: unique constraint de (workspace_id, email) é criada como
  -- partial index em idx_invitations_unique_pending (apenas pendentes),
  -- permitindo reenvio após aceitação ou expiração.
);

-- ─── ÍNDICES ────────────────────────────────────────────────

-- Lookup de token na página /invite/[token]
CREATE INDEX IF NOT EXISTS idx_invitations_token
  ON public.invitations(token);

-- Lookup de convites por e-mail (autenticação pós-cadastro)
CREATE INDEX IF NOT EXISTS idx_invitations_email
  ON public.invitations(email);

-- Impede convites duplicados apenas para pendentes
-- (permite reenvio após aceitação ou expiração)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_unique_pending
  ON public.invitations(workspace_id, email)
  WHERE accepted_at IS NULL;

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Admin vê todos os convites do workspace; convidado vê o próprio convite
CREATE POLICY "invitations_select"
  ON public.invitations FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Apenas admins podem criar convites
CREATE POLICY "invitations_insert"
  ON public.invitations FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admins podem atualizar convites (ex: cancelar ou reenviar)
CREATE POLICY "invitations_update"
  ON public.invitations FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Apenas admins podem excluir convites
CREATE POLICY "invitations_delete"
  ON public.invitations FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ─── FUNÇÃO HELPER: aceitar convite ─────────────────────────

-- Valida token, cria workspace_member e marca accepted_at.
-- Chamada via supabase.rpc('accept_invitation', { p_token: '...' })
-- Executa com SECURITY DEFINER para contornar RLS no INSERT.
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_invitation  public.invitations%ROWTYPE;
  v_user_email  TEXT;
BEGIN
  -- Rejeita chamadas sem sessão autenticada
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
