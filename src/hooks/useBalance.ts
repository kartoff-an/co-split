import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import * as balanceService from '@/services/balanceService';

export const useBalance = (workspaceId: string) => {
  const query = useQuery({
    queryKey: queryKeys.balances.detail(workspaceId),

    queryFn: () => balanceService.getWorkspaceBalance(workspaceId),

    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const balance = query.data;
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
