import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useBalance, workspaceBalanceQueryKey } from '@/hooks/useBalance';
import * as workspaceService from '@/services/workspaceService';
import * as settlementService from '@/services/settlementService';

import { InviteModal } from './components/InviteModal';
import { WorkspaceSettingsModal } from '@/pages/workspace/components/WorkspaceSettingsModal';
import { SettleUpModal } from '@/pages/settlements/SettleUpModal';

import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

import { Button } from '@/components/ui/button';
import { SpinnerGapIcon, WarningCircleIcon } from '@phosphor-icons/react';

import { WorkspaceHeader } from './components/WorkspaceHeader';
import { BalanceSummary } from './components/BalanceSummary';
import { TransactionSection } from './components/TransactionSection';
import { WorkspaceMembers } from './components/WorkspaceMembers';
import { WorkspaceOverview } from './components/WorkspaceOverview';
import { WorkspaceWelcome } from './components/WorkspaceWelcome';
import { useQueryClient } from '@tanstack/react-query';
import type { ExpenseFilters, Expense, ExpenseCreate, ExpenseUpdate } from '@/api/types';

export function WorkspacePage() {
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const inviteCode = searchParams.get('code');

  const { user, profile, loading: authLoading } = useAuth();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);

  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const [expenseFilters, setExpenseFilters] = useState<ExpenseFilters>({});

  const handleExpenseFiltersChange = useCallback((filters: ExpenseFilters) => {
    setExpenseFilters(filters);
  }, []);

  const {
    workspace,
    expenses,
    expensesTotal,
    expensesFetching,
    members,
    loading: workspaceLoading,
    error,
    clearError,
    hasMore,
    loadingMore,
    loadMoreExpenses,
    addExpense,
    deleteExpense,
    updateExpense,
    removeMember,
    updateWorkspace,
    deleteWorkspace,
    regenerateInvite,
    refetch,
  } = useWorkspace(workspaceId, expenseFilters);

  const {
    members: memberBalances,
    suggestedSettlements,
    totalWorkspaceCost,
    averageCostPerPerson,
  } = useBalance(workspaceId);

  const isMember = !!user && members.some((member) => member.id === user.id);
  const isOwner = !!user && workspace?.owner_id === user.id;

  useEffect(() => {
    if (!authLoading && !user && workspaceId) {
      sessionStorage.setItem('co-split:pendingWorkspaceId', workspaceId);
      navigate('/', { replace: true });
    }
  }, [authLoading, user, workspaceId, navigate]);

  useEffect(() => {
    if (!user || authLoading || !workspaceId || !inviteCode || joined || joining || isMember || workspaceLoading) {
      return;
    }

    const performJoin = async () => {
      setJoining(true);
      setJoinError(null);

      try {
        await workspaceService.joinWorkspaceWithCode(inviteCode);
        setJoined(true);
        await refetch();
      } catch (err) {
        setJoinError(err instanceof Error ? err.message : 'Invalid or expired invite link.');
      } finally {
        setJoining(false);
      }
    };

    void performJoin();
  }, [user, authLoading, workspaceId, inviteCode, joined, joining, isMember, workspaceLoading, refetch]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cosplit.site';

  useDocumentMetadata({
    title: workspace ? `${workspace.name} - Co-Split` : 'Workspace - Co-Split',
    description: workspace
      ? `Shared expense ledger for ${workspace.name}. Track expenses and settle balances.`
      : 'Collaborative shared expense ledger on Co-Split.',
    url: workspaceId ? `${origin}/workspace/${workspaceId}` : origin,
    image: `${origin}/icons/co-split-icon.png`,
  });

  const handleAddExpense = async (expense: ExpenseCreate) => {
    await addExpense(expense);
  };

  const handleConfirmSettlement = async (paidBy: string, paidTo: string, amount: number) => {
    await settlementService.createSettlement(workspaceId, {
      from_user_id: paidBy,
      to_user_id: paidTo,
      amount,
      note: 'Settlement payment',
    });

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: workspaceBalanceQueryKey(workspaceId),
      }),
      queryClient.invalidateQueries({
        queryKey: ['workspace-activity', workspaceId],
      }),
    ]);
  };

  const handleUpdateExpense = async (expenseId: number | string, updates: ExpenseUpdate) => {
    try {
      await updateExpense(expenseId, updates);

      // Refresh workspace expenses and related data.
      await refetch();
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.description}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteExpense(expense.id);

      await refetch();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  };

  const handleDeleteWorkspace = async () => {
    const success = await deleteWorkspace();

    if (success) {
      navigate('/dashboard');
    }

    return success;
  };

  if (authLoading || joining || (workspaceLoading && !workspace)) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <SpinnerGapIcon size={28} className="text-muted-foreground animate-spin" />
      </div>
    );
  }

  if ((error && !workspace) || !workspace) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
          <WarningCircleIcon size={28} className="text-destructive" />

          <div className="space-y-1">
            <h2 className="text-sm font-semibold">
              {joinError ? 'Unable to join workspace' : 'Workspace unavailable'}
            </h2>

            <p className="text-muted-foreground text-xs">
              {joinError || error || 'This workspace may have been deleted or you may not have access.'}
            </p>
          </div>

          <Button size="sm" onClick={() => navigate('/dashboard')}>
            Return to dashboard
          </Button>
        </div>
      </main>
    );
  }

  return (
    <div className="bg-background min-h-full min-w-0 text-sm">
      <WorkspaceHeader
        workspaceName={workspace.name}
        isOwner={isOwner}
        onBack={() => navigate('/dashboard')}
        onInvite={() => setIsInviteOpen(true)}
        onSettings={() => setIsSettingsOpen(true)}
      />

      <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Error notification */}
          {error && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400">
              <span>{error}</span>

              <button onClick={clearError} aria-label="Dismiss error" className="text-base leading-none">
                ×
              </button>
            </div>
          )}

          {/* Workspace identity and members */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <WorkspaceWelcome name={workspace.name} createdAt={workspace.created_at} />
            </div>

            <div className="flex shrink-0 items-center">
              <WorkspaceMembers members={members} />
            </div>
          </div>

          <div className="border-border/70 border-t" />

          {/* Workspace overview */}
          <WorkspaceOverview
            totalSpent={totalWorkspaceCost}
            averagePerPerson={averageCostPerPerson}
            memberCount={members.length}
            transactionCount={expenses.length}
            currency={workspace.currency}
          />

          <div className="border-border/70 border-t" />

          {/* Main workspace content */}
          <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
            <div className="flex min-w-0 flex-col gap-4">
              <TransactionSection
                expenses={expenses}
                expensesTotal={expensesTotal}
                members={members}
                currency={workspace.currency}
                currentUserId={user?.id}
                filters={expenseFilters}
                isFetching={expensesFetching}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onFiltersChange={handleExpenseFiltersChange}
                onLoadMore={loadMoreExpenses}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            </div>

            {/* Left column */}
            <div className="flex min-w-0 flex-col gap-5">
              {/* Balance summary */}
              <section className="bg-card border-border/80 rounded-xl border p-4">
                <BalanceSummary
                  balances={memberBalances}
                  members={members}
                  currency={workspace.currency}
                  currentUserId={user?.id}
                />
              </section>

              {/* Settlement plan */}
              <section className="bg-card border-border/80 rounded-xl border p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight">Settlement plan</h3>
                  </div>

                  {suggestedSettlements.length > 0 && (
                    <Button size="sm" className="h-8 text-xs" onClick={() => setIsSettleUpOpen(true)}>
                      Settle up
                    </Button>
                  )}
                </div>

                {suggestedSettlements.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center text-xs">Everyone is settled up.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {suggestedSettlements.map((settlement, index) => {
                      const from = members.find((member) => member.id === settlement.from_user_id);

                      const to = members.find((member) => member.id === settlement.to_user_id);

                      return (
                        <div
                          key={`${settlement.from_user_id}-${settlement.to_user_id}-${index}`}
                          className="bg-muted/50 flex items-center justify-between gap-3 rounded-md px-3 py-2"
                        >
                          <p className="min-w-0 truncate text-xs">
                            {from?.display_name ?? 'Unknown member'} <span className="text-muted-foreground">owes</span>{' '}
                            {to?.display_name ?? 'Unknown member'}
                          </p>

                          <p className="shrink-0 text-xs font-semibold tabular-nums">
                            {new Intl.NumberFormat(undefined, {
                              style: 'currency',
                              currency: workspace.currency,
                            }).format(Number(settlement.amount))}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Invite modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        workspaceId={workspaceId}
        workspaceName={workspace.name}
        inviterName={profile?.display_name ?? ''}
        inviteCode={workspace.invite_code}
        isOwner={isOwner}
        onRegenerateInvite={regenerateInvite}
      />

      {/* Settlement modal */}
      <SettleUpModal
        key={isSettleUpOpen ? 'open' : 'closed'}
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        settlements={suggestedSettlements}
        members={members}
        activeUserId={user?.id}
        currency={workspace.currency}
        onConfirmSettlement={handleConfirmSettlement}
      />

      {/* Workspace settings modal */}
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
    </div>
  );
}
