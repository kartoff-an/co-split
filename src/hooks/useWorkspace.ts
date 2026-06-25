import { useEffect, useState } from 'react';
import type { Expense, Member, Workspace } from '../types';
import * as workspaceService from '../services/workspaceService';
import * as expenseService from '../services/expenseService';
import { fetchUserProfile } from '../db/profiles';
import { fetchWorkspaceExpensesPaginated } from '../db/expenses';

export const useWorkspace = (workspaceId: string) => {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 10;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchWorkspaceData = async () => {
      try {
        setLoading(true);
        setError(null);
        setPage(1);

        const details = await workspaceService.getWorkspaceDetails(workspaceId);
        setWorkspace(details.workspace);
        setMembers(details.members);

        const { expenses: firstPageExpenses, hasMore: firstPageHasMore } =
          await fetchWorkspaceExpensesPaginated(workspaceId, 1, pageSize);
        setExpenses(firstPageExpenses);
        setHasMore(firstPageHasMore);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load workspace'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaceData();

    // Expenses subscription
    const expensesSubscription = workspaceService.subscribeToWorkspaceExpenses(
      workspaceId,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setExpenses((previousExpenses) => {
            if (
              previousExpenses.some((expense) => expense.id === payload.new.id)
            )
              return previousExpenses;
            return [payload.new as Expense, ...previousExpenses];
          });
        } else if (payload.eventType === 'DELETE') {
          setExpenses((previousExpenses) =>
            previousExpenses.filter((expense) => expense.id !== payload.old.id)
          );
        }
      }
    );

    // Members subscription
    const membersSubscription = workspaceService.subscribeToWorkspaceMembers(
      workspaceId,
      async (payload) => {
        if (payload.eventType === 'INSERT') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newMember = payload.new as any;

          const profileData = await fetchUserProfile(newMember.user_id);

          if (profileData) {
            setMembers((previousMembers) => {
              if (
                previousMembers.some(
                  (member) => member.id === newMember.user_id
                )
              )
                return previousMembers;
              return [
                ...previousMembers,
                {
                  id: newMember.user_id,
                  membership_id: String(newMember.id),
                  workspace_id: newMember.workspace_id,
                  display_name: profileData.display_name,
                  avatar_url: profileData.avatar_url,
                  joined_at: newMember.joined_at,
                },
              ];
            });
          }
        } else if (payload.eventType === 'DELETE') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const oldMember = payload.old as any;
          setMembers((previousMembers) =>
            previousMembers.filter(
              (m) => m.membership_id !== String(oldMember.id)
            )
          );
        }
      }
    );

    return () => {
      expensesSubscription.unsubscribe();
      membersSubscription.unsubscribe();
    };
  }, [workspaceId, refreshTrigger]);

  const loadMoreExpenses = async () => {
    if (!workspaceId || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { expenses: nextPageExpenses, hasMore: nextPageHasMore } =
        await fetchWorkspaceExpensesPaginated(workspaceId, nextPage, pageSize);

      setExpenses((previousExpenses) => {
        const filteredNext = nextPageExpenses.filter(
          (newExp) =>
            !previousExpenses.some((oldExp) => oldExp.id === newExp.id)
        );
        return [...previousExpenses, ...filteredNext];
      });
      setPage(nextPage);
      setHasMore(nextPageHasMore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load more expenses'
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const addExpense = async (
    expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>
  ) => {
    try {
      const newExpense = await expenseService.addExpense(workspaceId, expense);
      if (!newExpense) throw new Error('Failed to add expense.');

      setExpenses((previousExpenses) => {
        if (previousExpenses.some((expense) => expense.id === newExpense.id))
          return previousExpenses;
        return [newExpense, ...previousExpenses];
      });
      return newExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      throw err;
    }
  };

  const addMember = async (userId: string) => {
    try {
      const newMember = await workspaceService.addMemberToWorkspaceWithCheck(
        workspaceId,
        userId
      );
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      return null;
    }
  };

  const removeMember = async (userId: string) => {
    try {
      const success = await workspaceService.removeMember(workspaceId, userId);
      if (success) {
        setMembers((previousMembers) =>
          previousMembers.filter((m) => m.id !== userId)
        );
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
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
        setWorkspace(updated);
      }
      return updated;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update workspace'
      );
      return null;
    }
  };

  const deleteWorkspace = async () => {
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete workspace'
      );
      return false;
    }
  };

  const regenerateInvite = async () => {
    if (!workspaceId) return null;
    try {
      setError(null);
      const newCode = await workspaceService.regenerateInviteCode(workspaceId);
      if (newCode) {
        setWorkspace((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            invite_code: newCode,
          };
        });
      }
      return newCode;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to regenerate invite code'
      );
      return null;
    }
  };

  return {
    workspace,
    expenses,
    members,
    loading,
    error,
    clearError: () => setError(null),
    hasMore,
    loadingMore,
    loadMoreExpenses,
    addExpense,
    addMember,
    removeMember,
    updateWorkspace,
    deleteWorkspace,
    regenerateInvite,
    refetch: () => setRefreshTrigger((prev) => prev + 1),
  };
};
