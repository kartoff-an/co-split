import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as workspaceService from '../services/workspaceService';
import { Spinner } from '../components/Spinner';
import { CoSplitIcon } from '../components/CoSplitIcon';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export const JoinPage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [joining, setJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (inviteCode) {
        sessionStorage.setItem('co-split:pendingInviteCode', inviteCode);
      }
      navigate('/', { replace: true });
      return;
    }

    if (!inviteCode) {
      setError('Invite code is missing.');
      setJoining(false);
      return;
    }

    const performJoin = async () => {
      try {
        setJoining(true);
        setError(null);
        const workspaceId =
          await workspaceService.joinWorkspaceWithCode(inviteCode);
        navigate(`/workspace/${workspaceId}`, { replace: true });
      } catch (err) {
        console.error('Error joining workspace:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to join the ledger. The invite code may be invalid or expired.'
        );
        setJoining(false);
      }
    };

    performJoin();
  }, [user, authLoading, inviteCode, navigate]);

  if (authLoading || joining) {
    return (
      <div className="bg-mesh-light flex min-h-screen flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-center select-none">
          <CoSplitIcon className="animate-pulse" />
          <Spinner className="text-primary-green h-12 w-12" />
          <p className="text-sm font-semibold text-slate-500">
            Joining ledger sheet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-mesh-light flex min-h-screen flex-col items-center justify-center px-4 font-sans">
      <div className="glass-card w-full max-w-md rounded-2xl border border-slate-100 p-8 text-center shadow-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <ExclamationTriangleIcon className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Cannot Join Ledger</h2>
        <p className="text-slate-450 mt-2 text-xs leading-relaxed font-medium">
          {error}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary-green hover:bg-primary-green-dark border-primary-green/10 mt-6 cursor-pointer rounded-xl border px-5 py-2.5 text-xs font-bold text-white transition-all hover:shadow-xs active:scale-[0.98]"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
