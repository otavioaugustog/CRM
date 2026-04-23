-- ============================================================
-- Migration 004: Activities (Timeline do Lead)
-- Depende de: 001_workspaces.sql, 002_leads.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.activities (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  lead_id       UUID        NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL
                              CHECK (type IN ('call', 'email', 'meeting', 'note')),
  description   TEXT        NOT NULL,
  author_id     UUID        NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── ÍNDICES ────────────────────────────────────────────────

-- Timeline: atividades de um lead, ordenadas decrescentemente
CREATE INDEX IF NOT EXISTS idx_activities_lead_timeline
  ON public.activities(lead_id, created_at DESC);

-- Isolamento de workspace nas queries
CREATE INDEX IF NOT EXISTS idx_activities_workspace_id
  ON public.activities(workspace_id);

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Todos os membros do workspace podem ler atividades
CREATE POLICY "activities_select"
  ON public.activities FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- Todos os membros podem registrar atividades
CREATE POLICY "activities_insert"
  ON public.activities FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- Apenas o autor pode excluir sua própria atividade
CREATE POLICY "activities_delete"
  ON public.activities FOR DELETE
  USING (author_id = auth.uid());
