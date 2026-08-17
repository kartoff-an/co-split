-- Function: regenerate_workspace_invite_code
-- Description: Regenerates a workspace invite code for the workspace owner

create or replace function public.regenerate_workspace_invite_code(w_id uuid)
returns uuid as $$
declare
  new_code uuid;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from public.workspaces
    where id = w_id and owner_id = auth.uid()
  ) then
    raise exception 'Access denied: only the workspace owner can regenerate the invite code';
  end if;
  
  new_code := gen_random_uuid();
  update public.workspaces
  set invite_code = new_code
  where id = w_id;
  
  return new_code;
end;
$$ language plpgsql security definer;
