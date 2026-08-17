import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkspace } from './useWorkspace';
import { useBalance } from '../expenses/useBalance';
import { useAuth } from '../auth/useAuth';
import { ExpenseForm } from '../expenses/ExpenseForm';
import { ExpenseList } from '../expenses/ExpenseList';
import { BalanceSummary } from '../expenses/BalanceSummary';
import { SettleUpModal } from '../expenses/SettleUpModal';
import type { Expense, Settlement } from '../../types';
import { InviteModal } from './InviteModal';
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '../../components/Spinner';
import { CoSplitIcon } from '../../components/CoSplitIcon';
import { Footer } from '../../components/Footer';
import { ThemeToggle } from '../../components/ThemeToggle';
import { WorkspaceSettingsModal } from './WorkspaceSettingsModal';
import * as workspaceService from './workspaceService';
import { useDocumentMetadata } from '../../hooks/useDocumentMetadata';

export const WorkspacePage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code');
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  // If the user tries to view this ledger but is not logged in:
  // 1. Temporarily save the current workspaceId in sessionStorage.
  // 2. Redirect them to the homepage for authentication.
  // 3. Once they sign in with Google, the homepage checks for 'co-split:pendingWorkspaceId' and automatically routes them back here.
  useEffect(() => {
    if (!authLoading && !user && workspaceId) {
      sessionStorage.setItem('co-split:pendingWorkspaceId', workspaceId);
      navigate('/', { replace: true });
    }
  }, [user, authLoading, workspaceId, navigate]);

  const {
    workspace,
    expenses,
    members,
    loading: workspaceLoading,
    error,
    clearError,
    hasMore,
    loadingMore,
    loadMoreExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    removeMember,
    updateWorkspace,
    deleteWorkspace,
    regenerateInvite,
    refetch,
  } = useWorkspace(workspaceId || '');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cosplit.site/';
  useDocumentMetadata({
    title: workspace ? `${workspace.name} - Co-Split Ledger` : 'Workspace - Co-Split',
    description: workspace
      ? `Shared expense ledger for ${workspace.name}. Add expenses, track balances, and settle up bills instantly.`
      : 'Collaborative shared expense ledger sheet on Co-Split.',
    url: workspaceId ? `${origin}/workspace/${workspaceId}` : origin,
    image: `${origin}/icons/co-split-icon.png`
  });

  const handleDeleteWorkspace = async () => {
    const success = await deleteWorkspace();
    if (success) {
      navigate('/dashboard');
      return true;
    }
    return false;
  };

  const handleConfirmSettlement = async (
    paidBy: string,
    paidTo: string,
    amount: number
  ) => {
    const payerName =
      members.find((member) => member.id === paidBy)?.display_name || 'Member';
    const payeeName =
      members.find((member) => member.id === paidTo)?.display_name || 'Member';

    await addExpense({
      description: `Payment: ${payerName} paid ${payeeName}`,
      amount,
      category: 'Payment',
      paid_by: paidBy,
      split_members: [paidTo],
    });
    refetch();
  };

  const isOwner = !!(user && workspace && workspace.owner_id === user.id);

  const { balances, settlements, totalWorkspaceCost, averageCostPerPerson } =
    useBalance(workspaceId || '', expenses.length);

  const isMember =
    user && members.length > 0
      ? members.some((member) => member.id === user.id)
      : false;

  // Secure auto-join invite logic: if the user is logged in, visits a workspace url,
  // is not yet a member, and has provided a 'code' query parameter, execute the join RPC.
  useEffect(() => {
    if (
      !user ||
      authLoading ||
      !workspaceId ||
      !inviteCode ||
      joined ||
      joining
    )
      return;
    if (isMember) return;

    const performJoin = async () => {
      setJoining(true);
      setJoinError(null);
      try {
        await workspaceService.joinWorkspaceWithCode(inviteCode);
        setJoined(true);
        refetch();
      } catch (err) {
        console.error('Failed to join workspace with code:', err);
        setJoinError(
          err instanceof Error ? err.message : 'Invalid or expired invite link.'
        );
      } finally {
        setJoining(false);
      }
    };

    if (!workspaceLoading) {
      performJoin();
    }
  }, [
    user,
    authLoading,
    workspaceId,
    inviteCode,
    isMember,
    workspaceLoading,
    joined,
    joining,
    refetch,
  ]);

  const handleAddExpense = async (
    expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>
  ) => {
    try {
      await addExpense(expense);
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  if (authLoading || joining || (workspaceLoading && !workspace)) {
    return (
      <div className="bg-mesh-light flex min-h-screen items-center justify-center">
        <Spinner className="text-primary-green h-16 w-16" />
      </div>
    );
  }

  if (error && !workspace) {
    return (
      <div className="bg-mesh-light flex min-h-screen items-center justify-center p-4 font-sans text-text-primary">
        <div className="animate-scale-up w-full max-w-md space-y-5 rounded-3xl border border-rose-200 bg-surface p-8 text-center shadow-xl [data-theme='dark']_&:border-rose-900/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 [data-theme='dark']_&:text-rose-400">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              Connection Interrupted
            </h3>
            <p className="mt-1 text-sm text-text-muted">{error}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full cursor-pointer rounded-xl bg-primary-green px-4 py-3 text-sm font-semibold text-white shadow-xs transition duration-200 hover:bg-primary-green-hover"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="bg-mesh-light flex min-h-screen items-center justify-center p-4 font-sans text-text-primary">
        <div className="animate-scale-up w-full max-w-md space-y-5 rounded-3xl border border-border-subtle bg-surface p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 [data-theme='dark']_&:text-rose-400">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              {joinError ? 'Access Denied' : 'Workspace Not Found'}
            </h3>
            <p className="mt-1 text-sm text-text-muted">
              {joinError ||
                'The ledger sheet you are looking for might have been archived, deleted, or requires a valid invite code to access.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full cursor-pointer rounded-xl bg-primary-green px-4 py-3 text-sm font-semibold text-white shadow-xs transition duration-200 hover:bg-primary-green-hover"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-mesh-light min-h-screen pb-12 font-sans text-text-primary">
      <nav className="sticky top-0 z-40 border-b border-border-glass bg-surface/75 px-4 py-3 shadow-xs backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
              title="Return to Dashboard"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <CoSplitIcon />
              <span className="hidden text-base font-extrabold tracking-tight text-text-primary sm:inline">
                Co-Split
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInviteOpen(true)}
              className="bg-accent-coral hover:bg-accent-coral-hover flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-all duration-200"
            >
              <UserPlusIcon className="h-4 w-4" />
              <span>Invite</span>
            </button>

            {isOwner && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="cursor-pointer rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
                title="Workspace Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            )}

            <ThemeToggle />

            <div className="flex items-center gap-2 border-l border-border-subtle pl-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-7 w-7 rounded-full border border-border-subtle"
                />
              ) : (
                <div className="bg-primary-green-light text-primary-green flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  {profile?.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden flex-col text-left md:flex">
                <span className="text-[9px] leading-none font-bold text-text-muted">
                  Signed in as
                </span>
                <span className="mt-0.5 text-xs font-bold text-text-primary">
                  {profile?.display_name}
                </span>
              </div>
              <button
                onClick={signOut}
                className="ml-1 cursor-pointer rounded-lg bg-surface-subtle px-3 py-1.5 text-xs font-bold text-text-secondary transition-all duration-200 hover:bg-rose-600 hover:text-white"
                title="Sign out of Google Session"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="animate-slide-up mx-auto mt-5 max-w-6xl space-y-4 px-4">
        {error && (
          <div className="animate-scale-up flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 [data-theme='dark']_&:border-rose-900/50 [data-theme='dark']_&:bg-rose-950/40 [data-theme='dark']_&:text-rose-300">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="cursor-pointer px-1.5 font-extrabold text-rose-600 hover:text-rose-800"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex flex-col justify-between gap-3.5 rounded-2xl border border-border-subtle bg-surface p-4 shadow-2xs md:flex-row md:items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-text-muted">
              Workspace ledger
            </span>
            <h2 className="text-lg leading-tight font-extrabold tracking-tight text-text-primary md:text-xl">
              {workspace.name}
            </h2>
          </div>

          <div className="space-y-2 md:text-right">
            <span className="block text-[10px] font-bold text-text-muted">
              Workspace Members
            </span>
            <div className="flex flex-wrap gap-1.5 md:justify-end">
              {members.map((member) => (
                <span
                  key={member.id}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    member.id === user?.id
                      ? 'border-accent-coral/45 bg-surface text-accent-coral shadow-2xs'
                      : 'border-border-subtle bg-surface text-text-secondary'
                  }`}
                >
                  {member.avatar_url && (
                    <img
                      src={member.avatar_url}
                      alt={member.display_name}
                      className="h-3.5 w-3.5 shrink-0 rounded-full"
                    />
                  )}
                  <span>
                    {member.display_name}{' '}
                    {member.id === user?.id ? '(You)' : ''}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <ExpenseForm
              members={members}
              onAddExpense={handleAddExpense}
              activeUserId={user?.id}
              currency={workspace.currency}
            />
            <BalanceSummary
              balances={balances}
              settlements={settlements}
              totalWorkspaceCost={totalWorkspaceCost}
              averageCostPerPerson={averageCostPerPerson}
              activeUserId={user?.id}
              members={members}
              currency={workspace.currency}
              onSettleUp={(settlement) => {
                setSelectedSettlement(settlement);
                setIsSettleUpOpen(true);
              }}
            />
          </div>

          <div className="lg:col-span-2">
            <ExpenseList
              expenses={expenses}
              members={members}
              activeUserId={user?.id}
              currency={workspace.currency}
              hasMore={hasMore}
              onLoadMore={loadMoreExpenses}
              loadingMore={loadingMore}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
            />
          </div>
        </div>
      </div>

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        workspaceId={workspaceId || ''}
        workspaceName={workspace?.name || ''}
        inviteCode={workspace?.invite_code}
        isOwner={isOwner}
        onRegenerateInvite={regenerateInvite}
      />

      <SettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => {
          setIsSettleUpOpen(false);
          setSelectedSettlement(null);
        }}
        settlement={selectedSettlement}
        members={members}
        currency={workspace?.currency}
        onConfirmSettlement={handleConfirmSettlement}
      />

      {workspace && (
        <WorkspaceSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          workspace={workspace}
          members={members}
          onUpdateWorkspace={updateWorkspace}
          onRemoveMember={removeMember}
          onDeleteWorkspace={handleDeleteWorkspace}
          currentUserId={user?.id}
        />
      )}

      <Footer />
    </div>
  );
};
