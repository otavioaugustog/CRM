-- ============================================================
-- Migration 002: Leads
-- Depende de: 001_workspaces.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  email         TEXT,
  phone         TEXT,
  company       TEXT,
  role          TEXT,
  status        TEXT        NOT NULL DEFAULT 'ativo'
                              CHECK (status IN ('ativo', 'inativo', 'perdido')),
  owner_id      UUID        NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ÍNDICES ────────────────────────────────────────────────

-- Listagem filtrada por workspace (query mais comum)
CREATE INDEX IF NOT EXISTS idx_leads_workspace_id
  ON public.leads(workspace_id);

-- Filtro por status dentro do workspace
CREATE INDEX IF NOT EXISTS idx_leads_workspace_status
  ON public.leads(workspace_id, status);

-- Busca full-text por nome e empresa (ilike)
CREATE INDEX IF NOT EXISTS idx_leads_name
  ON public.leads USING gin (to_tsvector('portuguese', name));

-- ─── TRIGGER updated_at ─────────────────────────────────────

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Todos os membros do workspace podem ler leads
CREATE POLICY "leads_select"
  ON public.leads FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- Todos os membros podem criar leads no próprio workspace
CREATE POLICY "leads_insert"
  ON public.leads FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- Todos os membros podem editar leads do próprio workspace
CREATE POLICY "leads_update"
  ON public.leads FOR UPDATE
  USING (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- Todos os membros podem excluir leads do próprio workspace
CREATE POLICY "leads_delete"
  ON public.leads FOR DELETE
  USING (workspace_id IN (SELECT public.get_user_workspace_ids()));
