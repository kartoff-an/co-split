import { api } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { requireApiData, requireApiSuccess } from '@/api/response';
import type { ApiResponse, PaginatedData, Expense, ExpenseCreate, ExpenseUpdate } from '@/api/types';

const normalizeExpense = (expense: Expense): Expense => ({ ...expense, amount: expense.amount });

export const fetchWorkspaceExpensesPaginated = async (
  workspaceId: string,
  page: number,
  pageSize: number
): Promise<{ expenses: Expense[]; hasMore: boolean }> => {
  const response = await api.get<ApiResponse<PaginatedData<Expense>>>(API_ENDPOINTS.workspaces.expenses(workspaceId), {
    params: {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    },
  });

  const result = requireApiData(response);

  return {
    expenses: result.items.map(normalizeExpense),
    hasMore: result.has_more,
  };
};

export const addExpense = async (workspaceId: string, expense: ExpenseCreate): Promise<Expense> => {
  const response = await api.post<ApiResponse<Expense>>(API_ENDPOINTS.expenses.base, {
    workspace_id: workspaceId,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    paid_by: expense.paid_by,
    split_members: expense.split_members,
  });

  return normalizeExpense(requireApiData(response));
};

export const updateExpense = async (expenseId: number | string, updates: ExpenseUpdate): Promise<Expense> => {
  const response = await api.patch<ApiResponse<Expense>>(API_ENDPOINTS.expenses.detail(Number(expenseId)), updates);

  return normalizeExpense(requireApiData(response));
};

export const deleteExpense = async (expenseId: number | string): Promise<void> => {
  const response = await api.delete<ApiResponse<null>>(API_ENDPOINTS.expenses.detail(Number(expenseId)));

  requireApiSuccess(response);
};
