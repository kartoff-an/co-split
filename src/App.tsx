import { Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './auth/AuthProvider';
import { ThemeProvider } from './features/theme/ThemeProvider';
import { HomePage } from './pages/landing/LandingPage';
import { WorkspacePage } from './features/workspaces/WorkspacePage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { AuthCallback } from './auth/AuthCallback';
import { JoinPage } from './features/workspaces/JoinPage';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/join/:inviteCode" element={<JoinPage />} />

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
