
-- Function: is_workspace_member
-- Description: Helper function to check if a user is a member of a workspace

create or replace function public.is_workspace_member(workspace_id uuid, user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.members
    where members.workspace_id = is_workspace_member.workspace_id
      and members.user_id = is_workspace_member.user_id
  );
end;
$$ language plpgsql security definer;
