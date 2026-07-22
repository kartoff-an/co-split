
-- Rate limiting Triggers

-- Expense insertion rate limiting (10 expenses / min)
create or replace function public.rate_limit_expenses_insert()
returns trigger as $$
declare
  insert_count int;
begin
  select count(*) into insert_count
  from public.expenses
  where paid_by = auth.uid()
    and timestamp > now() - interval '1 minute';
    
  if insert_count >= 10 then
    raise exception 'Rate limit exceeded. You can only add up to 10 expenses per minute.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_rate_limit_expenses_insert on public.expenses;
create trigger tr_rate_limit_expenses_insert
  before insert on public.expenses
  for each row execute procedure public.rate_limit_expenses_insert();


-- Workspace creation rate limiting (5 workspaces / min)
create or replace function public.rate_limit_workspaces_insert()
returns trigger as $$
declare
  workspace_count int;
begin
  select count(*) into workspace_count
  from public.workspaces
  where owner_id = auth.uid()
    and created_at > now() - interval '1 minute';
    
  if workspace_count >= 5 then
    raise exception 'Rate limit exceeded. You can only create up to 5 workspaces per minute.';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_rate_limit_workspaces_insert on public.workspaces;
create trigger tr_rate_limit_workspaces_insert
  before insert on public.workspaces
  for each row execute procedure public.rate_limit_workspaces_insert();
