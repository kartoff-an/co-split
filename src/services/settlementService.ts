import { api } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { requireApiData } from '@/api/response';

import type { ApiResponse, Settlement, SettlementCreate } from '@/api/types';

export const createSettlement = async (workspaceId: string, data: SettlementCreate): Promise<Settlement> => {
  const response = await api.post<ApiResponse<Settlement>>(API_ENDPOINTS.workspaces.settlements(workspaceId), data);

  return requireApiData(response);
};
