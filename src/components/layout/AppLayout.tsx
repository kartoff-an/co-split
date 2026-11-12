import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Spinner } from '@/components/Spinner';

export function AppLayout() {
  const { user, profile, loading, signOut } = useAuth();

  const { workspaces, loadingWorkspaces } = useDashboard(user?.id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar profile={profile} workspaces={workspaces} onSignOut={signOut} loadingWorkspaces={loadingWorkspaces} />

      <SidebarInset className="min-w-0">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
