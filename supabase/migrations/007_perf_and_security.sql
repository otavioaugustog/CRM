-- ============================================================
-- Migration 007: Performance & Security
--
-- Aplicações das Supabase Postgres Best Practices:
--
-- [3.3] RLS auth.uid() por-linha → (select auth.uid())
--   auth.uid() avaliado uma vez por linha escaneada.
--   Wrapping em (select ...) força avaliação única (init plan),
--   resultando em 5-10x mais rápido em tabelas grandes.
--
-- [4.2] Índices em colunas FK sem índice
--   Postgres NÃO cria índices automáticos em FK.
--   Falta de índice força full table scan em JOINs e CASCADE.
--
-- [3.1] workspaces_insert: auth.role() depreciado
--   Substituído por (select auth.uid()) IS NOT NULL.
-- ============================================================

-- ─── [3.3] Corrigir RLS: auth.uid() por-linha ───────────────

-- activities_delete: author_id = auth.uid() → author_id = (select auth.uid())
DROP POLICY IF EXISTS "activities_delete" ON public.activities;
CREATE POLICY "activities_delete"
  ON public.activities FOR DELETE
  USING (author_id = (SELECT auth.uid()));

-- workspaces_update: subquery interna com auth.uid()
DROP POLICY IF EXISTS "workspaces_update" ON public.workspaces;
CREATE POLICY "workspaces_update"
  ON public.workspaces FOR UPDATE
  USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- workspaces_delete
DROP POLICY IF EXISTS "workspaces_delete" ON public.workspaces;
CREATE POLICY "workspaces_delete"
  ON public.workspaces FOR DELETE
  USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- workspace_members_insert
DROP POLICY IF EXISTS "workspace_members_insert" ON public.workspace_members;
CREATE POLICY "workspace_members_insert"
  ON public.workspace_members FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- workspace_members_update
DROP POLICY IF EXISTS "workspace_members_update" ON public.workspace_members;
CREATE POLICY "workspace_members_update"
  ON public.workspace_members FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- workspace_members_delete
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;
CREATE POLICY "workspace_members_delete"
  ON public.workspace_members FOR DELETE
  USING (
    user_id = (SELECT auth.uid())
    OR workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- deals_delete
DROP POLICY IF EXISTS "deals_delete" ON public.deals;
CREATE POLICY "deals_delete"
  ON public.deals FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- invitations_select
DROP POLICY IF EXISTS "invitations_select" ON public.invitations;
CREATE POLICY "invitations_select"
  ON public.invitations FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
    OR ((SELECT auth.uid()) IS NOT NULL AND email = (auth.jwt()->>'email'))
  );

-- invitations_insert
DROP POLICY IF EXISTS "invitations_insert" ON public.invitations;
CREATE POLICY "invitations_insert"
  ON public.invitations FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- invitations_update
DROP POLICY IF EXISTS "invitations_update" ON public.invitations;
CREATE POLICY "invitations_update"
  ON public.invitations FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- invitations_delete
DROP POLICY IF EXISTS "invitations_delete" ON public.invitations;
CREATE POLICY "invitations_delete"
  ON public.invitations FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ─── [3.1] workspaces_insert: remover auth.role() ───────────

-- auth.role() = 'authenticated' é depreciado no Supabase.
-- Substituído por (select auth.uid()) IS NOT NULL.
DROP POLICY IF EXISTS "workspaces_insert" ON public.workspaces;
CREATE POLICY "workspaces_insert"
  ON public.workspaces FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

-- ─── [4.2] Índices FK faltantes ─────────────────────────────

-- leads.owner_id → auth.users(id): sem índice, JOINs e queries por responsável fazem seq scan
CREATE INDEX IF NOT EXISTS idx_leads_owner_id
  ON public.leads(owner_id);

-- deals.lead_id → leads(id): sem índice, lookup de deals por lead faz seq scan
CREATE INDEX IF NOT EXISTS idx_deals_lead_id
  ON public.deals(lead_id)
  WHERE lead_id IS NOT NULL;

-- deals.owner_id → auth.users(id): sem índice
CREATE INDEX IF NOT EXISTS idx_deals_owner_id
  ON public.deals(owner_id);

-- activities.author_id → auth.users(id): sem índice
CREATE INDEX IF NOT EXISTS idx_activities_author_id
  ON public.activities(author_id);

-- invitations.workspace_id → workspaces(id): útil para lookup de convites por workspace
CREATE INDEX IF NOT EXISTS idx_invitations_workspace_id
  ON public.invitations(workspace_id);
