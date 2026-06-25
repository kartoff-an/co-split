import type React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const session = await authService.getSession();
      if (session) {
        const pendingWorkspaceId = sessionStorage.getItem(
          'co-split:pendingWorkspaceId'
        );
        if (pendingWorkspaceId) {
          sessionStorage.removeItem('co-split:pendingWorkspaceId');
          navigate(`/workspace/${pendingWorkspaceId}`, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      // Fallback: listen for auth changes
      const subscription = authService.onAuthStateChange((event, session) => {
        if (session) {
          const pendingWorkspaceId = sessionStorage.getItem(
            'co-split:pendingWorkspaceId'
          );
          if (pendingWorkspaceId) {
            sessionStorage.removeItem('co-split:pendingWorkspaceId');
            navigate(`/workspace/${pendingWorkspaceId}`, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
          subscription.unsubscribe();
        } else if (event === 'SIGNED_OUT') {
          navigate('/', { replace: true });
          subscription.unsubscribe();
        }
      });
    };

    checkSession();
  }, [navigate]);

  return (
    <div className="bg-mesh-light flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="relative mx-auto h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="border-t-primary-green absolute inset-0 animate-spin rounded-full border-4" />
        </div>
        <p className="text-sm font-bold tracking-tight text-slate-700">
          Authenticating your Google session...
        </p>
      </div>
    </div>
  );
};
