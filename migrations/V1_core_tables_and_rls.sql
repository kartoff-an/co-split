create extension if not exists "uuid-ossp";

-- Configure default privileges and grant usage to Supabase roles
grant usage on schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;

grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;

-- Drop existing structures if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_workspace_member(uuid, uuid) cascade;
drop table if exists public.audit_logs cascade;
drop table if exists public.expenses cascade;
drop table if exists public.members cascade;
drop table if exists public.workspaces cascade;
drop table if exists public.user_profiles cascade;

-- Create user_profiles
create table public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_profiles enable row level security;

create policy "Allow profile reading for authenticated users" 
  on public.user_profiles for select 
  using (auth.role() = 'authenticated');

create policy "Allow profile updating for own profile" 
  on public.user_profiles for update 
  using (auth.uid() = id);

-- Trigger function to auto-create user profile from auth metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, display_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill any existing users from auth.users into public.user_profiles
insert into public.user_profiles (id, display_name, avatar_url, email)
select 
  id,
  coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'New User'),
  raw_user_meta_data->>'avatar_url',
  email
from auth.users
on conflict (id) do nothing;

-- Create workspaces
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references public.user_profiles(id) on delete cascade not null,
  allowed_members int default 10 check (allowed_members >= 1),
  currency text default 'PHP' not null check (currency in ('PHP', 'USD')),
  invite_code uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.workspaces enable row level security;

-- Create members
create table public.members (
  id bigserial primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (workspace_id, user_id)
);

alter table public.members enable row level security;

-- Member check helper
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

-- RLS policies for workspaces
create policy "Allow workspace viewing for members" 
  on public.workspaces for select 
  using (public.is_workspace_member(id, auth.uid()));

create policy "Allow workspace viewing for owners" 
  on public.workspaces for select 
  using (owner_id = auth.uid());

create policy "Allow workspace creation for authenticated users" 
  on public.workspaces for insert 
  with check (auth.role() = 'authenticated' and owner_id = auth.uid());

create policy "Allow workspace owner updates" 
  on public.workspaces for update 
  using (owner_id = auth.uid());

create policy "Allow workspace owner deletes" 
  on public.workspaces for delete 
  using (owner_id = auth.uid());

-- RLS policies for members
create policy "Allow member viewing for authenticated users" 
  on public.members for select 
  using (auth.role() = 'authenticated');

create policy "Allow member insert for authenticated users" 
  on public.members for insert 
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

create policy "Allow member deletion for workspace owners or self" 
  on public.members for delete 
  using (
    user_id = auth.uid() or 
    exists (
      select 1 from public.workspaces 
      where workspaces.id = members.workspace_id and workspaces.owner_id = auth.uid()
    )
  );

-- Create expenses
create table public.expenses (
  id bigserial primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  description text not null,
  amount numeric(10,2) not null check (amount > 0),
  category text not null,
  paid_by uuid references public.user_profiles(id) on delete cascade not null,
  split_members uuid[] default null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.expenses enable row level security;

-- RLS policies for expenses
create policy "Allow expense viewing for authenticated users" 
  on public.expenses for select 
  using (auth.role() = 'authenticated');

create policy "Allow expense insertion for members" 
  on public.expenses for insert 
  with check (
    public.is_workspace_member(workspace_id, auth.uid()) and
    public.is_workspace_member(workspace_id, paid_by)
  );

create policy "Allow expense updates for payer or workspace owner" 
  on public.expenses for update 
  using (
    paid_by = auth.uid() or 
    exists (
      select 1 from public.workspaces 
      where workspaces.id = expenses.workspace_id and workspaces.owner_id = auth.uid()
    )
  );

create policy "Allow expense deletion for payer or workspace owner" 
  on public.expenses for delete 
  using (
    paid_by = auth.uid() or 
    exists (
      select 1 from public.workspaces 
      where workspaces.id = expenses.workspace_id and workspaces.owner_id = auth.uid()
    )
  );

-- Create audit_logs
create table public.audit_logs (
  id bigserial primary key,
  user_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  details jsonb,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

create policy "Allow log insertion for authenticated users" 
  on public.audit_logs for insert 
  with check (auth.role() = 'authenticated' and user_id = auth.uid());

create policy "Allow log reading for authenticated users" 
  on public.audit_logs for select 
  using (auth.role() = 'authenticated');

-- Realtime replication configuration
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.members;
