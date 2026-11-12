import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import * as workspaceService from '@/services/workspaceService';

import { Spinner } from '@/components/Spinner';
import { CoSplitIcon } from '@/components/CoSplitIcon';
import { GoogleLogin } from '@/auth/GoogleLogin';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { WarningIcon, UsersThreeIcon, ArrowLeftIcon } from '@phosphor-icons/react';

export function JoinPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [invitePreview, setInvitePreview] = useState<{
    inviteCode: string;
    ledgerName: string | null;
  } | null>(null);

  const [joinError, setJoinError] = useState<{
    inviteCode: string;
    message: string;
  } | null>(null);

  const ledgerName = invitePreview?.inviteCode === inviteCode ? invitePreview?.ledgerName : null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cosplit.site';

  useDocumentMetadata({
    title: 'Join Expense Ledger - Co-Split',
    description:
      'You have been invited to join a shared expense ledger sheet on Co-Split. Sign in to collaborate and start splitting bills in real-time.',
    url: inviteCode ? `${origin}/join/${inviteCode}` : origin,
    image: `${origin}/icons/co-split-icon.png`,
  });

  // Fetch invite preview for unauthenticated users
  useEffect(() => {
    if (authLoading || user || !inviteCode) return;

    let active = true;

    workspaceService
      .getWorkspaceInvitePreview(inviteCode)
      .then((name) => {
        if (active) {
          setInvitePreview({
            inviteCode,
            ledgerName: name,
          });
        }
      })
      .catch(() => {
        if (active) {
          setInvitePreview({
            inviteCode,
            ledgerName: null,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [authLoading, user, inviteCode]);

  // Automatically join after authentication
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
        const workspaceId = await workspaceService.joinWorkspaceWithCode(inviteCode);

        if (active) {
          navigate(`/workspace/${workspaceId}`, {
            replace: true,
          });
        }
      } catch (error) {
        console.error('Error joining workspace:', error);

        if (active) {
          setJoinError({
            inviteCode,
            message:
              error instanceof Error
                ? error.message
                : 'Failed to join the workspace. The invite code may be invalid or expired.',
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

  // Loading state
  if (authLoading || (user && !currentJoinError)) {
    return (
      <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
        <div className="flex flex-col items-center gap-5 text-center">
          <CoSplitIcon className="animate-pulse" />

          <Spinner className="size-10 text-emerald-600" />

          <div className="space-y-1">
            <p className="text-sm font-semibold">Joining workspace...</p>

            <p className="text-muted-foreground text-xs">Please wait while we process your invitation.</p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated invitation screen
  if (!user) {
    return (
      <div className="bg-background flex min-h-screen flex-col px-4 py-6">
        {/* Header */}
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2">
            <CoSplitIcon />

            <span className="text-lg font-bold tracking-tight">Co-Split</span>
          </button>

          <ThemeToggle />
        </header>

        {/* Invitation */}
        <main className="flex flex-1 items-center justify-center py-12">
          <Card className="border-border bg-card w-full max-w-md shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                  <UsersThreeIcon size={28} weight="duotone" />
                </div>

                {/* Heading */}
                <p className="mb-2 text-[11px] font-semibold tracking-[0.15em] text-emerald-600 uppercase">
                  You've been invited
                </p>

                <h1 className="text-2xl font-bold tracking-tight">
                  {ledgerName ? `Join ${ledgerName}` : 'Join your group on Co-Split'}
                </h1>

                <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
                  You are invited to join{' '}
                  {ledgerName ? (
                    <strong className="text-foreground font-semibold">{ledgerName}</strong>
                  ) : (
                    'a shared expense workspace'
                  )}
                  . Sign in to accept the invitation and start sharing expenses with your group.
                </p>

                {/* Authentication */}
                <div className="border-border mt-7 w-full border-t pt-6">
                  <GoogleLogin />

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="text-muted-foreground mt-3 h-9 w-full gap-2 text-xs"
                  >
                    <ArrowLeftIcon size={14} />
                    Back to home
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <footer className="py-3 text-center">
          <p className="text-muted-foreground text-[11px]">Co-Split · Shared expenses, simplified.</p>
        </footer>
      </div>
    );
  }

  // Join error state
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="border-border bg-card w-full max-w-md shadow-sm">
        <CardContent className="p-7 text-center sm:p-8">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600">
            <WarningIcon size={28} weight="duotone" />
          </div>

          <h2 className="text-lg font-bold tracking-tight">Unable to join workspace</h2>

          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{currentJoinError}</p>

          <div className="mt-6 flex flex-col gap-2">
            <Button type="button" onClick={() => navigate('/dashboard')} className="h-10 w-full text-xs font-semibold">
              Go to Dashboard
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-muted-foreground h-9 w-full text-xs"
            >
              Back to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
