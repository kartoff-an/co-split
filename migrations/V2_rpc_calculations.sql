-- 1. Create calculate_workspace_balances function
create or replace function public.calculate_workspace_balances(w_id uuid)
returns jsonb as $$
declare
  total_cost numeric := 0;
  avg_cost numeric := 0;
  member_count int := 0;
  m_record record;
  e_record record;
  split_member_id uuid;
  split_count int;
  amount_per_person numeric;
  
  -- Settle up greedy algorithm variables
  creditors jsonb := '[]'::jsonb;
  debtors jsonb := '[]'::jsonb;
  settlements jsonb := '[]'::jsonb;
  balances_map jsonb := '{}'::jsonb;
  balances_list jsonb := '[]'::jsonb;
  
  c_idx int := 0;
  d_idx int := 0;
  c_len int := 0;
  d_len int := 0;
  
  creditor_names text[] := array[]::text[];
  creditor_bals numeric[] := array[]::numeric[];
  debtor_names text[] := array[]::text[];
  debtor_bals numeric[] := array[]::numeric[];
  
  creditor_bal numeric;
  debtor_bal numeric;
  settle_amount numeric;
begin
  -- Access check: Only allow workspace members
  if not public.is_workspace_member(w_id, auth.uid()) then
    raise exception 'Access denied: not a workspace member';
  end if;

  -- 1. Initialize balances map for all members of the workspace
  for m_record in 
    select m.user_id, p.display_name 
    from public.members m
    join public.user_profiles p on m.user_id = p.id
    where m.workspace_id = w_id
  loop
    balances_map := jsonb_set(
      balances_map, 
      array[m_record.user_id::text], 
      jsonb_build_object('member_id', m_record.user_id, 'member_name', m_record.display_name, 'net_balance', 0.0)
    );
    member_count := member_count + 1;
  end loop;

  -- If there are no members, return early
  if member_count = 0 then
    return jsonb_build_object(
      'balances', '[]'::jsonb,
      'settlements', '[]'::jsonb,
      'total_workspace_cost', 0.0,
      'average_cost_per_person', 0.0
    );
  end if;

  -- 2. Aggregate expenses
  for e_record in 
    select amount, paid_by, split_members 
    from public.expenses 
    where workspace_id = w_id
  loop
    total_cost := total_cost + e_record.amount;
    
    -- Determine split members
    if e_record.split_members is not null and array_length(e_record.split_members, 1) > 0 then
      split_count := array_length(e_record.split_members, 1);
    else
      -- split among all workspace members
      split_count := member_count;
    end if;
    
    amount_per_person := e_record.amount / split_count;
    
    -- Credit the payer
    if balances_map ? e_record.paid_by::text then
      balances_map := jsonb_set(
        balances_map, 
        array[e_record.paid_by::text, 'net_balance'], 
        to_jsonb((balances_map->e_record.paid_by::text->>'net_balance')::numeric + e_record.amount)
      );
    end if;
    
    -- Debit split members
    if e_record.split_members is not null and array_length(e_record.split_members, 1) > 0 then
      foreach split_member_id in array e_record.split_members loop
        if balances_map ? split_member_id::text then
          balances_map := jsonb_set(
            balances_map, 
            array[split_member_id::text, 'net_balance'], 
            to_jsonb((balances_map->split_member_id::text->>'net_balance')::numeric - amount_per_person)
          );
        end if;
      end loop;
    else
      -- Debit everyone in the workspace
      for m_record in 
        select m.user_id 
        from public.members m 
        where m.workspace_id = w_id
      loop
        balances_map := jsonb_set(
          balances_map, 
          array[m_record.user_id::text, 'net_balance'], 
          to_jsonb((balances_map->m_record.user_id::text->>'net_balance')::numeric - amount_per_person)
        );
      end loop;
    end if;
  end loop;

  avg_cost := total_cost / member_count;

  -- 3. Construct balances list and separate creditors/debtors
  for m_record in 
    select m.user_id, p.display_name 
    from public.members m
    join public.user_profiles p on m.user_id = p.id
    where m.workspace_id = w_id
  loop
    declare
      net_bal numeric := round((balances_map->m_record.user_id::text->>'net_balance')::numeric, 2);
    begin
      balances_list := balances_list || jsonb_build_object(
        'member_id', m_record.user_id,
        'member_name', m_record.display_name,
        'net_balance', net_bal
      );
      
      if net_bal > 0.01 then
        creditor_names := array_append(creditor_names, m_record.display_name);
        creditor_bals := array_append(creditor_bals, net_bal);
      elsif net_bal < -0.01 then
        debtor_names := array_append(debtor_names, m_record.display_name);
        debtor_bals := array_append(debtor_bals, net_bal);
      end if;
    end;
  end loop;

  c_len := array_length(creditor_bals, 1);
  d_len := array_length(debtor_bals, 1);
  
  -- 4. Greedy Settle-Up matching
  while c_idx < c_len and d_idx < d_len loop
    creditor_bal := creditor_bals[c_idx + 1];
    debtor_bal := debtor_bals[d_idx + 1];
    
    settle_amount := least(creditor_bal, abs(debtor_bal));
    
    if settle_amount > 0.01 then
      settlements := settlements || jsonb_build_object(
        'from', debtor_names[d_idx + 1],
        'to', creditor_names[c_idx + 1],
        'amount', round(settle_amount, 2)
      );
    end if;
    
    creditor_bal := creditor_bal - settle_amount;
    debtor_bal := debtor_bal + settle_amount;
    
    creditor_bals[c_idx + 1] := creditor_bal;
    debtor_bals[d_idx + 1] := debtor_bal;
    
    if abs(creditor_bal) < 0.01 then
      c_idx := c_idx + 1;
    end if;
    if abs(debtor_bal) < 0.01 then
      d_idx := d_idx + 1;
    end if;
  end loop;

  return jsonb_build_object(
    'balances', balances_list,
    'settlements', settlements,
    'total_workspace_cost', round(total_cost, 2),
    'average_cost_per_person', round(avg_cost, 2)
  );
end;
$$ language plpgsql security definer;

-- 2. Create get_user_workspaces function
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
    group by e.workspace_id
  ),
  expense_splits as (
    select 
      e.id as expense_id,
      e.workspace_id,
      e.amount,
      e.paid_by,
      coalesce(
        array_length(e.split_members, 1),
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
        case 
          when es.paid_by = u_id then
            es.amount - (es.amount / es.split_count)
          else
            case 
              when es.split_members is null or u_id = any(es.split_members) then
                - (es.amount / es.split_count)
              else
                0
            end
        end
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
    coalesce(te.tot_exp, 0)::numeric,
    coalesce(mc.m_count, 1)::bigint,
    coalesce(ues.net_bal, 0)::numeric
  from workspace_details wd
  left join workspace_member_counts mc on wd.w_id = mc.workspace_id
  left join workspace_total_expenses te on wd.w_id = te.workspace_id
  left join user_expense_shares ues on wd.w_id = ues.workspace_id
  order by wd.w_created_at desc;
end;
$$ language plpgsql security definer;

-- 3. Create join_workspace_with_code function
drop function if exists public.join_workspace_with_code(uuid, uuid) cascade;
create or replace function public.join_workspace_with_code(invite_uuid uuid)
returns uuid as $$
declare
  w_record record;
  m_count int;
  limit_val int;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into w_record from public.workspaces where invite_code = invite_uuid;
  if not found then
    raise exception 'Invalid invite link or code.';
  end if;
  
  if public.is_workspace_member(w_record.id, auth.uid()) then
    return w_record.id;
  end if;
  
  select count(*) into m_count from public.members where workspace_id = w_record.id;
  limit_val := coalesce(w_record.allowed_members, 10);
  if m_count >= limit_val then
    raise exception 'This workspace has reached its member limit of %.', limit_val;
  end if;
  
  insert into public.members (workspace_id, user_id)
  values (w_record.id, auth.uid());
  
  return w_record.id;
end;
$$ language plpgsql security definer;

-- 4. Create regenerate_workspace_invite_code function
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
