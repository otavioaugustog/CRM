-- ============================================================
-- Migration 011: Corrige trigger handle_new_workspace
-- Quando chamado via service client (Server Action), auth.uid()
-- retorna NULL. O trigger agora ignora silenciosamente esse caso;
-- a inserção do membro admin é feita pela aplicação com o user.id
-- obtido antes da chamada ao banco.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.workspace_members (workspace_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'admin')
    ON CONFLICT (workspace_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
