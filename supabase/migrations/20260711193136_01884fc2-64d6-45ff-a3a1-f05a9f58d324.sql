DROP POLICY IF EXISTS members_insert_creator_or_admin ON public.workspace_members;
CREATE POLICY members_insert_creator_or_admin
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.workspace_role_of(workspace_id, auth.uid()) IN ('owner'::workspace_role, 'admin'::workspace_role)
  OR (
    user_id = auth.uid()
    AND role = 'owner'::workspace_role
    AND EXISTS (
      SELECT 1
      FROM public.workspaces
      WHERE id = workspace_id
        AND created_by = auth.uid()
    )
  )
);

DROP FUNCTION IF EXISTS public.is_workspace_creator(uuid, uuid);
DROP FUNCTION IF EXISTS public.workspace_has_no_members(uuid);