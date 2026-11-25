import type { components } from '@/api/generated/schema';

export type Expense = components['schemas']['ExpenseResponse'];
export type ExpenseCreate = components['schemas']['ExpenseCreate'];
export type ExpenseUpdate = components['schemas']['ExpenseUpdate'];

export interface ExpenseFilters {
  category?: string;
  paid_by?: string;
  created_by?: string;
  from_date?: string;
  to_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
}

export type ExpenseFilterKey = keyof ExpenseFilters;
