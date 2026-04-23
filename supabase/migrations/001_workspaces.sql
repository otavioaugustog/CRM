-- ============================================================
-- Migration 001: Workspaces & Members
-- Tabelas: workspaces, workspace_members
-- RLS: isolamento total por workspace
-- ============================================================

-- UUID extension (já habilitada no Supabase, mas garante idempotência)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABELAS ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workspaces (
  id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT        NOT NULL,
  slug                    TEXT        NOT NULL UNIQUE,
  plan                    TEXT        NOT NULL DEFAULT 'free'
                            CHECK (plan IN ('free', 'pro')),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT        NOT NULL DEFAULT 'member'
                              CHECK (role IN ('admin', 'member')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- ─── ÍNDICES ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id
  ON public.workspace_members(user_id);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id
  ON public.workspace_members(workspace_id);

-- ─── TRIGGER updated_at ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── FUNÇÃO HELPER (usada por todas as policies) ─────────────

-- Retorna os workspace_ids dos quais o usuário logado é membro.
-- SECURITY DEFINER: executa com privilégios do owner, evitando
-- recursão infinita dentro das próprias RLS policies.
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids()
RETURNS SETOF UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT workspace_id
  FROM public.workspace_members
  WHERE user_id = auth.uid();
$$;

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE public.workspaces       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- workspaces: leitura apenas para membros
CREATE POLICY "workspaces_select"
  ON public.workspaces FOR SELECT
  USING (id IN (SELECT public.get_user_workspace_ids()));

-- workspaces: qualquer usuário autenticado pode criar (torna-se admin)
CREATE POLICY "workspaces_insert"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- workspaces: apenas admin pode editar
CREATE POLICY "workspaces_update"
  ON public.workspaces FOR UPDATE
  USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- workspaces: apenas admin pode deletar
CREATE POLICY "workspaces_delete"
  ON public.workspaces FOR DELETE
  USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- workspace_members: membros veem os colegas do mesmo workspace
CREATE POLICY "workspace_members_select"
  ON public.workspace_members FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- workspace_members: admin adiciona membros; criador adiciona a si mesmo
-- (sem membros ainda = inserção do próprio criador como primeiro admin)
CREATE POLICY "workspace_members_insert"
  ON public.workspace_members FOR INSERT
  WITH CHECK (
    -- Caso normal: admin convida
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    OR
    -- Bootstrap: primeiro membro do workspace (criação)
    NOT EXISTS (
      SELECT 1 FROM public.workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
    )
  );

-- workspace_members: admin pode alterar papel de membros
CREATE POLICY "workspace_members_update"
  ON public.workspace_members FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- workspace_members: admin remove membros; membro pode sair sozinho
CREATE POLICY "workspace_members_delete"
  ON public.workspace_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
