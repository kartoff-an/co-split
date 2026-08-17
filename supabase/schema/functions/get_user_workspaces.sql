-- Function: get_user_workspaces
-- Description: Retrieves user workspaces with member count, total workspace cost (excluding payments), and user net balance

create or replace function public.get_user_workspaces(u_id uuid)
returns table (
  id uuid,
  name text,
  created_at timestamp with time zone,
  owner_id uuid,
  owner_name text,
  currency text,
  total_expenses numeric,
  member_count bigint,
  user_net_balance numeric
) as $$
begin
  if auth.uid() <> u_id then
    raise exception 'Access denied';
  end if;

  return query
  with user_workspace_ids as (
    select m.workspace_id
    from public.members m
    where m.user_id = u_id
  ),
  workspace_details as (
    select 
      w.id as w_id,
      w.name as w_name,
      w.created_at as w_created_at,
      w.owner_id as w_owner_id,
      p.display_name as w_owner_name,
      coalesce(w.currency, 'PHP') as w_currency
    from public.workspaces w
    join user_workspace_ids uw on w.id = uw.workspace_id
    left join public.user_profiles p on w.owner_id = p.id
  ),
  workspace_member_counts as (
    select 
      m.workspace_id,
      count(*) as m_count
    from public.members m
    where m.workspace_id in (select w_id from workspace_details)
    group by m.workspace_id
  ),
  workspace_total_expenses as (
    select 
      e.workspace_id,
      coalesce(sum(e.amount), 0) as tot_exp
    from public.expenses e
    where e.workspace_id in (select w_id from workspace_details)
      and (e.category is null or (e.category != 'Payment' and e.category != 'Settlement'))
    group by e.workspace_id
  ),
  expense_splits as (
    select 
      e.id as expense_id,
      e.workspace_id,
      e.amount,
      e.paid_by,
      coalesce(
        case when array_length(e.split_members, 1) > 0 then array_length(e.split_members, 1) else null end,
        (select count(*) from public.members m2 where m2.workspace_id = e.workspace_id)
      ) as split_count,
      e.split_members
    from public.expenses e
    where e.workspace_id in (select w_id from workspace_details)
  ),
  user_expense_shares as (
    select 
      es.workspace_id,
      sum(
        (case when es.paid_by = u_id then es.amount else 0 end) -
        (case 
          when es.split_members is not null and array_length(es.split_members, 1) > 0 then
            case when u_id = any(es.split_members) then (es.amount / nullif(es.split_count, 0)) else 0 end
          else
            (es.amount / nullif(es.split_count, 0))
        end)
      ) as net_bal
    from expense_splits es
    group by es.workspace_id
  )
  select 
    wd.w_id,
    wd.w_name,
    wd.w_created_at,
    wd.w_owner_id,
    wd.w_owner_name,
    wd.w_currency,
    coalesce(round(te.tot_exp, 2), 0)::numeric,
    coalesce(mc.m_count, 1)::bigint,
    coalesce(round(ues.net_bal, 2), 0)::numeric
  from workspace_details wd
  left join workspace_member_counts mc on wd.w_id = mc.workspace_id
  left join workspace_total_expenses te on wd.w_id = te.workspace_id
  left join user_expense_shares ues on wd.w_id = ues.workspace_id
  order by wd.w_created_at desc;
end;
$$ language plpgsql security definer;
