
-- Install missing database helper functions.
-- This migration does not modify or delete application data.

-- 1. Workspace membership helper
CREATE OR REPLACE FUNCTION public.is_workspace_member(
    workspace_id uuid,
    user_id uuid
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.members AS m
        WHERE m.workspace_id = $1
          AND m.user_id = $2
    );
$$;

REVOKE ALL ON FUNCTION public.is_workspace_member(uuid, uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid)
TO authenticated, service_role;

-- 2. Regenerate workspace invite code
CREATE OR REPLACE FUNCTION public.regenerate_workspace_invite_code(
    w_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    new_code uuid;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.workspaces
        WHERE id = w_id
          AND owner_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    new_code := gen_random_uuid();

    UPDATE public.workspaces
    SET invite_code = new_code
    WHERE id = w_id;

    RETURN new_code;
END;
$$;

REVOKE ALL ON FUNCTION public.regenerate_workspace_invite_code(uuid)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.regenerate_workspace_invite_code(uuid)
TO authenticated;

-- 3. Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
