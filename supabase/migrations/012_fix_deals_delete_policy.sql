-- ============================================================
-- Migration 012: Corrige política de DELETE em deals
--
-- Problema: deals_delete permitia exclusão apenas para admins,
-- bloqueando o owner do deal (membro comum) de excluir seu
-- próprio negócio — supabase-js v2 retorna erro nesse caso.
--
-- Correção: permite exclusão se o usuário pertence ao workspace
-- E é o owner do deal OU é admin do workspace.
-- O filtro por workspace_id garante isolamento multi-tenant
-- em ambas as branches.
-- ============================================================

DROP POLICY IF EXISTS "deals_delete" ON public.deals;

CREATE POLICY "deals_delete"
  ON public.deals FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid())
    )
    AND (
      owner_id = (SELECT auth.uid())
      OR workspace_id IN (
        SELECT workspace_id FROM public.workspace_members
        WHERE user_id = (SELECT auth.uid()) AND role = 'admin'
      )
    )
  );
