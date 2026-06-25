import { useEffect, useState, useCallback } from 'react';
import type { Balance, Settlement } from '../types';
import { supabase } from '../lib/supabase';

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
  const [balances, setBalances] = useState<Balance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [totalWorkspaceCost, setTotalWorkspaceCost] = useState(0);
  const [averageCostPerPerson, setAverageCostPerPerson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalculations = useCallback(async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      setError(null);
      const client = supabase as unknown as SupabaseRpc;
      const { data, error: rpcError } = await client.rpc(
        'calculate_workspace_balances',
        {
          w_id: workspaceId,
        }
      );
      if (rpcError) throw rpcError;

      if (data) {
        const result = data as DBCalculationResult;
        setBalances(result.balances || []);
        setSettlements(result.settlements || []);
        setTotalWorkspaceCost(Number(result.total_workspace_cost) || 0);
        setAverageCostPerPerson(Number(result.average_cost_per_person) || 0);
      }
    } catch (err) {
      console.error('Error fetching backend calculations:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to calculate balances'
      );
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCalculations();
  }, [fetchCalculations, expensesTrigger]);

  return {
    balances,
    settlements,
    totalWorkspaceCost,
    averageCostPerPerson,
    loading,
    error,
    refetch: fetchCalculations,
  };
};
