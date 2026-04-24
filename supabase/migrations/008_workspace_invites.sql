-- ============================================================
-- Migration 008: Workspace Invites
-- Nova tabela workspace_invites (substitui invitations no fluxo de convites).
-- Mantém invitations intacta para compatibilidade.
-- Depende de: 001_workspaces.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.workspace_invites (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  role         TEXT        NOT NULL DEFAULT 'member'
                             CHECK (role IN ('admin', 'member')),
  token        TEXT        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ÍNDICES ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_workspace_invites_token
  ON public.workspace_invites(token);

CREATE INDEX IF NOT EXISTS idx_workspace_invites_email
  ON public.workspace_invites(email);

CREATE INDEX IF NOT EXISTS idx_workspace_invites_workspace_id
  ON public.workspace_invites(workspace_id);

-- Impede convites duplicados para o mesmo e-mail/workspace enquanto pendente.
-- Permite reenvio após aceite ou expiração.
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_invites_unique_pending
  ON public.workspace_invites(workspace_id, email)
  WHERE accepted_at IS NULL;

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE public.workspace_invites ENABLE ROW LEVEL SECURITY;

-- Admin vê todos os convites do workspace; convidado vê o próprio pelo e-mail.
CREATE POLICY "workspace_invites_select"
  ON public.workspace_invites FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
    OR (
      (SELECT auth.uid()) IS NOT NULL
      AND email = (SELECT auth.jwt()->>'email')
    )
  );

-- Apenas admins criam convites
CREATE POLICY "workspace_invites_insert"
  ON public.workspace_invites FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Apenas admins atualizam (ex: cancelar)
CREATE POLICY "workspace_invites_update"
  ON public.workspace_invites FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Apenas admins excluem
CREATE POLICY "workspace_invites_delete"
  ON public.workspace_invites FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ─── FUNÇÃO: aceitar convite ─────────────────────────────────

-- Valida token, confere e-mail do usuário logado, cria workspace_member
-- e marca accepted_at. SECURITY DEFINER para bypass de RLS no INSERT.
CREATE OR REPLACE FUNCTION public.accept_workspace_invite(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_invite      public.workspace_invites%ROWTYPE;
  v_user_email  TEXT;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RETURN json_build_object('error', 'Autenticação necessária');
  END IF;

  SELECT * INTO v_invite
  FROM public.workspace_invites
  WHERE token = p_token
    AND accepted_at IS NULL
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Convite inválido ou expirado');
  END IF;

  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = (SELECT auth.uid());

  IF v_user_email IS DISTINCT FROM v_invite.email THEN
    RETURN json_build_object('error', 'Este convite não pertence à sua conta');
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_invite.workspace_id, (SELECT auth.uid()), v_invite.role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  UPDATE public.workspace_invites
  SET accepted_at = now()
  WHERE id = v_invite.id;

  RETURN json_build_object(
    'workspace_id', v_invite.workspace_id,
    'role', v_invite.role
  );
END;
$$;

-- ─── FUNÇÃO: membros com perfil ──────────────────────────────

-- Retorna membros do workspace com e-mail e nome do auth.users.
-- SECURITY DEFINER: contorna RLS no schema auth; verifica manualmente
-- que o chamador é membro do workspace antes de retornar dados.
CREATE OR REPLACE FUNCTION public.get_workspace_members_with_profile(p_workspace_id UUID)
RETURNS TABLE (
  id           UUID,
  workspace_id UUID,
  user_id      UUID,
  role         TEXT,
  created_at   TIMESTAMPTZ,
  email        TEXT,
  full_name    TEXT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  -- Só retorna dados se o chamador for membro do workspace
  IF NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = (SELECT auth.uid())
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    wm.id,
    wm.workspace_id,
    wm.user_id,
    wm.role,
    wm.created_at,
    u.email::TEXT,
    COALESCE(u.raw_user_meta_data->>'name', u.email)::TEXT AS full_name
  FROM public.workspace_members wm
  JOIN auth.users u ON u.id = wm.user_id
  WHERE wm.workspace_id = p_workspace_id
  ORDER BY wm.created_at ASC;
END;
$$;
