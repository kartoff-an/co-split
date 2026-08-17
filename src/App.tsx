import { Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './features/auth/AuthProvider';
import { ThemeProvider } from './features/theme/ThemeProvider';
import { HomePage } from './features/landing/HomePage';
import { WorkspacePage } from './features/workspaces/WorkspacePage';
import { Dashboard } from './features/dashboard/Dashboard';
import { AuthCallback } from './features/auth/AuthCallback';
import { JoinPage } from './features/workspaces/JoinPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
            <Route path="/join/:inviteCode" element={<JoinPage />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
