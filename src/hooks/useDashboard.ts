import { useState, useEffect, useCallback } from 'react';
import * as workspaceService from '../services/workspaceService';
import type { WorkspaceItem } from '../types';

interface DashboardMessage {
  text: string;
  type: 'error' | 'success';
}

export const useDashboard = (userId: string | undefined) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<DashboardMessage | null>(null);

  const fetchUserWorkspaces = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingWorkspaces(true);
      const list = await workspaceService.getUserWorkspaces(userId);
      setWorkspaces(list);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    } finally {
      setLoadingWorkspaces(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUserWorkspaces();

    const subscription = workspaceService.subscribeToUserMemberships(
      userId,
      () => {
        fetchUserWorkspaces();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchUserWorkspaces]);

  const createWorkspace = async (name: string): Promise<string | null> => {
    if (!name.trim() || !userId) return null;

    setActionLoading(true);
    setMessage(null);
    try {
      const workspaceId = await workspaceService.createWorkspaceWithMember(
        name.trim(),
        userId
      );
      return workspaceId;
    } catch (err) {
      console.error('Failed to create workspace:', err);
      setMessage({
        text: err instanceof Error ? err.message : 'Failed to create workspace',
        type: 'error',
      });
      setActionLoading(false);
      return null;
    }
  };

  const joinWorkspace = async (id: string): Promise<string | null> => {
    const targetId = id.trim();
    if (!targetId || !userId) return null;

    setActionLoading(true);
    setMessage(null);
    try {
      const workspaceId = await workspaceService.joinWorkspace(
        targetId,
        userId
      );
      return workspaceId;
    } catch (err) {
      console.error('Failed to join workspace:', err);
      setMessage({
        text: err instanceof Error ? err.message : 'Failed to join workspace',
        type: 'error',
      });
      setActionLoading(false);
      return null;
    }
  };

  return {
    workspaces,
    loadingWorkspaces,
    actionLoading,
    message,
    clearMessage: () => setMessage(null),
    createWorkspace,
    joinWorkspace,
  };
};
