import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import {
  InboxIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { CoSplitIcon } from '../components/CoSplitIcon';
import { Spinner } from '../components/Spinner';
import { Footer } from '../components/Footer';
import { formatCurrency } from '../lib/currency';

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
    <div className="bg-mesh-light relative flex min-h-screen flex-col overflow-hidden font-sans">
      <div className="bg-primary-green-light/45 pointer-events-none absolute top-[5%] left-[-8%] -z-10 h-[500px] w-[500px] rounded-full opacity-50 blur-3xl filter" />
      <div className="pointer-events-none absolute right-[-8%] bottom-[5%] -z-10 h-[450px] w-[450px] rounded-full bg-amber-50 opacity-40 blur-3xl filter" />
      <div className="pointer-events-none absolute top-[50%] left-[40%] -z-10 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-50 opacity-30 blur-3xl filter" />

      <nav className="sticky top-0 z-40 border-b border-white/40 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-xl backdrop-saturate-150 md:px-8">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CoSplitIcon />
            <span className="text-base font-extrabold tracking-tight text-slate-800">
              Co-Split
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="h-7 w-7 rounded-full border border-slate-200 shadow-xs"
                />
              ) : (
                <div className="bg-primary-green-light text-primary-green flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                  {profile.display_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[9px] leading-none font-bold text-slate-400">
                  Signed in as
                </span>
                <span className="mt-0.5 text-xs font-bold text-slate-700">
                  {profile.display_name}
                </span>
              </div>
            </div>
            <div className="hidden h-4 w-px bg-slate-200 md:block" />
            <button
              onClick={signOut}
              className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-all duration-200 hover:bg-rose-600 hover:text-white"
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
          <h1 className="text-slate-850 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {profile.display_name.split(' ')[0]}
            <span className="text-primary-green">.</span>
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Manage and split your group expenses across workspaces.
          </p>
        </div>

        {message && (
          <div
            className={`animate-scale-up mb-6 flex items-center gap-2 rounded-xl border p-3.5 text-xs font-bold ${
              message.type === 'error'
                ? 'border-rose-100 bg-rose-50 text-rose-700'
                : 'border-emerald-100 bg-emerald-50 text-emerald-700'
            }`}
          >
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex shrink-0 flex-col gap-5 lg:w-72 xl:w-80">
            {/* Create Ledger Card */}
            <div className="glass-card group hover:border-primary-green/20 relative flex flex-col rounded-2xl border border-white/60 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="border-primary-green/25 group-hover:border-primary-green/50 pointer-events-none absolute top-2.5 left-2.5 h-2 w-2 border-t border-l transition-colors" />
              <div className="border-primary-green/25 group-hover:border-primary-green/50 pointer-events-none absolute top-2.5 right-2.5 h-2 w-2 border-t border-r transition-colors" />
              <div className="border-primary-green/25 group-hover:border-primary-green/50 pointer-events-none absolute bottom-2.5 left-2.5 h-2 w-2 border-b border-l transition-colors" />
              <div className="border-primary-green/25 group-hover:border-primary-green/50 pointer-events-none absolute right-2.5 bottom-2.5 h-2 w-2 border-r border-b transition-colors" />

              <div className="mb-3.5">
                <h2 className="text-sm font-bold tracking-tight text-slate-800">
                  Start a new ledger
                </h2>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
                  Create a real-time split ledger for your group.
                </p>
              </div>

              <form onSubmit={handleCreateWorkspace} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Ledger title (e.g. Summer Trip)"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="focus:ring-primary-green/15 focus:border-primary-green text-slate-755 w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-semibold outline-hidden transition-all focus:bg-white focus:ring-2"
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

            {/* Join Ledger Card */}
            <div className="glass-card group hover:border-primary-green/20 relative flex flex-col rounded-2xl border border-white/60 p-5 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="border-primary-green/25 group-hover:border-primary-green/50 pointer-events-none absolute top-2.5 left-2.5 h-2 w-2 border-t border-l transition-colors" />
              <div className="border-primary-green/25 group-hover:border-primary-green/50 pointer-events-none absolute top-2.5 right-2.5 h-2 w-2 border-t border-r transition-colors" />
              <div className="border-primary-green/25 group-hover:border-primary-green/50 pointer-events-none absolute bottom-2.5 left-2.5 h-2 w-2 border-b border-l transition-colors" />
              <div className="border-primary-green/25 group-hover:border-primary-green/50 pointer-events-none absolute right-2.5 bottom-2.5 h-2 w-2 border-r border-b transition-colors" />

              <div className="mb-3.5">
                <h2 className="text-sm font-bold tracking-tight text-slate-800">
                  Join a ledger
                </h2>
                <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
                  Collaborate using a shared invite link.
                </p>
              </div>

              <form onSubmit={handleJoinWorkspace} className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Paste invite link or code..."
                  value={workspaceIdToJoin}
                  onChange={(e) => setWorkspaceIdToJoin(e.target.value)}
                  className="focus:ring-primary-green/15 focus:border-primary-green text-slate-755 w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-semibold outline-hidden transition-all focus:bg-white focus:ring-2"
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

          {/* Workspace List */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-slate-800">
                  Your workspaces
                </h2>
                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                  Click any workspace to open its ledger
                </p>
              </div>
              <span className="rounded-lg border border-slate-200 bg-slate-100/80 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                {workspaces.length} sheet{workspaces.length === 1 ? '' : 's'}
              </span>
            </div>

            {loadingWorkspaces ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                <Spinner className="text-primary-green h-8 w-8 opacity-60" />
                <p className="animate-pulse text-xs font-semibold text-slate-400">
                  Syncing ledger database...
                </p>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="glass-card flex flex-col items-center gap-4 rounded-2xl border border-white/60 p-12 text-center shadow-xs">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <InboxIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    No active workspaces
                  </p>
                  <p className="text-slate-455 mt-1 max-w-xs text-[10px]">
                    Start a new ledger or paste a shared ID key on the left to
                    begin splitting expenses.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {workspaces.map((workspace) => {
                  const isOwner = workspace.owner_id === user?.id;
                  const netBalance = workspace.user_net_balance;
                  const isPositive = netBalance >= 0;
                  const isSettled = Math.abs(netBalance) < 0.01;

                  return (
                    <div
                      key={workspace.id}
                      onClick={() => navigate(`/workspace/${workspace.id}`)}
                      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-100/80 bg-white shadow-xs transition-all duration-200 hover:scale-[1.015] hover:border-slate-200/60 hover:shadow-md"
                    >
                      <div className="from-primary-green/60 h-[3px] w-full bg-gradient-to-r via-emerald-400/40 to-transparent" />

                      <div className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="group-hover:text-primary-green truncate text-sm font-extrabold tracking-tight text-slate-800 transition-colors">
                              {workspace.name}
                            </h3>
                            <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                              {workspace.id.slice(0, 12)}…
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {isOwner && (
                              <span className="rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700">
                                Owner
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
                            <p className="text-[9px] font-bold tracking-wide text-slate-400">
                              Total
                            </p>
                            <p className="mt-0.5 text-xs font-extrabold text-slate-800">
                              {formatCurrency(
                                workspace.total_expenses,
                                workspace.currency
                              )}
                            </p>
                          </div>

                          <div
                            className={`rounded-xl border px-3 py-2 ${
                              isSettled
                                ? 'border-slate-100 bg-slate-50/70'
                                : isPositive
                                  ? 'border-emerald-100 bg-emerald-50/60'
                                  : 'border-rose-100 bg-rose-50/60'
                            }`}
                          >
                            <p className="text-[9px] font-bold tracking-wide text-slate-400">
                              Your balance
                            </p>
                            <div className="mt-0.5 flex items-center gap-1">
                              {!isSettled &&
                                (isPositive ? (
                                  <ArrowTrendingUpIcon className="h-3 w-3 shrink-0 text-emerald-600" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-3 w-3 shrink-0 text-rose-500" />
                                ))}
                              <p
                                className={`text-xs font-extrabold ${
                                  isSettled
                                    ? 'text-slate-500'
                                    : isPositive
                                      ? 'text-emerald-700'
                                      : 'text-rose-600'
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

                      <div className="flex items-center justify-between border-t border-slate-50 px-4 py-2.5 text-[9px] font-medium text-slate-400">
                        <div className="flex items-center gap-1">
                          <UsersIcon className="h-3 w-3" />
                          <span>
                            <strong className="text-slate-600">
                              {workspace.member_count}
                            </strong>{' '}
                            member{workspace.member_count === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">
                            By{' '}
                            <strong className="text-slate-600">
                              {workspace.owner_name}
                            </strong>
                          </span>
                          <span className="text-slate-300">·</span>
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
