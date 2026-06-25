import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { Dashboard } from './pages/Dashboard';
import { AuthCallback } from './pages/AuthCallback';
import { JoinPage } from './pages/JoinPage';

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
