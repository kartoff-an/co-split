import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import { useDashboard } from '@/hooks/useDashboard';

import { DashboardWelcome } from './components/DashboardWelcome';
import { DashboardOverview } from './components/DashboardOverview';
import { WorkspaceList } from './components/WorkspaceList';
import { WorkspaceActions } from './components/WorkspaceActions';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { SpinnerGapIcon, WarningCircleIcon, CheckCircleIcon, XIcon } from '@phosphor-icons/react';
import type { WorkspaceItem } from '@/types';

export function Dashboard() {
  const navigate = useNavigate();

  const { user, profile, loading: authLoading } = useAuth();

  const { workspaces, loadingWorkspaces, actionLoading, message, clearMessage, createWorkspace, joinWorkspace } =
    useDashboard(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleCreateWorkspace = async (name: string) => {
    const workspaceId = await createWorkspace(name);

    if (workspaceId) {
      navigate(`/workspace/${workspaceId}`);
    }

    return workspaceId;
  };

  const handleJoinWorkspace = async (id: string) => {
    const workspaceId = await joinWorkspace(id);

    if (workspaceId) {
      navigate(`/workspace/${workspaceId}`);
    }

    return workspaceId;
  };

  const handleOpenWorkspace = (id: string) => {
    navigate(`/workspace/${id}`);
  };

  const ownedWorkspaces = workspaces.filter((workspace: WorkspaceItem) => workspace.owner_id === user?.id).length;

  if (authLoading || !profile) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <SpinnerGapIcon size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarInset className="bg-background min-w-0">
        {/* Page header */}
        <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md md:px-6">
          <p className="text-sm font-medium">Dashboard</p>

          <div className="ml-auto">
            <WorkspaceActions loading={actionLoading} onCreate={handleCreateWorkspace} onJoin={handleJoinWorkspace} />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <DashboardWelcome displayName={profile.display_name} />

            {/* Action feedback */}
            {message && (
              <Alert
                variant={message.type === 'error' ? 'destructive' : 'default'}
                className={
                  message.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
                    : ''
                }
              >
                {message.type === 'error' ? <WarningCircleIcon size={18} /> : <CheckCircleIcon size={18} />}

                <AlertDescription className="flex items-center justify-between gap-3">
                  <span>{message.text}</span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={clearMessage}
                    aria-label="Dismiss message"
                  >
                    <XIcon size={16} />
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <DashboardOverview
              totalWorkspaces={workspaces.length}
              ownedWorkspaces={ownedWorkspaces}
              loading={loadingWorkspaces}
            />

            {/* Main dashboard content */}
            <section className="grid gap-6 lg:grid-cols-1">
              <WorkspaceList
                workspaces={workspaces}
                userId={user?.id ?? ''}
                loading={loadingWorkspaces}
                onOpen={handleOpenWorkspace}
              />
            </section>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
