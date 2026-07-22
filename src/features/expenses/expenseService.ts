import {
  addExpenseToWorkspace,
  updateExpenseInWorkspace,
  deleteExpenseFromWorkspace,
} from './expenses';
import type { Expense } from '../../types';

export const addExpense = async (
  workspaceId: string,
  expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>
): Promise<Expense | null> => {
  return addExpenseToWorkspace(workspaceId, expense);
};

export const updateExpense = async (
  expenseId: number | string,
  updates: Partial<Omit<Expense, 'id' | 'workspace_id' | 'timestamp'>>
): Promise<Expense | null> => {
  return updateExpenseInWorkspace(expenseId, updates);
};

export const deleteExpense = async (
  expenseId: number | string
): Promise<void> => {
  return deleteExpenseFromWorkspace(expenseId);
};

