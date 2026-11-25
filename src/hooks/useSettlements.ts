
import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import {
  invalidateAfterSettlementCreated,
  invalidateAfterSettlementConfirmed,
  invalidateAfterSettlementDeleted,
} from '@/api/queryInvalidation';

import * as settlementService from '@/services/settlementService';

import type {
  SettlementCreate,
  SettlementQueryParams,
} from '@/api/types';

export const useSettlements = (
  workspaceId: string,
  filters: SettlementQueryParams = {},
) => {
  const queryClient = useQueryClient();

  const normalizedFilters = useMemo<SettlementQueryParams>(() => {
    return Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== '',
      ),
    ) as SettlementQueryParams;
  }, [filters]);

  const query = useQuery({
    queryKey: queryKeys.settlements.list(
      workspaceId,
      normalizedFilters,
    ),

    queryFn: () =>
      settlementService.getWorkspaceSettlements(
        workspaceId,
        normalizedFilters,
      ),

    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: SettlementCreate) =>
      settlementService.createSettlement(workspaceId, data),

    onSuccess: async () => {
      await invalidateAfterSettlementCreated(
        queryClient,
        workspaceId,
      );
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (settlementId: number) =>
      settlementService.confirmSettlement(settlementId),

    onSuccess: async () => {
      await invalidateAfterSettlementConfirmed(
        queryClient,
        workspaceId,
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (settlementId: number) =>
      settlementService.deleteSettlement(settlementId),

    onSuccess: async () => {
      await invalidateAfterSettlementDeleted(
        queryClient,
        workspaceId,
      );
    },
  });

  return {
    settlements: query.data ?? [],

    loading: query.isPending,
    fetching: query.isFetching,
    error:
      query.error instanceof Error
        ? query.error.message
        : null,

    refetch: query.refetch,

    createSettlement: createMutation.mutateAsync,
    confirmSettlement: confirmMutation.mutateAsync,
    deleteSettlement: deleteMutation.mutateAsync,

    creating: createMutation.isPending,
    confirming: confirmMutation.isPending,
    deleting: deleteMutation.isPending,

    isMutating:
      createMutation.isPending ||
      confirmMutation.isPending ||
      deleteMutation.isPending,
  };
};
