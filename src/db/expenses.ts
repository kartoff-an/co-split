import { supabase } from '../lib/supabase';
import type { Expense } from '../types';

export const fetchWorkspaceExpensesPaginated = async (
  workspaceId: string,
  page: number,
  pageSize: number
): Promise<{ expenses: Expense[]; hasMore: boolean }> => {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await supabase
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('workspace_id', workspaceId)
    .order('timestamp', { ascending: false })
    .range(from, to);

  if (error) throw error;
  const expenses = data || [];
  const hasMore = count
    ? from + expenses.length < count
    : expenses.length === pageSize;
  return { expenses, hasMore };
};

export const addExpenseToWorkspace = async (
  workspaceId: string,
  expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>
): Promise<Expense> => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([
      {
        ...expense,
        workspace_id: workspaceId,
        timestamp: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};
