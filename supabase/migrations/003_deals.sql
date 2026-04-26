-- ============================================================
-- Migration 003: Deals (Pipeline Kanban)
-- Depende de: 001_workspaces.sql, 002_leads.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deals (
  id            UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id  UUID           NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title         TEXT           NOT NULL,
  lead_id       UUID           REFERENCES public.leads(id) ON DELETE SET NULL,
  stage         TEXT           NOT NULL DEFAULT 'novo_lead'
                                 CHECK (stage IN (
                                   'novo_lead',
                                   'contato_realizado',
                                   'proposta_enviada',
                                   'negociacao',
                                   'fechado_ganho',
                                   'fechado_perdido'
                                 )),
  value         NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (value >= 0),
  owner_id      UUID           NOT NULL REFERENCES auth.users(id),
  due_date      DATE,
  created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

-- ─── ÍNDICES ────────────────────────────────────────────────

-- Kanban: agrupa cards por estágio dentro do workspace
CREATE INDEX IF NOT EXISTS idx_deals_workspace_stage
  ON public.deals(workspace_id, stage);

-- Dashboard: deals do usuário com prazo próximo
CREATE INDEX IF NOT EXISTS idx_deals_owner_due_date
  ON public.deals(owner_id, due_date)
  WHERE due_date IS NOT NULL;

-- ─── TRIGGER updated_at ─────────────────────────────────────

CREATE TRIGGER trg_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── RLS ────────────────────────────────────────────────────

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Todos os membros do workspace podem ler deals
CREATE POLICY "deals_select"
  ON public.deals FOR SELECT
  USING (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- Todos os membros podem criar deals
CREATE POLICY "deals_insert"
  ON public.deals FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- Todos os membros podem mover/editar deals (necessário para drag-and-drop)
CREATE POLICY "deals_update"
  ON public.deals FOR UPDATE
  USING (workspace_id IN (SELECT public.get_user_workspace_ids()));

-- Apenas admins podem excluir deals
CREATE POLICY "deals_delete"
  ON public.deals FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
