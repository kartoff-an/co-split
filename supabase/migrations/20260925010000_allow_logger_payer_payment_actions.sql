-- Allow both the expense logger and payer to manage payment records too.
drop policy if exists "Allow expense updates for logger or payer" on public.expenses;
create policy "Allow expense updates for logger or payer"
  on public.expenses for update
  using (created_by = auth.uid() or paid_by = auth.uid());

drop policy if exists "Allow expense deletion for logger or payer" on public.expenses;
create policy "Allow expense deletion for logger or payer"
  on public.expenses for delete
  using (created_by = auth.uid() or paid_by = auth.uid());