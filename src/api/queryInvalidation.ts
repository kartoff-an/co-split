import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * An expense changes claculated balances and suggested settlements,
 * as well as workspace previews and the activity feed.
 */
export const invalidateAfterExpenseMutation = async (queryClient: QueryClient, workspaceId: string): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.workspace(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.detail(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.overview(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activity.workspace(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.workspace.detail(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
  ]);
};

/**
 * Creating a settlement creates a pending record.
 * Pending settlements do not affect calculated balances.
 */
export const invalidateAfterSettlementCreated = async (
  queryClient: QueryClient,
  workspaceId: string
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.settlements.workspace(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activity.workspace(workspaceId) }),
  ]);
};

/**
 * Confirming a settlement changes calculated balances.
 */
export const invalidateAfterSettlementConfirmed = async (
  queryClient: QueryClient,
  workspaceId: string
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.settlements.workspace(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.detail(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.overview(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activity.workspace(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
  ]);
};

/**
 * Deleting a pending settlement does not change balances.
 */
export const invalidateAfterSettlementDeleted = async (
  queryClient: QueryClient,
  workspaceId: string
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.settlements.workspace(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activity.workspace(workspaceId) }),
  ]);
};

/**
 * Membership changes can affect default expense splits and balances.
 */
export const invalidateAfterMembershipMutation = async (
  queryClient: QueryClient,
  workspaceId: string
): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.workspace.detail(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.workspace(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.detail(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.balances.overview(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.activity.workspace(workspaceId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
  ]);
};
