import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import * as workspaceService from './workspaceService';
import { Spinner } from '../../components/Spinner';
import { CoSplitIcon } from '../../components/CoSplitIcon';
import {
  ExclamationTriangleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';
import { GoogleLogin } from '../auth/GoogleLogin';
import { ThemeToggle } from '../../components/ThemeToggle';

export const JoinPage: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [invitePreview, setInvitePreview] = useState<{
    inviteCode: string;
    ledgerName: string | null;
  } | null>(null);
  const ledgerName =
    invitePreview?.inviteCode === inviteCode
      ? invitePreview?.ledgerName
      : null;
  const [joinError, setJoinError] = useState<{
    inviteCode: string;
    message: string;
  } | null>(null);

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://cosplit.site/';
  useDocumentMetadata({
    title: 'Join Expense Ledger - Co-Split',
    description:
      'You have been invited to join a shared expense ledger sheet on Co-Split. Sign in to collaborate and start splitting bills in real-time.',
    url: inviteCode ? `${origin}/join/${inviteCode}` : origin,
    image: `${origin}/icons/co-split-icon.png`,
  });

  useEffect(() => {
    if (authLoading || user || !inviteCode) return;

    let active = true;
    workspaceService
      .getWorkspaceInvitePreview(inviteCode)
      .then((name) => {
        if (active) setInvitePreview({ inviteCode, ledgerName: name });
      })
      .catch(() => {
        if (active) setInvitePreview({ inviteCode, ledgerName: null });
      });

    return () => {
      active = false;
    };
  }, [authLoading, user, inviteCode]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      if (inviteCode) {
        sessionStorage.setItem('co-split:pendingInviteCode', inviteCode);
      }
      return;
    }

    if (!inviteCode) return;

    let active = true;
    const performJoin = async () => {
      try {
        const workspaceId =
          await workspaceService.joinWorkspaceWithCode(inviteCode);
        if (active) {
          navigate(`/workspace/${workspaceId}`, { replace: true });
        }
      } catch (error) {
        console.error('Error joining workspace:', error);
        if (active) {
          setJoinError({
            inviteCode,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to join the ledger. The invite code may be invalid or expired.',
          });
        }
      }
    };

    performJoin();
    return () => {
      active = false;
    };
  }, [user, authLoading, inviteCode, navigate]);

  const currentJoinError = !inviteCode
    ? 'Invite code is missing.'
    : joinError?.inviteCode === inviteCode
      ? joinError.message
      : null;

  if (authLoading) {
    return (
      <div className="text-text-primary flex min-h-screen flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-center select-none">
          <CoSplitIcon className="animate-pulse" />
          <Spinner className="text-primary-green h-12 w-12" />
          <p className="text-text-muted text-sm font-semibold">
            Joining ledger sheet...
          </p>
        </div>
      </div>
    );
  }

  if (user && !currentJoinError) {
    return (
      <div className="text-text-primary flex min-h-screen flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-center select-none">
          <CoSplitIcon className="animate-pulse" />
          <Spinner className="text-primary-green h-12 w-12" />
          <p className="text-text-muted text-sm font-semibold">
            Joining ledger sheet...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-text-primary flex min-h-screen flex-col px-4 py-8 font-sans">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <CoSplitIcon />
            <span className="text-lg font-extrabold">Co-Split</span>
          </div>
          <ThemeToggle />
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center py-12">
          <section className="glass-card animate-fade-in w-full max-w-md rounded-2xl p-7 text-center shadow-md sm:p-9">
            <div className="bg-primary-green-light text-primary-green mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
              <UserGroupIcon className="h-7 w-7" />
            </div>
            <p className="text-primary-green mb-2 text-[11px] font-extrabold tracking-[0.16em] uppercase">
              You have an invitation
            </p>
            <h1 className="text-text-primary text-2xl leading-tight font-extrabold">
              {ledgerName ? `Join ${ledgerName}` : 'Join your group on Co-Split'}
            </h1>
            <p className="text-text-secondary mx-auto mt-3 max-w-sm text-sm leading-relaxed">
              You are invited to join{' '}
              {ledgerName ? <strong>{ledgerName}</strong> : 'a shared expense ledger'}
              . Sign in to accept the invite and start sharing expenses. After
              you sign in, we'll return you to this invite.
            </p>
            <div className="border-border-subtle mt-6 border-t pt-6">
              <GoogleLogin />
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-text-muted hover:text-text-primary mt-4 cursor-pointer text-xs font-semibold transition-colors"
              >
                Go to Co-Split home
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="text-text-primary flex min-h-screen flex-col items-center justify-center px-4 font-sans">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 text-center shadow-md">
        <div className="[data-theme='dark']_&:text-rose-400 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-rose-600">
          <ExclamationTriangleIcon className="h-7 w-7" />
        </div>
        <h2 className="text-text-primary text-lg font-bold">
          Cannot Join Ledger
        </h2>
        <p className="text-text-muted mt-2 text-xs leading-relaxed font-medium">
          {currentJoinError}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary-green hover:bg-primary-green-hover border-primary-green/10 mt-6 cursor-pointer rounded-xl border px-5 py-2.5 text-xs font-bold text-white transition-all hover:shadow-xs active:scale-[0.98]"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};
