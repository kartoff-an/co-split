import { api } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { requireApiData, requireApiSuccess } from '@/api/response';

import type {
  ApiResponse,
  Settlement,
  SettlementCreate,
  SettlementQueryParams,
} from '@/api/types';

export async function getWorkspaceSettlements(
  workspaceId: string,
  filters: SettlementQueryParams = {},
): Promise<Settlement[]> {
  const params = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

  const response = await api.get<ApiResponse<Settlement[]>>(
    API_ENDPOINTS.workspaces.settlements(workspaceId),
    { params },
  );

  return requireApiData(response);
}

export async function createSettlement(
  workspaceId: string,
  data: SettlementCreate,
): Promise<Settlement> {
  const response = await api.post<ApiResponse<Settlement>>(
    API_ENDPOINTS.workspaces.settlements(workspaceId),
    data,
  );

  return requireApiData(response);
}

export async function confirmSettlement(
  settlementId: number,
): Promise<Settlement> {
  const response = await api.patch<ApiResponse<Settlement>>(
    API_ENDPOINTS.settlements.confirm(settlementId),
  );

  return requireApiData(response);
}

export async function deleteSettlement(
  settlementId: number,
): Promise<void> {
  const response = await api.delete<ApiResponse<null>>(
    API_ENDPOINTS.settlements.detail(settlementId),
  );

  requireApiSuccess(response);
}
