GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspaces TO authenticated;
GRANT ALL ON public.workspaces TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_members TO authenticated;
GRANT ALL ON public.workspace_members TO service_role;

CREATE OR REPLACE FUNCTION public.is_workspace_creator(_workspace_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspaces
    WHERE id = _workspace_id
      AND created_by = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.workspace_has_no_members(_workspace_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = _workspace_id
  );
$$;

DROP POLICY IF EXISTS workspaces_select_member ON public.workspaces;
DROP POLICY IF EXISTS workspaces_select_member_or_creator ON public.workspaces;
CREATE POLICY workspaces_select_member_or_creator
ON public.workspaces
FOR SELECT
TO authenticated
USING (
  public.is_workspace_member(id, auth.uid())
  OR created_by = auth.uid()
);

DROP POLICY IF EXISTS members_insert_self_or_admin ON public.workspace_members;
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
    AND public.is_workspace_creator(workspace_id, auth.uid())
    AND public.workspace_has_no_members(workspace_id)
  )
);