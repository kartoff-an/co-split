
-- Migration: Core Tables Initialization
-- Description: DDL definitions for all public tables and extensions

create extension if not exists "uuid-ossp";

grant usage on schema public to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;

grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;

-- user_profiles
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.user_profiles enable row level security;

-- workspaces
create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  owner_id uuid references public.user_profiles(id) on delete cascade not null,
  allowed_members int default 10 check (allowed_members >= 1),
  currency text default 'PHP' not null check (currency in ('PHP', 'USD')),
  invite_code uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.workspaces enable row level security;

-- members
create table if not exists public.members (
  id bigserial primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (workspace_id, user_id)
);
alter table public.members enable row level security;

-- expenses
create table if not exists public.expenses (
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

-- audit_logs
create table if not exists public.audit_logs (
  id bigserial primary key,
  user_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  details jsonb,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.audit_logs enable row level security;

-- api_rate_limits
create table if not exists public.api_rate_limits (
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  api_name text not null,
  last_call timestamp with time zone default timezone('utc'::text, now()) not null,
  call_count int default 1 not null,
  primary key (user_id, api_name)
);
alter table public.api_rate_limits enable row level security;