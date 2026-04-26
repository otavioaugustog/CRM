-- Cria função SECURITY DEFINER para checar admin sem disparar RLS recursiva
CREATE OR REPLACE FUNCTION public.is_workspace_admin(p_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

-- Recria política de DELETE sem recursão
DROP POLICY IF EXISTS "workspace_members_delete" ON public.workspace_members;
CREATE POLICY "workspace_members_delete"
  ON public.workspace_members FOR DELETE
  USING (
    user_id = (SELECT auth.uid())
    OR is_workspace_admin(workspace_id)
  );
