import { api } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { requireApiData } from '@/api/response';

import type { ApiResponse, WorkspaceBalance } from '@/api/types';

export const getWorkspaceBalance = async (workspaceId: string): Promise<WorkspaceBalance> => {
  const response = await api.get<ApiResponse<WorkspaceBalance>>(API_ENDPOINTS.workspaces.balances(workspaceId));

  return requireApiData(response);
};
