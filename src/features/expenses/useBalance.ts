import { useQuery } from '@tanstack/react-query';
import type { Balance, Settlement } from '../../types';
import { supabase } from '../../lib/supabase';

interface SupabaseRpc {
  rpc(
    fn: string,
    args: Record<string, unknown>
  ): Promise<{ data: unknown; error: unknown }>;
}

interface DBCalculationResult {
  balances: Balance[];
  settlements: Settlement[];
  total_workspace_cost: number;
  average_cost_per_person: number;
}

export const useBalance = (workspaceId: string, expensesTrigger?: unknown) => {
  const query = useQuery({
    queryKey: ['workspace-balance', workspaceId, expensesTrigger],
    enabled: !!workspaceId,
    queryFn: async () => {
      const client = supabase as unknown as SupabaseRpc;
      const { data, error: rpcError } = await client.rpc(
        'calculate_workspace_balances',
        {
          w_id: workspaceId,
        }
      );
      if (rpcError) throw rpcError;

      const result = (data ?? {
        balances: [],
        settlements: [],
        total_workspace_cost: 0,
        average_cost_per_person: 0,
      }) as DBCalculationResult;

      return {
        balances: result.balances || [],
        settlements: result.settlements || [],
        totalWorkspaceCost: Number(result.total_workspace_cost) || 0,
        averageCostPerPerson: Number(result.average_cost_per_person) || 0,
      };
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

  return {
    balances: query.data?.balances ?? [],
    settlements: query.data?.settlements ?? [],
    totalWorkspaceCost: query.data?.totalWorkspaceCost ?? 0,
    averageCostPerPerson: query.data?.averageCostPerPerson ?? 0,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
};
