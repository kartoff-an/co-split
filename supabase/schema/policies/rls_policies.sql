
-- Security Policies: Row-Level Security (RLS)
-- Description: Declarative security policy snapshots for all tables

-- user_profiles
drop policy if exists "Allow profile viewing for authenticated users" on public.user_profiles;
create policy "Allow profile viewing for authenticated users" 
  on public.user_profiles for select 
  using (auth.role() = 'authenticated');

drop policy if exists "Allow profile update for owner" on public.user_profiles;
create policy "Allow profile update for owner" 
  on public.user_profiles for update 
  using (id = auth.uid());


-- workspaces
drop policy if exists "Allow workspace viewing for members" on public.workspaces;
create policy "Allow workspace viewing for members" 
  on public.workspaces for select 
  using (public.is_workspace_member(id, auth.uid()));

drop policy if exists "Allow workspace creation for authenticated users" on public.workspaces;
create policy "Allow workspace creation for authenticated users" 
  on public.workspaces for insert 
  with check (auth.role() = 'authenticated' and owner_id = auth.uid());

drop policy if exists "Allow workspace owner updates" on public.workspaces;
create policy "Allow workspace owner updates" 
  on public.workspaces for update 
  using (owner_id = auth.uid());

drop policy if exists "Allow workspace owner deletes" on public.workspaces;
create policy "Allow workspace owner deletes" 
  on public.workspaces for delete 
  using (owner_id = auth.uid());


-- members
drop policy if exists "Allow member viewing for authenticated users" on public.members;
create policy "Allow member viewing for authenticated users" 
  on public.members for select 
  using (auth.role() = 'authenticated');

drop policy if exists "Allow member insert for authenticated users" on public.members;
create policy "Allow member insert for authenticated users" 
  on public.members for insert 
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

drop policy if exists "Allow member deletion for workspace owners or self" on public.members;
create policy "Allow member deletion for workspace owners or self" 
  on public.members for delete 
  using (
    user_id = auth.uid() or 
    exists (
      select 1 from public.workspaces 
      where workspaces.id = members.workspace_id and workspaces.owner_id = auth.uid()
    )
  );


-- expenses
drop policy if exists "Allow expense viewing for authenticated users" on public.expenses;
create policy "Allow expense viewing for authenticated users" 
  on public.expenses for select 
  using (auth.role() = 'authenticated');

drop policy if exists "Allow expense insertion for members" on public.expenses;
create policy "Allow expense insertion for members" 
  on public.expenses for insert 
  with check (
    public.is_workspace_member(workspace_id, auth.uid()) and
    public.is_workspace_member(workspace_id, paid_by)
  );

drop policy if exists "Allow expense updates for logger" on public.expenses;
create policy "Allow expense updates for logger"
  on public.expenses for update
  using (coalesce(created_by, paid_by) = auth.uid());

drop policy if exists "Allow expense deletion for logger" on public.expenses;
create policy "Allow expense deletion for logger"
  on public.expenses for delete
  using (coalesce(created_by, paid_by) = auth.uid());


-- audit_logs
drop policy if exists "Allow log insertion for authenticated users" on public.audit_logs;
create policy "Allow log insertion for authenticated users" 
  on public.audit_logs for insert 
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

drop policy if exists "Allow log reading for authenticated users" on public.audit_logs;
create policy "Allow log reading for authenticated users" 
  on public.audit_logs for select 
  using (auth.role() = 'authenticated');
