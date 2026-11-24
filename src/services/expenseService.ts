import { api } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { requireApiData, requireApiSuccess } from '@/api/response';
import type { ApiResponse } from '@/api/types';
import type { Expense } from '@/types';

interface PaginatedData<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

type ExpenseCreateInput = Omit<Expense, 'id' | 'timestamp' | 'workspace_id' | 'created_by'>;

type ExpenseUpdateInput = Partial<Omit<Expense, 'id' | 'timestamp' | 'workspace_id' | 'created_by'>>;

interface ExpenseApiResponse extends Omit<Expense, 'amount'> {
  amount: number | string;
}

const normalizeExpense = (expense: ExpenseApiResponse): Expense => ({ ...expense, amount: Number(expense.amount) });

export const fetchWorkspaceExpensesPaginated = async (
  workspaceId: string,
  page: number,
  pageSize: number
): Promise<{ expenses: Expense[]; hasMore: boolean }> => {
  const response = await api.get<ApiResponse<PaginatedData<ExpenseApiResponse>>>(
    API_ENDPOINTS.workspaces.expenses(workspaceId),
    {
      params: {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      },
    }
  );

  const result = requireApiData(response);

  return {
    expenses: result.items.map(normalizeExpense),
    hasMore: result.has_more,
  };
};

export const addExpense = async (workspaceId: string, expense: ExpenseCreateInput): Promise<Expense> => {
  const response = await api.post<ApiResponse<ExpenseApiResponse>>(API_ENDPOINTS.expenses.base, {
    workspace_id: workspaceId,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    paid_by: expense.paid_by,
    split_members: expense.split_members,
  });

  return normalizeExpense(requireApiData(response));
};

export const updateExpense = async (expenseId: number | string, updates: ExpenseUpdateInput): Promise<Expense> => {
  const response = await api.patch<ApiResponse<ExpenseApiResponse>>(
    API_ENDPOINTS.expenses.detail(Number(expenseId)),
    updates
  );

  return normalizeExpense(requireApiData(response));
};

export const deleteExpense = async (expenseId: number | string): Promise<void> => {
  const response = await api.delete<ApiResponse<null>>(API_ENDPOINTS.expenses.detail(Number(expenseId)));

  requireApiSuccess(response);
};
