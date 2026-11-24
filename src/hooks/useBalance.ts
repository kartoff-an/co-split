import { useQuery } from '@tanstack/react-query';

import { api } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { requireApiData } from '@/api/response';

import type { ApiResponse } from '@/api/types';
import type { Balance, Member, Settlement } from '@/types';

interface MemberBalanceResponse {
  user_id: string;
  total_paid: number | string;
  total_share: number | string;
  total_sent: number | string;
  total_received: number | string;
  net_balance: number | string;
}

interface SuggestedSettlementResponse {
  from_user_id: string;
  to_user_id: string;
  amount: number | string;
}

interface WorkspaceBalanceResponse {
  workspace_id: string;
  currency: string;
  members: MemberBalanceResponse[];
  suggested_settlements: SuggestedSettlementResponse[];
}

export const useBalance = (workspaceId: string, expensesTrigger?: unknown, members: Member[] = []) => {
  const query = useQuery({
    queryKey: ['workspace-balance', workspaceId, expensesTrigger],
    enabled: !!workspaceId,
    queryFn: async () => {
      const response = await api.get<ApiResponse<WorkspaceBalanceResponse>>(
        API_ENDPOINTS.workspaces.balances(workspaceId)
      );

      return requireApiData(response);
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

  const memberById = new Map(members.map((member) => [member.id, member]));

  const balances: Balance[] = (query.data?.members ?? []).map((balance) => ({
    member_id: balance.user_id,
    member_name: memberById.get(balance.user_id)?.display_name ?? 'Unknown member',
    net_balance: Number(balance.net_balance),
  }));

  const settlements: Settlement[] = (query.data?.suggested_settlements ?? []).map((settlement) => ({
    from_id: settlement.from_user_id,
    from: memberById.get(settlement.from_user_id)?.display_name ?? 'Unknown member',
    to_id: settlement.to_user_id,
    to: memberById.get(settlement.to_user_id)?.display_name ?? 'Unknown member',
    amount: Number(settlement.amount),
  }));

  const totalWorkspaceCost = (query.data?.members ?? []).reduce(
    (total, balance) => total + Number(balance.total_paid),
    0
  );

  const averageCostPerPerson = members.length ? totalWorkspaceCost / members.length : 0;

  return {
    balances,
    settlements,
    totalWorkspaceCost,
    averageCostPerPerson,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
