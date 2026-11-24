import type { components } from '@/api/generated/schema';

export type Expense = components['schemas']['ExpenseResponse'];
export type ExpenseCreate = components['schemas']['ExpenseCreate'];
export type ExpenseUpdate = components['schemas']['ExpenseUpdate'];