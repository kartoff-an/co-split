import { useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Expense, ExpenseCreate, ExpenseUpdate, WorkspaceUpdate } from '@/api/types';

import type { ExpenseFilters } from '@/api/types';
import { queryKeys } from '@/api/queryKeys';

import * as workspaceService from '@/services/workspaceService';
import * as expenseService from '@/services/expenseService';

const DEFAULT_EXPENSE_PAGE_SIZE = 10;

export const useWorkspace = (workspaceId: string, expenseFilters: ExpenseFilters = {}) => {
  const queryClient = useQueryClient();

  const [actionError, setActionError] = useState<string | null>(null);

  const pageSize = DEFAULT_EXPENSE_PAGE_SIZE;

  // Normalize filters before using them in query keys and API requests.
  const normalizedFilters = useMemo(() => expenseService.normalizeExpenseFilters(expenseFilters), [expenseFilters]);

  // --------------------------------------------------
  // Workspace details
  // --------------------------------------------------

  const {
    data: workspaceDetails,
    isLoading: detailsLoading,
    error: detailsError,
  } = useQuery({
    queryKey: queryKeys.workspace.detail(workspaceId),
    queryFn: () => workspaceService.getWorkspaceDetails(workspaceId),
    enabled: !!workspaceId,
  });

  // --------------------------------------------------
  // Workspace expenses
  // --------------------------------------------------

  const {
    data: infiniteExpensesData,
    isLoading: expensesLoading,
    isFetching: expensesFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.expenses.list(workspaceId, normalizedFilters, pageSize),

    queryFn: ({ pageParam }) =>
      expenseService.fetchWorkspaceExpensesPaginated(workspaceId, pageParam, pageSize, normalizedFilters),

    initialPageParam: 0,

    getNextPageParam: (lastPage) => {
      if (!lastPage.has_more) {
        return undefined;
      }

      return lastPage.offset + lastPage.limit;
    },

    enabled: !!workspaceId,
  });

  // Flatten the currently loaded pages.
  const expenses = useMemo<Expense[]>(() => {
    return infiniteExpensesData?.pages.flatMap((page) => page.items) ?? [];
  }, [infiniteExpensesData]);

  const expensesTotal = infiniteExpensesData?.pages[0]?.total ?? 0;

  // --------------------------------------------------
  // Shared cache invalidation
  // --------------------------------------------------

  const invalidateExpenseQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.expenses.workspace(workspaceId),
      }),

      queryClient.invalidateQueries({
        queryKey: queryKeys.workspace.detail(workspaceId),
      }),

      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      }),
    ]);
  };

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const loadMoreExpenses = async () => {
    if (!workspaceId || isFetchingNextPage || !hasNextPage) {
      return;
    }

    try {
      setActionError(null);
      await fetchNextPage();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to load more expenses');
    }
  };

  // --------------------------------------------------
  // Create expense
  // --------------------------------------------------

  const addExpense = async (expense: ExpenseCreate) => {
    try {
      setActionError(null);

      const newExpense = await expenseService.addExpense(workspaceId, expense);

      if (!newExpense) {
        throw new Error('Failed to add expense.');
      }

      await invalidateExpenseQueries();

      return newExpense;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add expense');

      throw err;
    }
  };

  // --------------------------------------------------
  // Update expense
  // --------------------------------------------------

  const updateExpense = async (expenseId: number | string, updates: ExpenseUpdate) => {
    try {
      setActionError(null);

      const updatedExpense = await expenseService.updateExpense(expenseId, updates);

      if (!updatedExpense) {
        throw new Error('Failed to update expense.');
      }

      await invalidateExpenseQueries();

      return updatedExpense;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update expense');

      throw err;
    }
  };

  // --------------------------------------------------
  // Delete expense
  // --------------------------------------------------

  const deleteExpense = async (expenseId: number | string) => {
    try {
      setActionError(null);

      await expenseService.deleteExpense(expenseId);

      await invalidateExpenseQueries();

      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete expense');

      throw err;
    }
  };

  // --------------------------------------------------
  // Remove workspace member
  // --------------------------------------------------

  const removeMember = async (userId: string) => {
    try {
      setActionError(null);

      const success = await workspaceService.removeMember(workspaceId, userId);

      if (success) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.workspace.detail(workspaceId),
          }),

          queryClient.invalidateQueries({
            queryKey: queryKeys.workspaces.all,
          }),

          queryClient.invalidateQueries({
            queryKey: queryKeys.balances.detail(workspaceId),
          }),

          queryClient.invalidateQueries({
            queryKey: queryKeys.expenses.workspace(workspaceId),
          }),
        ]);
      }

      return success;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to remove member');

      return false;
    }
  };

  // --------------------------------------------------
  // Update workspace
  // --------------------------------------------------

  const updateWorkspace = async (updates: WorkspaceUpdate) => {
    try {
      setActionError(null);

      const updated = await workspaceService.updateWorkspaceDetails(workspaceId, updates);

      if (updated) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: queryKeys.workspace.detail(workspaceId),
          }),

          queryClient.invalidateQueries({
            queryKey: queryKeys.workspaces.all,
          }),
        ]);
      }

      return updated;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update workspace');

      return null;
    }
  };

  // --------------------------------------------------
  // Delete workspace
  // --------------------------------------------------

  const deleteWorkspace = async () => {
    try {
      setActionError(null);

      await workspaceService.deleteWorkspace(workspaceId);

      queryClient.removeQueries({
        queryKey: queryKeys.workspace.detail(workspaceId),
      });

      queryClient.removeQueries({
        queryKey: queryKeys.expenses.workspace(workspaceId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.workspaces.all,
      });

      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete workspace');

      return false;
    }
  };

  // --------------------------------------------------
  // Regenerate invite code
  // --------------------------------------------------

  const regenerateInvite = async () => {
    if (!workspaceId) {
      return null;
    }

    try {
      setActionError(null);

      const newCode = await workspaceService.regenerateInviteCode(workspaceId);

      if (newCode) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.detail(workspaceId),
        });
      }

      return newCode;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to regenerate invite code');

      return null;
    }
  };

  // --------------------------------------------------
  // Error state
  // --------------------------------------------------

  const error =
    actionError ||
    (detailsError ? (detailsError instanceof Error ? detailsError.message : 'Failed to load workspace') : null);

  // --------------------------------------------------
  // Public hook API
  // --------------------------------------------------

  return {
    // Workspace data
    workspace: workspaceDetails?.workspace ?? null,
    members: workspaceDetails?.members ?? [],

    // Expense data
    expenses,
    expensesTotal,

    // Loading states
    loading: detailsLoading || expensesLoading,
    detailsLoading,
    expensesLoading,
    expensesFetching,
    loadingMore: isFetchingNextPage,

    // Pagination
    hasMore: !!hasNextPage,
    loadMoreExpenses,

    // Error handling
    error,
    clearError: () => setActionError(null),

    // Expense mutations
    addExpense,
    updateExpense,
    deleteExpense,

    // Workspace mutations
    removeMember,
    updateWorkspace,
    deleteWorkspace,
    regenerateInvite,

    // Refetch
    refetch: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace.detail(workspaceId),
        }),

        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.workspace(workspaceId),
        }),
      ]);
    },
  };
};
