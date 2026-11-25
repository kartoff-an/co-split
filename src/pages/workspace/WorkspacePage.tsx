import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useBalance } from '@/hooks/useBalance';
import { useSettlements } from '@/hooks/useSettlements';
import { useWorkspaceInvite } from '@/hooks/useWorkspaceInvite';

import { InviteModal } from './components/InviteModal';
import { WorkspaceSettingsModal } from '@/pages/workspace/components/WorkspaceSettingsModal';
import { SettleUpModal } from '@/pages/settlements/SettleUpModal';
import { SettlementHistorySection } from '../settlements/components/SettlementHistorySection';

import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';

import { Button } from '@/components/ui/button';
import { SpinnerGapIcon, WarningCircleIcon } from '@phosphor-icons/react';

import { WorkspaceHeader } from './components/WorkspaceHeader';
import { TransactionSection } from './components/TransactionSection';
import { WorkspaceMembers } from './components/WorkspaceMembers';
import { WorkspaceOverview } from './components/WorkspaceOverview';
import { WorkspaceWelcome } from './components/WorkspaceWelcome';
import type { ExpenseFilters, Expense, SettlementQueryParams } from '@/api/types';
import { WorkspaceTabNavigation } from './components/WorkspaceTabNavigation';
import { TabsContent } from '@/components/ui/tabs';
import { WorkspaceTransactionTab } from './components/WorkspaceTransactionTab';
import { WorkspaceSettlementsTab } from './components/WorkspaceSettlementsTab';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

export function WorkspacePage() {
  // ROUTING & NAVIGATION
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') === 'settlements' ? 'settlements' : 'transactions';

  const inviteCode = searchParams.get('code');

  // AUTHENTICATION
  const { user, profile, loading: authLoading } = useAuth();

  // LOCAL UI STATE
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);

  // QUERY & FILTER STATE
  const [expenseFilters, setExpenseFilters] = useState<ExpenseFilters>({});
  const [settlementFilters, setSettlementFilters] = useState<SettlementQueryParams>({});

  // DATA FETCHING
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
  } = useWorkspace(workspaceId, expenseFilters);

  const {
    members: memberBalances,
    suggestedSettlements,
    totalWorkspaceCost,
    averageCostPerPerson,
  } = useBalance(workspaceId);

  const {
    settlements,
    loading: settlementsLoading,
    fetching: settlementsFetching,
    confirmSettlement,
    deleteSettlement,
    confirming: settlementConfirming,
    deleting: settlementDeleting,
    createSettlement,
  } = useSettlements(workspaceId, settlementFilters);

  // DERIVED STATE
  const pendingSettlementCount = settlements.filter((settlement) => settlement.status === 'pending').length;

  const isMember = !!user && members.some((member) => member.id === user.id);
  const isOwner = !!user && workspace?.owner_id === user.id;

  const {
    joining,
    joinError,
    retry: retryJoin,
  } = useWorkspaceInvite({
    workspaceId,
    inviteCode,
    enabled: !!user && !!authLoading && !!workspaceId && !!inviteCode && !isMember && !workspaceLoading,
  });

  // SIDE EFFECTS
  // Authentication redirect
  useEffect(() => {
    if (!authLoading && !user && workspaceId) {
      sessionStorage.setItem('co-split:pendingWorkspaceId', workspaceId);
      navigate('/', { replace: true });
    }
  }, [authLoading, user, workspaceId, navigate]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cosplit.site';

  // DOCUMENT METADATA
  useDocumentMetadata({
    title: workspace ? `${workspace.name} - Co-Split` : 'Workspace - Co-Split',
    description: workspace
      ? `Shared expense ledger for ${workspace.name}. Track expenses and settle balances.`
      : 'Collaborative shared expense ledger on Co-Split.',
    url: workspaceId ? `${origin}/workspace/${workspaceId}` : origin,
    image: `${origin}/icons/co-split-icon.png`,
  });

  // EVENT HANDLERS
  // Filter handles
  const handleExpenseFiltersChange = useCallback((filters: ExpenseFilters) => {
    setExpenseFilters(filters);
  }, []);

  // Settlement handlers
  const handleConfirmSettlement = async (paidBy: string, paidTo: string, amount: number) => {
    await createSettlement({
      from_user_id: paidBy,
      to_user_id: paidTo,
      amount,
      note: 'Settlement payment',
    });
  };

  // Expense handlers
  const handleDeleteExpense = async (expense: Expense) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${expense.description}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    await deleteExpense(expense.id);
  };

  // Workspace handlers
  const handleDeleteWorkspace = async () => {
    const success = await deleteWorkspace();

    if (success) {
      navigate('/dashboard');
    }

    return success;
  };

  const handleWorkspaceTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    setSearchParams(params, { replace: true });
  };

  const handleViewPendingHistory = () => {
    setSettlementFilters((current) => ({
      ...current,
      status: 'pending',
    }));

    handleWorkspaceTabChange('settlements');
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

          {joinError && inviteCode && (
            <Button size="sm" variant="outline" onClick={retryJoin}>
              Try again
            </Button>
          )}

          <Button size="sm" onClick={() => navigate('/dashboard')}>
            Return to dashboard
          </Button>
        </div>
      </main>
    );
  }

  return (
    <WorkspaceProvider workspaceId={workspaceId} workspace={workspace} members={members}>
      <div className="bg-background min-h-full min-w-0 text-sm">
        <WorkspaceHeader
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
                <WorkspaceWelcome />
              </div>

              <div className="flex shrink-0 items-center">
                <WorkspaceMembers />
              </div>
            </div>

            <div className="border-border/70 border-t" />

            {/* Workspace overview */}
            <WorkspaceOverview
              totalSpent={totalWorkspaceCost}
              averagePerPerson={averageCostPerPerson}
              memberCount={members.length}
              transactionCount={expenses.length}
            />

            <WorkspaceTabNavigation value={activeTab} onValueChange={handleWorkspaceTabChange}>
              <TabsContent value="transactions">
                <WorkspaceTransactionTab
                  balances={memberBalances}
                  currentUserId={user?.id}
                  transactions={
                    <TransactionSection
                      expenses={expenses}
                      expensesTotal={expensesTotal}
                      currentUserId={user?.id}
                      filters={expenseFilters}
                      isFetching={expensesFetching}
                      hasMore={hasMore}
                      loadingMore={loadingMore}
                      onFiltersChange={handleExpenseFiltersChange}
                      onLoadMore={loadMoreExpenses}
                      onAddExpense={addExpense}
                      onUpdateExpense={updateExpense}
                      onDeleteExpense={handleDeleteExpense}
                    />
                  }
                />
              </TabsContent>

              <TabsContent value="settlements">
                <WorkspaceSettlementsTab
                  suggestedSettlements={suggestedSettlements}
                  pendingCount={pendingSettlementCount}
                  onSettleUp={() => setIsSettleUpOpen(true)}
                  onViewPendingHistory={handleViewPendingHistory}
                  history={
                    <SettlementHistorySection
                      settlements={settlements}
                      currentUserId={user?.id}
                      filters={settlementFilters}
                      loading={settlementsLoading}
                      fetching={settlementsFetching}
                      confirming={settlementConfirming}
                      deleting={settlementDeleting}
                      onFiltersChange={setSettlementFilters}
                      onConfirm={confirmSettlement}
                      onDelete={deleteSettlement}
                    />
                  }
                />
              </TabsContent>
            </WorkspaceTabNavigation>
          </div>
        </main>

        {/* Invite modal */}
        <InviteModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          workspaceId={workspaceId}
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
          activeUserId={user?.id}
          onConfirmSettlement={handleConfirmSettlement}
        />

        {/* Workspace settings modal */}
        <WorkspaceSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onUpdateWorkspace={updateWorkspace}
          onRemoveMember={removeMember}
          onDeleteWorkspace={handleDeleteWorkspace}
          currentUserId={user?.id}
        />
      </div>
    </WorkspaceProvider>
  );
}
