import { useMemo, useState } from 'react';
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Expense, Member, Workspace } from '../../types';
import * as workspaceService from './workspaceService';
import * as expenseService from '../expenses/expenseService';
import { fetchWorkspaceExpensesPaginated } from '../expenses/expenses';

export const useWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const pageSize = 10;

  const {
    data: workspaceDetails,
    isLoading: detailsLoading,
    error: detailsError,
  } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceService.getWorkspaceDetails(workspaceId),
    enabled: !!workspaceId,
  });

  const {
    data: infiniteExpensesData,
    isLoading: expensesLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ['workspace-expenses', workspaceId],
    queryFn: ({ pageParam = 1 }) =>
      fetchWorkspaceExpensesPaginated(workspaceId, pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    enabled: !!workspaceId,
  });

  const expenses = useMemo(() => {
    return (
      infiniteExpensesData?.pages.flatMap((page) => page.expenses) ?? []
    );
  }, [infiniteExpensesData]);

  const loadMoreExpenses = async () => {
    if (!workspaceId || isFetchingNextPage || !hasNextPage) return;
    try {
      await fetchNextPage();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to load more expenses'
      );
    }
  };

  const addExpense = async (
    expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>
  ) => {
    try {
      const newExpense = await expenseService.addExpense(workspaceId, expense);
      if (!newExpense) throw new Error('Failed to add expense.');

      queryClient.setQueryData(
        ['workspace-expenses', workspaceId],
        (
          old:
            | {
              pages: { expenses: Expense[]; hasMore: boolean }[];
              pageParams: number[];
            }
            | undefined
        ) => {
          if (!old || !old.pages.length) return old;
          const firstPage = old.pages[0];
          const newFirstPage = {
            ...firstPage,
            expenses: [
              newExpense,
              ...firstPage.expenses.filter((e) => e.id !== newExpense.id),
            ],
          };
          return {
            ...old,
            pages: [newFirstPage, ...old.pages.slice(1)],
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });

      return newExpense;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to add expense'
      );
      throw err;
    }
  };

  const updateExpense = async (
    expenseId: number | string,
    updates: Partial<Omit<Expense, 'id' | 'workspace_id' | 'timestamp'>>
  ) => {
    try {
      const updatedExpense = await expenseService.updateExpense(
        expenseId,
        updates
      );
      if (!updatedExpense) throw new Error('Failed to update expense.');

      queryClient.setQueryData(
        ['workspace-expenses', workspaceId],
        (
          old:
            | {
              pages: { expenses: Expense[]; hasMore: boolean }[];
              pageParams: number[];
            }
            | undefined
        ) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              expenses: page.expenses.map((e) =>
                e.id === updatedExpense.id ? updatedExpense : e
              ),
            })),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });

      return updatedExpense;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to update expense'
      );
      throw err;
    }
  };

  const deleteExpense = async (expenseId: number | string) => {
    try {
      await expenseService.deleteExpense(expenseId);

      queryClient.setQueryData(
        ['workspace-expenses', workspaceId],
        (
          old:
            | {
              pages: { expenses: Expense[]; hasMore: boolean }[];
              pageParams: number[];
            }
            | undefined
        ) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              expenses: page.expenses.filter(
                (e) => e.id !== Number(expenseId)
              ),
            })),
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });

      return true;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete expense'
      );
      throw err;
    }
  };

  const addMember = async (userId: string) => {
    try {
      const newMember = await workspaceService.addMemberToWorkspaceWithCheck(
        workspaceId,
        userId
      );
      if (newMember) {
        queryClient.setQueryData(
          ['workspace', workspaceId],
          (
            old:
              | { workspace: Workspace | null; members: Member[] }
              | undefined
          ) => {
            if (!old) return old;
            return {
              ...old,
              members: [
                ...old.members.filter((m) => m.id !== userId),
                newMember,
              ],
            };
          }
        );
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      }
      return newMember;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to add member'
      );
      return null;
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const success = await workspaceService.removeMember(workspaceId, userId);
      if (success) {
        queryClient.setQueryData(
          ['workspace', workspaceId],
          (
            old:
              | { workspace: Workspace | null; members: Member[] }
              | undefined
          ) => {
            if (!old) return old;
            return {
              ...old,
              members: old.members.filter((m) => m.id !== userId),
            };
          }
        );
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      }
      return success;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to remove member'
      );
      return false;
    }
  };

  const updateWorkspace = async (updates: Partial<Workspace>) => {
    try {
      const updated = await workspaceService.updateWorkspaceDetails(
        workspaceId,
        updates
      );
      if (updated) {
        queryClient.setQueryData(
          ['workspace', workspaceId],
          (
            old:
              | { workspace: Workspace | null; members: Member[] }
              | undefined
          ) => {
            if (!old) return old;
            return {
              ...old,
              workspace: updated,
            };
          }
        );
        queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      }
      return updated;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to update workspace'
      );
      return null;
    }
  };

  const deleteWorkspace = async () => {
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      queryClient.removeQueries({ queryKey: ['workspace', workspaceId] });
      queryClient.removeQueries({
        queryKey: ['workspace-expenses', workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      return true;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to delete workspace'
      );
      return false;
    }
  };

  const regenerateInvite = async () => {
    if (!workspaceId) return null;
    try {
      setActionError(null);
      const newCode = await workspaceService.regenerateInviteCode(workspaceId);
      if (newCode) {
        queryClient.setQueryData(
          ['workspace', workspaceId],
          (
            old:
              | { workspace: Workspace | null; members: Member[] }
              | undefined
          ) => {
            if (!old || !old.workspace) return old;
            return {
              ...old,
              workspace: {
                ...old.workspace,
                invite_code: newCode,
              },
            };
          }
        );
      }
      return newCode;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Failed to regenerate invite code'
      );
      return null;
    }
  };

  const error =
    actionError ||
    (detailsError
      ? detailsError instanceof Error
        ? detailsError.message
        : 'Failed to load workspace'
      : null);

  return {
    workspace: workspaceDetails?.workspace ?? null,
    expenses,
    members: workspaceDetails?.members ?? [],
    loading: (detailsLoading || expensesLoading) && !workspaceDetails,
    error,
    clearError: () => setActionError(null),
    hasMore: !!hasNextPage,
    loadingMore: isFetchingNextPage,
    loadMoreExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    addMember,
    removeMember,
    updateWorkspace,
    deleteWorkspace,
    regenerateInvite,
    refetch: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] }),
        queryClient.invalidateQueries({
          queryKey: ['workspace-expenses', workspaceId],
        }),
      ]);
    },
  };
};
