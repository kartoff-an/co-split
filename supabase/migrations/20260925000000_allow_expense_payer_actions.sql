-- Allow both the expense logger and payer to manage regular expenses.
drop policy if exists "Allow expense updates for logger" on public.expenses;
create policy "Allow expense updates for logger or payer"
  on public.expenses for update
  using (
    (
      category not in ('Payment', 'Settlement') and
      (created_by = auth.uid() or paid_by = auth.uid())
    ) or
    (
      category in ('Payment', 'Settlement') and
      paid_by = auth.uid()
    )
  );

drop policy if exists "Allow expense deletion for logger" on public.expenses;
create policy "Allow expense deletion for logger or payer"
  on public.expenses for delete
  using (
    (
      category not in ('Payment', 'Settlement') and
      (created_by = auth.uid() or paid_by = auth.uid())
    ) or
    (
      category in ('Payment', 'Settlement') and
      paid_by = auth.uid()
    )
  );