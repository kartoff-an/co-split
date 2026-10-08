create table if not exists public.expense_email_outbox (
  id bigserial primary key,
  expense_id bigint not null references public.expenses(id) on delete cascade,
  recipient_user_id uuid not null references public.user_profiles(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'sent', 'skipped', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamp with time zone not null default now(),
  locked_until timestamp with time zone,
  sent_at timestamp with time zone,
  last_error text,
  created_at timestamp with time zone not null default now(),
  unique (expense_id, recipient_user_id)
);

alter table public.expense_email_outbox enable row level security;
revoke all on public.expense_email_outbox from anon, authenticated;
grant all on public.expense_email_outbox to service_role;

create index if not exists expense_email_outbox_pending_idx
  on public.expense_email_outbox (available_at, id)
  where status = 'pending';

create index if not exists expense_email_outbox_processing_idx
  on public.expense_email_outbox (locked_until, id)
  where status = 'processing';

create or replace function public.enqueue_expense_email_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.category in ('Payment', 'Settlement') then
    return new;
  end if;

  insert into public.expense_email_outbox (expense_id, recipient_user_id)
  select new.id, members.user_id
  from public.members as members
  where members.workspace_id = new.workspace_id
    and (new.created_by is null or members.user_id <> new.created_by)
  on conflict (expense_id, recipient_user_id) do nothing;

  return new;
end;
$$;

revoke all on function public.enqueue_expense_email_notifications()
  from public, anon, authenticated;

create trigger expenses_enqueue_email_notifications
  after insert on public.expenses
  for each row
  execute function public.enqueue_expense_email_notifications();

create or replace function public.claim_expense_email_jobs(batch_size integer default 20)
returns setof public.expense_email_outbox
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.expense_email_outbox
  set status = 'failed',
      locked_until = null,
      last_error = coalesce(last_error, 'Worker lease expired after the final attempt.')
  where status = 'processing'
    and locked_until < now()
    and attempts >= 5;

  return query
  with candidates as (
    select outbox.id
    from public.expense_email_outbox as outbox
    where outbox.attempts < 5
      and (
        (outbox.status = 'pending' and outbox.available_at <= now())
        or (outbox.status = 'processing' and outbox.locked_until < now())
      )
    order by outbox.available_at, outbox.id
    for update skip locked
    limit greatest(1, least(coalesce(batch_size, 20), 100))
  )
  update public.expense_email_outbox as outbox
  set status = 'processing',
      attempts = outbox.attempts + 1,
      locked_until = now() + interval '5 minutes',
      last_error = null
  from candidates
  where outbox.id = candidates.id
  returning outbox.*;
end;
$$;

revoke all on function public.claim_expense_email_jobs(integer)
  from public, anon, authenticated;
grant execute on function public.claim_expense_email_jobs(integer) to service_role;
