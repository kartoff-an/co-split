import { useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { requireApiData } from '@/api/response';

import type { ApiResponse, WorkspaceBalance } from '@/api/types';

export const workspaceBalanceQueryKey = (workspaceId: string) => ['workspace-balance', workspaceId] as const;

export const useBalance = (workspaceId: string) => {
  const query = useQuery({
    queryKey: workspaceBalanceQueryKey(workspaceId),

    queryFn: async (): Promise<WorkspaceBalance> => {
      const response = await api.get<ApiResponse<WorkspaceBalance>>(API_ENDPOINTS.workspaces.balances(workspaceId));

      return requireApiData(response);
    },

    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const balance = query.data;

  // Expenses are represented by total_paid.
  // Each expense contributes exactly once to the total.
  const totalWorkspaceCost = (balance?.members ?? []).reduce((total, member) => total + Number(member.total_paid), 0);

  const averageCostPerPerson = balance?.members.length ? totalWorkspaceCost / balance.members.length : 0;

  return {
    balance: balance ?? null,
    members: balance?.members ?? [],
    suggestedSettlements: balance?.suggested_settlements ?? [],

    // Derived presentation statistics.
    totalWorkspaceCost,
    averageCostPerPerson,

    loading: query.isPending,
    isFetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,

    refetch: query.refetch,
  };
};
