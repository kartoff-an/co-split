import { api } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import { requireApiData, requireApiSuccess } from '@/api/response';
import type { ApiResponse, Workspace, WorkspaceInvitePreview, WorkspaceListItem, WorkspaceMember } from '@/api/types';

export const getUserWorkspaces = async (): Promise<WorkspaceListItem[]> => {
  const response = await api.get<ApiResponse<WorkspaceListItem[]>>(API_ENDPOINTS.workspaces.base);

  return requireApiData(response).map((workspace) => ({
    ...workspace,
    owner_name: workspace.owner_name ?? 'Unknown',
    total_expenses: workspace.total_expenses,
    member_count: workspace.member_count,
    user_net_balance: workspace.user_net_balance,
  }));
};

export const createWorkspaceWithMember = async (name: string): Promise<string> => {
  const response = await api.post<ApiResponse<Workspace>>(API_ENDPOINTS.workspaces.base, { name });
  const workspace = requireApiData(response);

  return workspace.id;
};

export const joinWorkspaceWithCode = async (inviteCode: string): Promise<string> => {
  const response = await api.post<ApiResponse<Workspace>>(API_ENDPOINTS.workspaces.join, {
    invite_code: inviteCode,
  });

  return requireApiData(response).id;
};

export const getWorkspaceInvitePreview = async (inviteCode: string): Promise<string | null> => {
  const response = await api.get<ApiResponse<WorkspaceInvitePreview>>(
    API_ENDPOINTS.workspaces.invitePreview(inviteCode)
  );

  return requireApiData(response).name;
};

export const regenerateInviteCode = async (workspaceId: string): Promise<string> => {
  const response = await api.post<ApiResponse<Workspace>>(API_ENDPOINTS.workspaces.regenerateInviteCode(workspaceId));

  return requireApiData(response).invite_code;
};

export const joinWorkspace = async (pastedLinkOrId: string): Promise<string> => {
  const input = pastedLinkOrId.trim();
  let inviteCode: string | null = null;

  if (input.includes('/join/')) {
    try {
      const url = new URL(input, window.location.origin);
      const pathParts = url.pathname.split('/');
      const joinIndex = pathParts.indexOf('join') + 1;

      if (joinIndex > 0 && joinIndex < pathParts.length) {
        inviteCode = pathParts[joinIndex];
      }
    } catch {
      throw new Error('Invalid workspace invite link.');
    }
  } else if (input.includes('/workspaces.')) {
    try {
      const url = new URL(input, window.location.origin);
      inviteCode = url.searchParams.get('code');
    } catch {
      throw new Error('Invalid workspace invite link.');
    }
  } else if (input.includes(':')) {
    const parts = input.split(':');
    inviteCode = parts[1] || parts[0];
  } else {
    inviteCode = input;
  }

  if (!inviteCode) {
    throw new Error('An invite code or full invite link is required to join this ledger.');
  }

  return joinWorkspaceWithCode(inviteCode);
};

export const getWorkspaceDetails = async (
  workspaceId: string
): Promise<{
  workspace: Workspace | null;
  members: WorkspaceMember[];
}> => {
  const [workspWorkspace, membersResponse] = await Promise.all([
    api.get<ApiResponse<Workspace>>(API_ENDPOINTS.workspaces.detail(workspaceId)),
    api.get<ApiResponse<WorkspaceMember[]>>(API_ENDPOINTS.workspaces.members(workspaceId)),
  ]);

  const workspaceData = requireApiData(workspWorkspace);
  const memberData = requireApiData(membersResponse);

  const workspace: Workspace = {
    id: workspaceData.id,
    name: workspaceData.name,
    owner_id: workspaceData.owner_id,
    allowed_members: workspaceData.allowed_members,
    currency: workspaceData.currency,
    created_at: workspaceData.created_at,
    invite_code: workspaceData.invite_code,
  };

  const members: WorkspaceMember[] = memberData.map((member) => ({
    id: member.id,
    membership_id: member.membership_id,
    workspace_id: member.workspace_id,
    display_name: member.display_name,
    avatar_url: member.avatar_url,
    joined_at: member.joined_at,
  }));

  return { workspace, members };
};

export const removeMember = async (workspaceId: string, userId: string): Promise<boolean> => {
  const response = await api.delete<ApiResponse<null>>(API_ENDPOINTS.workspaces.removeMember(workspaceId, userId));

  requireApiSuccess(response);

  return true;
};

export const updateWorkspaceDetails = async (workspaceId: string, updates: Partial<Workspace>): Promise<Workspace> => {
  const response = await api.patch<ApiResponse<Workspace>>(API_ENDPOINTS.workspaces.detail(workspaceId), {
    ...(updates.name !== undefined && { name: updates.name }),
    ...(updates.allowed_members !== undefined && { allowed_members: updates.allowed_members }),
    ...(updates.currency !== undefined && { currency: updates.currency }),
  });

  const workspace = requireApiData(response);

  return {
    id: workspace.id,
    name: workspace.name,
    owner_id: workspace.owner_id,
    allowed_members: workspace.allowed_members,
    currency: workspace.currency,
    created_at: workspace.created_at,
    invite_code: workspace.invite_code,
  };
};

export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  const response = await api.delete<ApiResponse<null>>(API_ENDPOINTS.workspaces.detail(workspaceId));

  requireApiSuccess(response);
};
