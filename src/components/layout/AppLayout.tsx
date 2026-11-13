import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import { useDashboard } from '@/hooks/useDashboard';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { Spinner } from '@/components/Spinner';
import { Footer } from '../Footer';

export function AppLayout() {
  const { user, profile, loading, signOut } = useAuth();
  const location = useLocation();

  const { workspaces, loadingWorkspaces } = useDashboard(user?.id);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;

    return <Navigate to="/" replace state={{ from: redirectTo }} />;
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

      <SidebarInset className="flex min-h-svh min-w-0 flex-col">
        <main className="flex flex-1 flex-col">
          <Outlet />
        </main>

        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
