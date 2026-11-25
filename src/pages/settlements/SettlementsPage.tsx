import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';

import { useAuth } from '@/auth/useAuth';
import { useDashboard } from '@/hooks/useDashboard';

import { queryKeys } from '@/api/queryKeys';

import * as balanceService from '@/services/balanceService';
import * as workspaceService from '@/services/workspaceService';

import type { WorkspaceListItem } from '@/api/types';

import { formatCurrency } from '@/lib/currency';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

import {
  ArrowsLeftRightIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  SpinnerGapIcon,
  TrendDownIcon,
  TrendUpIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';

type SettlementFilter = 'all' | 'owe' | 'owed';

interface SuggestedPayment {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
  workspace: WorkspaceListItem;
  direction: 'owe' | 'owed';
}

const FILTER_OPTIONS: {
  value: SettlementFilter;
  label: string;
}[] = [
  { value: 'all', label: 'All' },
  { value: 'owe', label: 'You owe' },
  { value: 'owed', label: 'Owed to you' },
];

export function SettlementsPage() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { workspaces, loadingWorkspaces } = useDashboard(user?.id);

  const [filter, setFilter] = useState<SettlementFilter>('all');

  // Workspace balances
  const balanceQueries = useQueries({
    queries: workspaces.map((workspace) => ({
      queryKey: queryKeys.balances.detail(workspace.id),
      queryFn: () => balanceService.getWorkspaceBalance(workspace.id),
      enabled: Boolean(user?.id),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    })),
  });

  // Workspace members
  const workspaceQueries = useQueries({
    queries: workspaces.map((workspace) => ({
      queryKey: queryKeys.workspace.detail(workspace.id),
      queryFn: () => workspaceService.getWorkspaceDetails(workspace.id),
      enabled: Boolean(user?.id),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    })),
  });

  // Query states
  const isLoading =
    loadingWorkspaces ||
    balanceQueries.some((query) => query.isPending) ||
    workspaceQueries.some((query) => query.isPending);

  const hasError = balanceQueries.some((query) => query.isError) || workspaceQueries.some((query) => query.isError);

  const isFetching =
    balanceQueries.some((query) => query.isFetching) || workspaceQueries.some((query) => query.isFetching);

  const handleRetry = async () => {
    await Promise.all([
      ...balanceQueries.map((query) => query.refetch()),
      ...workspaceQueries.map((query) => query.refetch()),
    ]);
  };

  // Suggested payments
  const settlements: SuggestedPayment[] = (() => {
    if (!user?.id) return [];

    const result: SuggestedPayment[] = [];

    workspaces.forEach((workspace, index) => {
      const balance = balanceQueries[index]?.data;
      const workspaceDetails = workspaceQueries[index]?.data;

      if (!balance || !workspaceDetails) return;

      const memberNames = new Map(workspaceDetails.members.map((member) => [member.id, member.display_name]));

      balance.suggested_settlements.forEach((suggestion) => {
        const isDebtor = suggestion.from_user_id === user.id;
        const isCreditor = suggestion.to_user_id === user.id;

        if (!isDebtor && !isCreditor) return;

        result.push({
          fromUserId: suggestion.from_user_id,
          fromName: memberNames.get(suggestion.from_user_id) ?? 'Unknown member',

          toUserId: suggestion.to_user_id,
          toName: memberNames.get(suggestion.to_user_id) ?? 'Unknown member',

          amount: Number(suggestion.amount),
          workspace,

          direction: isDebtor ? 'owe' : 'owed',
        });
      });
    });

    return result.sort((a, b) => b.amount - a.amount);
  })();

  // Filtering
  const filteredSettlements = useMemo(
    () =>
      settlements.filter((settlement) => {
        if (filter === 'all') return true;

        return settlement.direction === filter;
      }),
    [settlements, filter]
  );

  // Currency summaries
  const summarizeByCurrency = (direction: 'owe' | 'owed') => {
    const totals = new Map<string, number>();

    settlements
      .filter((item) => item.direction === direction)
      .forEach((item) => {
        const currency = item.workspace.currency;

        totals.set(currency, (totals.get(currency) ?? 0) + item.amount);
      });

    return [...totals.entries()].map(([currency, amount]) => formatCurrency(amount, currency)).join(' · ') || '—';
  };

  const owedSummary = summarizeByCurrency('owe');
  const owedToYouSummary = summarizeByCurrency('owed');

  // Navigation
  const handleOpenWorkspace = (workspaceId: string) => {
    navigate(`/workspace/${workspaceId}`);
  };

  return (
    <div className="bg-background min-h-full min-w-0 text-sm">
      <header className="bg-background/85 sticky top-0 z-30 flex min-h-14 items-center gap-3 px-4 sm:px-6">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-7">
          {/* Page heading */}

          <section className="space-y-2">
            <h1 className="font-heading text-foreground text-2xl leading-tight font-extrabold tracking-tight">
              Settlements
            </h1>

            <p className="text-muted-foreground max-w-2xl text-xs leading-6 sm:text-sm">
              Review suggested payments based on outstanding balances across your workspaces.
            </p>
          </section>

          {/* Balance overview */}
          <section className="flex flex-wrap items-center gap-x-10 gap-y-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="text-rose-600 dark:text-rose-400">
                <TrendDownIcon size={22} weight="duotone" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <p className="text-muted-foreground text-xs">You owe</p>
                <p className="text-xl font-semibold text-rose-600 tabular-nums dark:text-rose-400">
                  {isLoading ? '—' : owedSummary}
                </p>
              </div>
            </div>

            <div className="bg-border hidden h-10 w-px sm:block" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="text-emerald-600 dark:text-emerald-400">
                <TrendUpIcon size={22} weight="duotone" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <p className="text-muted-foreground text-xs">Owed to you</p>
                <p className="text-xl font-semibold text-emerald-600 tabular-nums dark:text-emerald-400">
                  {isLoading ? '—' : owedToYouSummary}
                </p>
              </div>
            </div>
          </section>

          <div className="border-border/70 border-t" />

          {/* Suggested payments */}

          <section className="min-w-0 space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-tight">Suggested payments</h2>

                <p className="text-muted-foreground text-xs">
                  Payments calculated from your current workspace balances.
                </p>
              </div>

              <Badge variant="outline" className="w-fit text-[10px]">
                {settlements.length} {settlements.length === 1 ? 'payment' : 'payments'}
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {FILTER_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={filter === option.value ? 'secondary' : 'outline'}
                  className="h-8 rounded-lg px-3 text-xs"
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Loading */}
            {isLoading ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
                <SpinnerGapIcon size={24} className="text-muted-foreground animate-spin" />

                <p className="text-muted-foreground text-xs">Loading your suggested payments...</p>
              </div>
            ) : hasError ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
                <WarningCircleIcon size={24} className="text-destructive" />

                <div className="space-y-1">
                  <p className="text-sm font-semibold">Unable to load suggested payments</p>

                  <p className="text-muted-foreground text-xs">
                    Some workspace balances or member details could not be retrieved.
                  </p>
                </div>

                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleRetry} disabled={isFetching}>
                  {isFetching && <SpinnerGapIcon size={14} className="animate-spin" />}
                  Try again
                </Button>
              </div>
            ) : filteredSettlements.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
                <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                  <CheckCircleIcon size={24} weight="duotone" className="text-emerald-600 dark:text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">
                    {filter === 'all'
                      ? 'You are all settled up'
                      : filter === 'owe'
                        ? 'You do not owe anyone'
                        : 'Nobody owes you right now'}
                  </h3>

                  <p className="text-muted-foreground max-w-sm text-xs">
                    {filter === 'all'
                      ? 'There are no outstanding payment recommendations involving you across your workspaces.'
                      : 'There are no suggested payments matching this filter.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredSettlements.map((settlement) => {
                  const isOwing = settlement.direction === 'owe';

                  const otherPerson = isOwing ? settlement.toName : settlement.fromName;

                  return (
                    <div
                      key={`${settlement.workspace.id}-${settlement.fromUserId}-${settlement.toUserId}`}
                      className="group border-border/80 bg-card hover:border-primary/35 hover:bg-muted/30 flex flex-col gap-3 rounded-lg border p-3 transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            isOwing
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <ArrowsLeftRightIcon size={17} weight="duotone" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-xs font-semibold">
                              {isOwing ? `You owe ${otherPerson}` : `${otherPerson} owes you`}
                            </p>

                            <Badge
                              variant="outline"
                              className={`rounded-full px-1.5 py-0 text-[9px] ${
                                isOwing
                                  ? 'border-rose-500/30 text-rose-600 dark:text-rose-400'
                                  : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {isOwing ? 'You owe' : 'Owed to you'}
                            </Badge>
                          </div>

                          <p className="text-muted-foreground truncate text-[10px]">{settlement.workspace.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <p className="text-xs font-semibold tabular-nums">
                          {formatCurrency(settlement.amount, settlement.workspace.currency)}
                        </p>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => handleOpenWorkspace(settlement.workspace.id)}
                        >
                          Open workspace
                          <ArrowRightIcon size={13} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
