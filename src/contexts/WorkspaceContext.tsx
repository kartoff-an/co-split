import type { Workspace, WorkspaceMember } from '@/api/types';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface WorkspaceContextValue {
  workspaceId: string;
  workspace: Workspace;
  members: WorkspaceMember[];
  currency: string;
}

interface WorkspaceProviderProps {
  children: ReactNode;
  workspaceId: string;
  workspace: Workspace;
  members: WorkspaceMember[];
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children, workspaceId, workspace, members }: WorkspaceProviderProps) {
  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspaceId,
      workspace,
      members,
      currency: workspace.currency,
    }),
    [workspaceId, workspace, members]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspaceContext(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider.');
  }

  return context;
}
