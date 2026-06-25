import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkspace } from '../hooks/useWorkspace';
import { useBalance } from '../hooks/useBalance';
import { useAuth } from '../hooks/useAuth';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseList } from '../components/ExpenseList';
import { BalanceSummary } from '../components/BalanceSummary';
import type { Expense } from '../types';
import { InviteModal } from '../components/InviteModal';
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '../components/Spinner';
import { CoSplitIcon } from '../components/CoSplitIcon';
import { Footer } from '../components/Footer';
import { WorkspaceSettingsModal } from '../components/WorkspaceSettingsModal';
import * as workspaceService from '../services/workspaceService';

export const WorkspacePage: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('code');
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    removeMember,
    updateWorkspace,
    deleteWorkspace,
    regenerateInvite,
    refetch,
  } = useWorkspace(workspaceId || '');

  const handleDeleteWorkspace = async () => {
    const success = await deleteWorkspace();
    if (success) {
      navigate('/dashboard');
      return true;
    }
    return false;
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
      <div className="bg-mesh-light flex min-h-screen items-center justify-center p-4">
        <div className="animate-scale-up w-full max-w-md space-y-5 rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Connection Interrupted
            </h3>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-855 w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xs transition duration-200 hover:bg-slate-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="bg-mesh-light flex min-h-screen items-center justify-center p-4">
        <div className="animate-scale-up w-full max-w-md space-y-5 rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <ExclamationTriangleIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {joinError ? 'Access Denied' : 'Workspace Not Found'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {joinError ||
                'The ledger sheet you are looking for might have been archived, deleted, or requires a valid invite code to access.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-855 w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xs transition duration-200 hover:bg-slate-800"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-mesh-light min-h-screen pb-12 font-sans">
      <nav className="sticky top-0 z-40 border-b border-white/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              title="Return to Dashboard"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <CoSplitIcon />
              <span className="hidden text-base font-extrabold tracking-tight text-slate-800 sm:inline">
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
                className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                title="Workspace Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            )}

            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-7 w-7 rounded-full border border-slate-200"
                />
              ) : (
                <div className="bg-primary-green-light text-primary-green flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  {profile?.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden flex-col text-left md:flex">
                <span className="text-[10px] leading-none font-bold text-slate-400">
                  Signed in as
                </span>
                <span className="mt-0.5 text-xs font-bold text-slate-700">
                  {profile?.display_name}
                </span>
              </div>
              <button
                onClick={signOut}
                className="ml-1 cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-200 hover:bg-rose-600 hover:text-white"
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
          <div className="animate-scale-up flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-rose-550 cursor-pointer px-1.5 font-extrabold hover:text-rose-800"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex flex-col justify-between gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs md:flex-row md:items-center">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400">
              Workspace ledger
            </span>
            <h2 className="text-lg leading-tight font-extrabold tracking-tight text-slate-800 md:text-xl">
              {workspace.name}
            </h2>
          </div>

          <div className="space-y-2 md:text-right">
            <span className="block text-[10px] font-bold text-slate-400">
              Workspace Members
            </span>
            <div className="flex flex-wrap gap-1.5 md:justify-end">
              {members.map((member) => (
                <span
                  key={member.id}
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                    member.id === user?.id
                      ? 'text-accent-coral border-accent-coral/45 bg-white shadow-2xs'
                      : 'border-slate-250 bg-white text-slate-600'
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
