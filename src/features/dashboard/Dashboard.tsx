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
} from '@heroicons/react/24/outline';
import { CoSplitIcon } from '../../components/CoSplitIcon';
import { Spinner } from '../../components/Spinner';
import { Footer } from '../../components/Footer';
import { ThemeToggle } from '../../components/ThemeToggle';
import { formatCurrency } from '../../lib/currency';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, signOut } = useAuth();

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
      <div className="bg-mesh-light flex min-h-screen items-center justify-center">
        <Spinner className="text-primary-green h-16 w-16" />
      </div>
    );
  }

  return (
    <div className="bg-mesh-light relative flex min-h-screen flex-col overflow-hidden font-sans text-text-primary">
      <div className="bg-primary-green-light/45 pointer-events-none absolute top-[5%] left-[-8%] -z-10 h-[500px] w-[500px] rounded-full opacity-50 blur-3xl filter [data-theme='dark']_&:opacity-20" />
      <div className="pointer-events-none absolute right-[-8%] bottom-[5%] -z-10 h-[450px] w-[450px] rounded-full bg-amber-50 opacity-40 blur-3xl filter [data-theme='dark']_&:opacity-10" />
      <div className="pointer-events-none absolute top-[50%] left-[40%] -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50 opacity-30 blur-3xl filter [data-theme='dark']_&:opacity-10" />

      <nav className="sticky top-0 z-40 border-b border-border-glass bg-surface/75 px-4 py-3 shadow-xs backdrop-blur-xl backdrop-saturate-150 md:px-8">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CoSplitIcon />
            <span className="text-base font-extrabold tracking-tight text-text-primary">
              Co-Split
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-7 w-7 rounded-full border border-border-subtle shadow-xs"
                />
              ) : (
                <div className="bg-primary-green-light text-primary-green flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  {profile.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[9px] leading-none font-bold text-text-muted">
                  Signed in as
                </span>
                <span className="mt-0.5 text-xs font-bold text-text-primary">
                  {profile.display_name}
                </span>
              </div>
            </div>
            <ThemeToggle />
            <div className="hidden h-4 w-px bg-border-subtle md:block" />
            <button
              onClick={signOut}
              className="cursor-pointer rounded-lg bg-surface-subtle px-3 py-1.5 text-xs font-bold text-text-secondary transition-all duration-200 hover:bg-rose-600 hover:text-white"
              title="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-screen-xl flex-1 px-4 py-8 md:px-8">
        <div className="mb-8">
          <p className="text-primary-green mb-1 text-[10px] font-bold">
            Dashboard
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">
            Welcome back, {profile.display_name.split(' ')[0]}
            <span className="text-primary-green">.</span>
          </h1>
          <p className="mt-1 text-xs font-medium text-text-muted">
            Manage and split your group expenses across workspaces.
          </p>
        </div>

        {message && (
          <div
            className={`animate-scale-up mb-6 flex items-center gap-2 rounded-xl border p-3.5 text-xs font-bold ${message.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700 [data-theme="dark"]_&:border-rose-900/50 [data-theme="dark"]_&:bg-rose-950/40 [data-theme="dark"]_&:text-rose-300'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 [data-theme="dark"]_&:border-emerald-900/50 [data-theme="dark"]_&:bg-emerald-950/40 [data-theme="dark"]_&:text-emerald-300'
              }`}
          >
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex shrink-0 flex-col lg:w-72 xl:w-80">
            <div className="glass-card overflow-hidden rounded-2xl border border-border-subtle shadow-xs divide-y divide-border-subtle">
              {/* Start a new ledger */}
              <div className="p-5">
                <div className="mb-3.5">
                  <h2 className="text-sm font-bold tracking-tight text-text-primary">
                    Start a new ledger
                  </h2>
                  <p className="mt-0.5 text-[10px] leading-snug text-text-muted">
                    Create a real-time split ledger for your group.
                  </p>
                </div>

                <form onSubmit={handleCreateWorkspace} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Ledger title (e.g. Summer Trip)"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="focus:ring-primary-green/15 focus:border-primary-green w-full rounded-xl border border-border-subtle bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-primary placeholder:text-text-muted outline-hidden transition-all focus:bg-surface focus:ring-2"
                    disabled={actionLoading}
                    required
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !workspaceName.trim()}
                    className="bg-accent-coral hover:bg-accent-coral-hover flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {actionLoading ? 'Launching...' : 'Start a new ledger'}
                  </button>
                </form>
              </div>

              {/* Join a ledger */}
              <div className="bg-surface-subtle/30 p-5">
                <div className="mb-3.5">
                  <h2 className="text-sm font-bold tracking-tight text-text-primary">
                    Join a ledger
                  </h2>
                  <p className="mt-0.5 text-[10px] leading-snug text-text-muted">
                    Collaborate using a shared invite link.
                  </p>
                </div>

                <form onSubmit={handleJoinWorkspace} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Paste invite link or code..."
                    value={workspaceIdToJoin}
                    onChange={(e) => setWorkspaceIdToJoin(e.target.value)}
                    className="focus:ring-primary-green/15 focus:border-primary-green w-full rounded-xl border border-border-subtle bg-surface-subtle px-3 py-2 text-xs font-semibold text-text-primary placeholder:text-text-muted outline-hidden transition-all focus:bg-surface focus:ring-2"
                    disabled={actionLoading}
                    required
                  />
                  <button
                    type="submit"
                    disabled={actionLoading || !workspaceIdToJoin.trim()}
                    className="bg-primary-green hover:bg-primary-green-hover flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-xs transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                  >
                    Join ledger
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Workspace List */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-text-primary">
                  Your workspaces
                </h2>
                <p className="mt-0.5 text-[10px] font-medium text-text-muted">
                  Click any workspace to open its ledger
                </p>
              </div>
              <span className="rounded-lg border border-border-subtle bg-surface-subtle px-2.5 py-1 text-[10px] font-bold text-text-secondary">
                {workspaces.length} sheet{workspaces.length === 1 ? '' : 's'}
              </span>
            </div>

            {loadingWorkspaces ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <Spinner className="text-primary-green h-8 w-8 opacity-60" />
                <p className="animate-pulse text-xs font-semibold text-text-muted">
                  Syncing ledger database...
                </p>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="glass-card flex flex-col items-center gap-4 rounded-2xl p-12 text-center shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
                  <InboxIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">
                    No active workspaces
                  </p>
                  <p className="mt-1 max-w-xs text-[10px] text-text-muted">
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
                      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border-subtle bg-surface p-4 shadow-xs transition-all duration-200 hover:scale-[1.01] hover:border-border-strong hover:shadow-md"
                    >
                      <div className="from-primary-green/60 absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r via-emerald-400/40 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="group-hover:text-primary-green truncate text-sm font-extrabold tracking-tight text-text-primary transition-colors">
                              {workspace.name}
                            </h3>
                            <p className="mt-0.5 font-mono text-[9px] text-text-muted">
                              {workspace.id.slice(0, 12)}…
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {isOwner && (
                              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600 [data-theme='dark']_&:text-emerald-400">
                                Owner
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-surface-subtle">
                          <div className="px-3 py-2">
                            <p className="text-[9px] font-bold tracking-wide text-text-muted">
                              Total
                            </p>
                            <p className="mt-0.5 text-xs font-extrabold text-text-primary">
                              {formatCurrency(
                                workspace.total_expenses,
                                workspace.currency
                              )}
                            </p>
                          </div>

                          <div
                            className="px-3 py-2 bg-surface-subtle"
                          >
                            <p className="text-[9px] font-bold tracking-wide text-text-muted">
                              Your balance
                            </p>
                            <div className="mt-0.5 flex items-center gap-1">
                              {!isSettled &&
                                (isPositive ? (
                                  <ArrowTrendingUpIcon className="h-3 w-3 shrink-0 text-emerald-600 [data-theme='dark']_&:text-emerald-400" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-3 w-3 shrink-0 text-rose-500" />
                                ))}
                              <p
                                className={`text-xs font-extrabold ${isSettled
                                  ? 'text-text-muted'
                                  : isPositive
                                    ? 'text-emerald-600 [data-theme="dark"]_&:text-emerald-400'
                                    : 'text-rose-600 [data-theme="dark"]_&:text-rose-400'
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

                      <div className="mt-3 flex items-center justify-between border-t border-border-subtle/60 pt-2.5 text-[9px] font-medium text-text-muted">
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

      <Footer className="max-w-screen-xl md:px-8" />
    </div>
  );
};
