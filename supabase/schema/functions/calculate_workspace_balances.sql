
-- Function: calculate_workspace_balances
-- Description: Calculates net member balances and greedy settlement transactions

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
  
  creditors jsonb := '[]'::jsonb;
  debtors jsonb := '[]'::jsonb;
  settlements jsonb := '[]'::jsonb;
  balances_map jsonb := '{}'::jsonb;
  balances_list jsonb := '[]'::jsonb;
  
  c_idx int := 0;
  d_idx int := 0;
  c_len int := 0;
  d_len int := 0;
  
  creditor_ids uuid[] := array[]::uuid[];
  creditor_names text[] := array[]::text[];
  creditor_bals numeric[] := array[]::numeric[];
  debtor_ids uuid[] := array[]::uuid[];
  debtor_names text[] := array[]::text[];
  debtor_bals numeric[] := array[]::numeric[];
  
  creditor_bal numeric;
  debtor_bal numeric;
  settle_amount numeric;
  
  r_limit record;
begin
  -- Access check
  if not public.is_workspace_member(w_id, auth.uid()) then
    raise exception 'Access denied: not a workspace member';
  end if;

  select * into r_limit from public.api_rate_limits
  where user_id = auth.uid() and api_name = 'calculate_workspace_balances';
  
  if found then
    if r_limit.last_call > now() - interval '1 minute' then
      if r_limit.call_count >= 30 then
        raise exception 'Rate limit exceeded for calculate_workspace_balances. Please wait before making more requests.';
      else
        update public.api_rate_limits
        set call_count = call_count + 1
        where user_id = auth.uid() and api_name = 'calculate_workspace_balances';
      end if;
    else
      update public.api_rate_limits
      set call_count = 1, last_call = now()
      where user_id = auth.uid() and api_name = 'calculate_workspace_balances';
    end if;
  else
    insert into public.api_rate_limits (user_id, api_name, last_call, call_count)
    values (auth.uid(), 'calculate_workspace_balances', now(), 1);
  end if;

  -- Initialize balances map
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

  if member_count = 0 then
    return jsonb_build_object(
      'balances', '[]'::jsonb,
      'settlements', '[]'::jsonb,
      'total_workspace_cost', 0.0,
      'average_cost_per_person', 0.0
    );
  end if;

  -- Aggregate expenses
  for e_record in 
    select amount, paid_by, split_members, category 
    from public.expenses 
    where workspace_id = w_id
  loop
    -- Exclude settlement / debt payment transactions from total workspace cost
    if e_record.category is null or (e_record.category != 'Payment' and e_record.category != 'Settlement') then
      total_cost := total_cost + e_record.amount;
    end if;
    
    if e_record.split_members is not null and array_length(e_record.split_members, 1) > 0 then
      split_count := array_length(e_record.split_members, 1);
    else
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

  -- Construct balances list and separate creditors/debtors
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
        creditor_ids := array_append(creditor_ids, m_record.user_id);
        creditor_names := array_append(creditor_names, m_record.display_name);
        creditor_bals := array_append(creditor_bals, net_bal);
      elsif net_bal < -0.01 then
        debtor_ids := array_append(debtor_ids, m_record.user_id);
        debtor_names := array_append(debtor_names, m_record.display_name);
        debtor_bals := array_append(debtor_bals, net_bal);
      end if;
    end;
  end loop;

  c_len := array_length(creditor_bals, 1);
  d_len := array_length(debtor_bals, 1);
  
  -- Greedy Settle-Up matching
  while c_idx < c_len and d_idx < d_len loop
    creditor_bal := creditor_bals[c_idx + 1];
    debtor_bal := debtor_bals[d_idx + 1];
    
    settle_amount := least(creditor_bal, abs(debtor_bal));
    
    if settle_amount > 0.01 then
      settlements := settlements || jsonb_build_object(
        'from', debtor_names[d_idx + 1],
        'from_id', debtor_ids[d_idx + 1],
        'to', creditor_names[c_idx + 1],
        'to_id', creditor_ids[c_idx + 1],
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
