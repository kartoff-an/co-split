
-- ROW LEVEL SECURITY POLICIES
-- Co-Split

-- USER PROFILES
-- Users can view their own profile and profiles of people
-- sharing a workspace with them.

drop policy if exists "Allow profile viewing for authenticated users"
  on public.user_profiles;

drop policy if exists "Users can view own and workspace member profiles"
  on public.user_profiles;

create policy "Users can view own and workspace member profiles"
  on public.user_profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1
      from public.members m
      where m.user_id = user_profiles.id
        and public.is_workspace_member(
          m.workspace_id,
          (select auth.uid())
        )
    )
  );


drop policy if exists "Allow profile update for owner"
  on public.user_profiles;

create policy "Allow profile update for owner"
  on public.user_profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));


-- WORKSPACES
-- Only workspace members can view.
-- Only owners can create, update and delete their workspaces.

drop policy if exists "Allow workspace viewing for members"
  on public.workspaces;

create policy "Allow workspace viewing for members"
  on public.workspaces
  for select
  to authenticated
  using (
    public.is_workspace_member(id, (select auth.uid()))
  );


drop policy if exists "Allow workspace creation for authenticated users"
  on public.workspaces;

create policy "Allow workspace creation for authenticated users"
  on public.workspaces
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
  );


drop policy if exists "Allow workspace owner updates"
  on public.workspaces;

create policy "Allow workspace owner updates"
  on public.workspaces
  for update
  to authenticated
  using (
    owner_id = (select auth.uid())
  )
  with check (
    owner_id = (select auth.uid())
  );


drop policy if exists "Allow workspace owner deletes"
  on public.workspaces;

create policy "Allow workspace owner deletes"
  on public.workspaces
  for delete
  to authenticated
  using (
    owner_id = (select auth.uid())
  );


-- MEMBERS
-- Workspace members can view other members.
-- Direct membership insertion is disabled.
-- Joining must happen through a validated RPC.

drop policy if exists "Allow member viewing for authenticated users"
  on public.members;

create policy "Workspace members can view memberships"
  on public.members
  for select
  to authenticated
  using (
    public.is_workspace_member(
      workspace_id,
      (select auth.uid())
    )
  );


drop policy if exists "Allow member insert for authenticated users"
  on public.members;

drop policy if exists "Allow member deletion for workspace owners or self"
  on public.members;

create policy "Allow member deletion for workspace owners or self"
  on public.members
  for delete
  to authenticated
  using (
    (
      user_id = (select auth.uid())
      and not exists (
        select 1
        from public.workspaces w
        where w.id = members.workspace_id
          and w.owner_id = (select auth.uid())
      )
    )
    or exists (
      select 1
      from public.workspaces w
      where w.id = members.workspace_id
        and w.owner_id = (select auth.uid())
        and members.user_id <> (select auth.uid())
    )
  );


-- EXPENSES
-- Only workspace members can view.
-- Expense creation requires valid creator, payer and splits.

drop policy if exists "Allow expense viewing for authenticated users"
  on public.expenses;

create policy "Workspace members can view expenses"
  on public.expenses
  for select
  to authenticated
  using (
    public.is_workspace_member(
      workspace_id,
      (select auth.uid())
    )
  );


drop policy if exists "Allow expense insertion for members"
  on public.expenses;

create policy "Workspace members can insert expenses"
  on public.expenses
  for insert
  to authenticated
  with check (
    created_by = (select auth.uid())

    and public.is_workspace_member(
      workspace_id,
      (select auth.uid())
    )

    and public.is_workspace_member(
      workspace_id,
      paid_by
    )

    and (
      split_members is null
      or cardinality(split_members) = 0
      or (
        -- Every split member must belong to the workspace.
        not exists (
          select 1
          from unnest(expenses.split_members) as s(member_id)
          where not public.is_workspace_member(
            expenses.workspace_id,
            s.member_id
          )
        )

        -- Prevent duplicate split members.
        and cardinality(split_members) = (
          select count(distinct s.member_id)
          from unnest(expenses.split_members) as s(member_id)
        )
      )
    )
  );


-- Preserve the latest migration's permission model:
-- Expense creator OR payer can update.
-- Both must remain valid workspace participants.

drop policy if exists "Allow expense updates for logger"
  on public.expenses;

drop policy if exists "Allow expense updates for logger or payer"
  on public.expenses;

create policy "Allow expense updates for logger or payer"
  on public.expenses
  for update
  to authenticated
  using (
    created_by = (select auth.uid())
    or paid_by = (select auth.uid())
  )
  with check (
    public.is_workspace_member(
      workspace_id,
      (select auth.uid())
    )

    and public.is_workspace_member(
      workspace_id,
      paid_by
    )

    and (
      created_by = (select auth.uid())
      or paid_by = (select auth.uid())
    )

    and (
      split_members is null
      or cardinality(split_members) = 0
      or (
        not exists (
          select 1
          from unnest(expenses.split_members) as s(member_id)
          where not public.is_workspace_member(
            expenses.workspace_id,
            s.member_id
          )
        )

        and cardinality(split_members) = (
          select count(distinct s.member_id)
          from unnest(expenses.split_members) as s(member_id)
        )
      )
    )
  );


drop policy if exists "Allow expense deletion for logger"
  on public.expenses;

drop policy if exists "Allow expense deletion for logger or payer"
  on public.expenses;

create policy "Allow expense deletion for logger or payer"
  on public.expenses
  for delete
  to authenticated
  using (
    created_by = (select auth.uid())
    or paid_by = (select auth.uid())
  );


-- AUDIT LOGS
-- Users can insert and read their own logs only.

drop policy if exists "Allow log insertion for authenticated users"
  on public.audit_logs;

create policy "Users can insert their own audit logs"
  on public.audit_logs
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
  );


drop policy if exists "Allow log reading for authenticated users"
  on public.audit_logs;

create policy "Users can read their own audit logs"
  on public.audit_logs
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
  );
