-- ============================================================
-- Migration 010: Corrige policy de INSERT em workspaces
-- auth.role() = 'authenticated' falha no PostgREST v12+;
-- substituído por (SELECT auth.uid()) IS NOT NULL.
-- ============================================================

DROP POLICY IF EXISTS "workspaces_insert" ON public.workspaces;

CREATE POLICY "workspaces_insert"
  ON public.workspaces FOR INSERT
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);
