create or replace function public.get_workspace_invite_preview(invite_uuid uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select workspace.name
  from public.workspaces as workspace
  where workspace.invite_code = invite_uuid
  limit 1;
$$;

revoke all on function public.get_workspace_invite_preview(uuid)
  from public, anon, authenticated;
grant execute on function public.get_workspace_invite_preview(uuid)
  to anon, authenticated;