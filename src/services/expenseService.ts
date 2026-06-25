import { addExpenseToWorkspace } from '../db/expenses';
import type { Expense } from '../types';

export const addExpense = async (
  workspaceId: string,
  expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>
): Promise<Expense | null> => {
  return addExpenseToWorkspace(workspaceId, expense);
};
