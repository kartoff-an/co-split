import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useDashboard } from './useDashboard';
import {
  InboxIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { CoSplitIcon } from '../../components/CoSplitIcon';
import { Spinner } from '../../components/Spinner';
import { Footer } from '../../components/Footer';
import { ThemeToggle } from '../../components/ThemeToggle';
import { formatCurrency } from '../../lib/currency';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceIdToJoin, setWorkspaceIdToJoin] = useState('');

  const {
    workspaces,
    loadingWorkspaces,
    actionLoading,
    message,
    createWorkspace,
    joinWorkspace,
  } = useDashboard(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleCreateWorkspace = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const newId = await createWorkspace(workspaceName);
    if (newId) {
      setWorkspaceName('');
      navigate(`/workspace/${newId}`);
    }
  };

  const handleJoinWorkspace = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const sharedId = await joinWorkspace(workspaceIdToJoin);
    if (sharedId) {
      setWorkspaceIdToJoin('');
      navigate(`/workspace/${sharedId}`);
    }
  };

  if (authLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="text-primary-green h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="text-text-primary relative flex min-h-screen flex-col overflow-hidden font-sans">
      <nav className="border-border-glass bg-surface/75 sticky top-0 z-40 border-b px-4 py-3 shadow-xs backdrop-blur-xl backdrop-saturate-150 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CoSplitIcon />
            <span className="text-text-primary text-base font-extrabold tracking-tight">
              Co-Split
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="border-border-subtle h-7 w-7 rounded-full border shadow-xs"
                />
              ) : (
                <div className="bg-primary-green-light text-primary-green flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  {profile.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-text-muted text-[9px] leading-none font-bold">
                  Signed in as
                </span>
                <span className="text-text-primary mt-0.5 text-xs font-bold">
                  {profile.display_name}
                </span>
              </div>
            </div>
            <ThemeToggle />
            <div className="bg-border-subtle hidden h-4 w-px md:block" />
            <button
              onClick={signOut}
              className="bg-surface-subtle text-text-secondary cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 hover:bg-rose-600 hover:text-white"
              title="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-text-primary text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {profile.display_name.split(' ')[0]}
            <span className="text-primary-green">.</span>
          </h1>
          <p className="text-text-muted mt-1 text-xs">
            Manage and split your group expenses across workspaces.
          </p>
        </div>

        {message && (
          <div
            className={`animate-scale-up mb-6 flex items-center gap-2 rounded-xl border p-3.5 text-xs font-bold ${
              message.type === 'error'
                ? '[data-theme="dark"]_&:border-rose-900/50 [data-theme="dark"]_&:bg-rose-950/40 [data-theme="dark"]_&:text-rose-300 border-rose-200 bg-rose-50 text-rose-700'
                : '[data-theme="dark"]_&:border-emerald-900/50 [data-theme="dark"]_&:bg-emerald-950/40 [data-theme="dark"]_&:text-emerald-300 border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex shrink-0 flex-col lg:w-72 xl:w-80">
            <div className="glass-card border-border-subtle overflow-hidden rounded-lg border shadow-xs">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="flex shrink-0 flex-col lg:w-72 xl:w-80">
                  <div className="glass-card border-border-subtle overflow-hidden rounded-2xl border shadow-xs">
                    {/* Segmented Control Tabs */}
                    <div className="border-border-subtle border-b p-2">
                      <div className="bg-surface-subtle grid grid-cols-2 gap-1 rounded-xl p-1">
                        <button
                          type="button"
                          onClick={() => setActiveTab('create')}
                          className={`cursor-pointer rounded-lg py-1.5 text-xs font-bold transition-all duration-150 ${
                            activeTab === 'create'
                              ? 'bg-surface text-text-primary shadow-xs'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('join')}
                          className={`cursor-pointer rounded-lg py-1.5 text-xs font-bold transition-all duration-150 ${
                            activeTab === 'join'
                              ? 'bg-surface text-text-primary shadow-xs'
                              : 'text-text-muted hover:text-text-primary'
                          }`}
                        >
                          Join
                        </button>
                      </div>
                    </div>

                    {/* Form Body */}
                    <div className="p-5">
                      {activeTab === 'create' ? (
                        <div>
                          <div className="mb-3.5">
                            <h2 className="text-text-primary text-sm font-bold tracking-tight">
                              Start a new ledger
                            </h2>
                            <p className="text-text-muted mt-0.5 text-[10px] leading-snug">
                              Create a real-time split ledger for your group.
                            </p>
                          </div>

                          <form
                            onSubmit={handleCreateWorkspace}
                            className="space-y-2.5"
                          >
                            <InputField
                              placeholder="Ledger title (e.g. Summer Trip)"
                              value={workspaceName}
                              onChange={(event) =>
                                setWorkspaceName(event.target.value)
                              }
                              disabled={actionLoading}
                              required
                            />
                            <Button
                              type="submit"
                              className="w-full"
                              isLoading={actionLoading}
                              disabled={!workspaceName.trim()}
                            >
                              <PlusIcon className="h-4 w-4" />
                              {actionLoading
                                ? 'Launching...'
                                : 'Start a new ledger'}
                            </Button>
                          </form>
                        </div>
                      ) : (
                        <div>
                          <div className="mb-3.5">
                            <h2 className="text-text-primary text-sm font-bold tracking-tight">
                              Join a ledger
                            </h2>
                            <p className="text-text-muted mt-0.5 text-[10px] leading-snug">
                              Collaborate using a shared invite link.
                            </p>
                          </div>

                          <form
                            onSubmit={handleJoinWorkspace}
                            className="space-y-2.5"
                          >
                            <InputField
                              placeholder="Paste invite link or code..."
                              value={workspaceIdToJoin}
                              onChange={(event) =>
                                setWorkspaceIdToJoin(event.target.value)
                              }
                              disabled={actionLoading}
                              required
                            />
                            <Button
                              type="submit"
                              className="w-full"
                              isLoading={actionLoading}
                              disabled={!workspaceIdToJoin.trim()}
                            >
                              {actionLoading ? 'Joining...' : 'Join ledger'}
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workspace List */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-text-primary text-base font-extrabold tracking-tight">
                  Your workspaces
                </h2>
                <p className="text-text-muted mt-0.5 text-[10px]">
                  Click any workspace to open its ledger
                </p>
              </div>
              <span className="border-border-subtle text-text-secondary rounded-lg border px-2.5 py-1 text-[10px] font-bold">
                {workspaces.length} sheet{workspaces.length === 1 ? '' : 's'}
              </span>
            </div>

            {loadingWorkspaces ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <Spinner className="text-primary-green h-8 w-8 opacity-60" />
                <p className="text-text-muted animate-pulse text-xs font-semibold">
                  Syncing ledger database...
                </p>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="glass-card flex flex-col items-center gap-4 rounded-2xl p-12 text-center shadow-xs">
                <div className="bg-surface-subtle text-text-muted flex h-12 w-12 items-center justify-center rounded-full">
                  <InboxIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-text-primary text-xs font-bold">
                    No active workspaces
                  </p>
                  <p className="text-text-muted mt-1 max-w-xs text-[10px]">
                    Start a new ledger or paste a shared ID key on the left to
                    begin splitting expenses.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {workspaces.map((workspace) => {
                  const isOwner = workspace.owner_id === user?.id;
                  const netBalance = workspace.user_net_balance;
                  const isPositive = netBalance >= 0;
                  const isSettled = Math.abs(netBalance) < 0.01;

                  return (
                    <div
                      key={workspace.id}
                      onClick={() => navigate(`/workspace/${workspace.id}`)}
                      className="group border-border-subtle bg-surface hover:border-border-strong relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-xs transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
                    >
                      <div className="from-primary-green/60 absolute top-0 left-0 h-0.5 w-full bg-linear-to-r via-emerald-400/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="group-hover:text-primary-green text-text-primary truncate text-sm font-extrabold tracking-tight transition-colors">
                            {workspace.name}
                          </h3>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {isOwner && (
                              <span className="[data-theme='dark']_&:text-emerald-400 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] text-emerald-600">
                                Owner
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="divide-border-subtle border-border-subtle bg-surface-subtle grid grid-cols-2 divide-x overflow-hidden rounded-xl border">
                          <div className="px-3 py-2">
                            <p className="text-text-muted text-[9px]">Total</p>
                            <p className="text-text-primary mt-0.5 text-xs">
                              {formatCurrency(
                                workspace.total_expenses,
                                workspace.currency
                              )}
                            </p>
                          </div>

                          <div className="bg-surface-subtle px-3 py-2">
                            <p className="text-text-muted text-[9px]">
                              Your balance
                            </p>
                            <div className="mt-0.5 flex items-center gap-1">
                              {!isSettled &&
                                (isPositive ? (
                                  <ArrowTrendingUpIcon className="[data-theme='dark']_&:text-emerald-400 h-3 w-3 shrink-0 text-emerald-600" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-3 w-3 shrink-0 text-rose-500" />
                                ))}
                              <p
                                className={`text-xs ${
                                  isSettled
                                    ? 'text-text-muted'
                                    : isPositive
                                      ? '[data-theme="dark"]_&:text-emerald-400 text-emerald-600'
                                      : '[data-theme="dark"]_&:text-rose-400 text-rose-600'
                                }`}
                              >
                                {isSettled
                                  ? 'Settled'
                                  : `${isPositive ? '+' : '-'}${formatCurrency(netBalance, workspace.currency)}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-border-subtle/60 text-text-muted mt-3 flex items-center justify-between border-t pt-2.5 text-[9px]">
                        <div className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          <span>
                            <strong className="text-text-secondary">
                              {workspace.member_count}
                            </strong>{' '}
                            member{workspace.member_count === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-text-muted">
                            By{' '}
                            <strong className="text-text-secondary">
                              {workspace.owner_name}
                            </strong>
                          </span>
                          <span className="text-border-strong">·</span>
                          <span>
                            {new Date(workspace.created_at).toLocaleDateString(
                              undefined,
                              {
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer className="max-w-7xl md:px-8" />
    </div>
  );
};
