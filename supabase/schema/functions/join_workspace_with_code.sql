
-- Function: join_workspace_with_code
-- Description: Joins a user to a workspace using an invite code UUID

create or replace function public.join_workspace_with_code(invite_uuid uuid)
returns uuid as $$
declare
  w_record record;
  m_count int;
  limit_val int;
  r_limit record;
begin
  -- Secure check
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select * into r_limit from public.api_rate_limits
  where user_id = auth.uid() and api_name = 'join_workspace_with_code';
  
  if found then
    if r_limit.last_call > now() - interval '1 minute' then
      if r_limit.call_count >= 5 then
        raise exception 'Rate limit exceeded. Please wait before attempting to join again.';
      else
        update public.api_rate_limits
        set call_count = call_count + 1
        where user_id = auth.uid() and api_name = 'join_workspace_with_code';
      end if;
    else
      update public.api_rate_limits
      set call_count = 1, last_call = now()
      where user_id = auth.uid() and api_name = 'join_workspace_with_code';
    end if;
  else
    insert into public.api_rate_limits (user_id, api_name, last_call, call_count)
    values (auth.uid(), 'join_workspace_with_code', now(), 1);
  end if;

  select * into w_record from public.workspaces where invite_code = invite_uuid;
  if not found then
    raise exception 'Invalid invite link or code.';
  end if;
  
  if public.is_workspace_member(w_record.id, auth.uid()) then
    return w_record.id;
  end if;
  
  -- Check member limit
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
