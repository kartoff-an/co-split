import { Route, Routes } from 'react-router-dom';
import { HomePage } from './features/landing/HomePage';
import { WorkspacePage } from './features/workspaces/WorkspacePage';
import { Dashboard } from './features/dashboard/Dashboard';
import { AuthCallback } from './features/auth/AuthCallback';
import { JoinPage } from './features/workspaces/JoinPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
      <Route path="/join/:inviteCode" element={<JoinPage />} />
    </Routes>
  );
}

export default App;
