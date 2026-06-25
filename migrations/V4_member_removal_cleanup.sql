-- 1. Create handle_member_removed trigger function
create or replace function public.handle_member_removed()
returns trigger as $$
begin
  -- Delete all expenses paid by the removed member in this workspace
  delete from public.expenses
  where workspace_id = old.workspace_id
    and paid_by = old.user_id;

  -- Remove the member from the split_members list of all remaining expenses in this workspace
  update public.expenses
  set split_members = array_remove(split_members, old.user_id)
  where workspace_id = old.workspace_id;

  return old;
end;
$$ language plpgsql security definer;

-- 2. Bind the trigger to public.members table
drop trigger if exists tr_member_removed on public.members;
create trigger tr_member_removed
  after delete on public.members
  for each row execute procedure public.handle_member_removed();
