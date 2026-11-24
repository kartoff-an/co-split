import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as workspaceService from '../services/workspaceService';
import type { WorkspaceItem } from '@/types';

interface DashboardMessage {
  text: string;
  type: 'error' | 'success';
}

export const useDashboard = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<DashboardMessage | null>(null);

  const { data: workspaces = [], isLoading: loadingWorkspaces } = useQuery<WorkspaceItem[]>({
    queryKey: ['workspaces', userId],
    queryFn: () => workspaceService.getUserWorkspaces(),
    enabled: !!userId,
  });

  const createWorkspace = async (name: string): Promise<string | null> => {
    if (!name.trim() || !userId) return null;

    setActionLoading(true);
    setMessage(null);
    try {
      const workspaceId = await workspaceService.createWorkspaceWithMember(name.trim());
      queryClient.invalidateQueries({ queryKey: ['workspaces', userId] });
      return workspaceId;
    } catch (err) {
      console.error('Failed to create workspace:', err);
      setMessage({
        text: err instanceof Error ? err.message : 'Failed to create workspace',
        type: 'error',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const joinWorkspace = async (id: string): Promise<string | null> => {
    const targetId = id.trim();
    if (!targetId || !userId) return null;

    setActionLoading(true);
    setMessage(null);
    try {
      const workspaceId = await workspaceService.joinWorkspace(targetId);
      queryClient.invalidateQueries({ queryKey: ['workspaces', userId] });
      return workspaceId;
    } catch (err) {
      console.error('Failed to join workspace:', err);
      setMessage({
        text: err instanceof Error ? err.message : 'Failed to join workspace',
        type: 'error',
      });
      return null;
    } finally {
      setActionLoading(false);
    }
  };

  const ownedWorkspaces = workspaces.filter((workspace: WorkspaceItem) => workspace.owner_id === userId).length;

  return {
    workspaces,
    ownedWorkspaces,
    loadingWorkspaces,
    actionLoading,
    message,
    clearMessage: () => setMessage(null),
    createWorkspace,
    joinWorkspace,
  };
};
