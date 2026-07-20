alter table public.expenses 
add column if not exists created_by uuid references public.user_profiles(id) on delete cascade default auth.uid();

update public.expenses 
set created_by = paid_by 
where created_by is null;

drop policy if exists "Allow expense updates for payer or workspace owner" on public.expenses;
drop policy if exists "Allow expense deletion for payer or workspace owner" on public.expenses;
drop policy if exists "Allow expense updates for logger" on public.expenses;
drop policy if exists "Allow expense deletion for logger" on public.expenses;

create policy "Allow expense updates for logger"
  on public.expenses for update
  using (coalesce(created_by, paid_by) = auth.uid());

create policy "Allow expense deletion for logger"
  on public.expenses for delete
  using (coalesce(created_by, paid_by) = auth.uid());
