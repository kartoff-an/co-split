
-- Migration: Add Expense Creator Column
-- Description: Adds created_by column to expenses table

alter table public.expenses 
add column if not exists created_by uuid references public.user_profiles(id) on delete cascade default auth.uid();

update public.expenses 
set created_by = paid_by 
where created_by is null;
