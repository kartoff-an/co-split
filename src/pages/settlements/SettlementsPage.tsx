import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';

import { useAuth } from '@/auth/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/currency';

import type { Settlement, WorkspaceItem } from '@/types';

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

interface SettlementResult {
  settlements: Settlement[];
}

interface SettlementItem extends Settlement {
  workspace: WorkspaceItem;
  direction: 'owe' | 'owed';
}

interface SupabaseRpc {
  rpc(fn: string, args: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
}

export function SettlementsPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const { workspaces, loadingWorkspaces } = useDashboard(user?.id);

  const [filter, setFilter] = useState<SettlementFilter>('all');

  const settlementQueries = useQueries({
    queries: workspaces.map((workspace) => ({
      queryKey: ['workspace-balance', workspace.id],
      queryFn: async (): Promise<SettlementResult> => {
        const client = supabase as unknown as SupabaseRpc;

        const { data, error } = await client.rpc('calculate_workspace_balances', { w_id: workspace.id });

        if (error) throw error;

        const result = (data ?? { settlements: [] }) as SettlementResult;

        return {
          settlements: result.settlements ?? [],
        };
      },
      enabled: !!user?.id,
      staleTime: 30_000,
    })),
  });

  const isLoading = loadingWorkspaces || settlementQueries.some((query) => query.isLoading);

  const hasError = settlementQueries.some((query) => query.isError);

  const settlements = useMemo(() => {
    if (!user?.id) return [];

    const items: SettlementItem[] = [];

    workspaces.forEach((workspace, index) => {
      const workspaceSettlements = settlementQueries[index]?.data?.settlements ?? [];

      workspaceSettlements.forEach((settlement) => {
        const isDebtor =
          settlement.from_id === user.id || (!settlement.from_id && settlement.from === profile?.display_name);

        const isCreditor =
          settlement.to_id === user.id || (!settlement.to_id && settlement.to === profile?.display_name);

        if (!isDebtor && !isCreditor) return;

        items.push({
          ...settlement,
          workspace,
          direction: isDebtor ? 'owe' : 'owed',
        });
      });
    });

    return items.sort((a, b) => b.amount - a.amount);
  }, [workspaces, settlementQueries, user?.id, profile?.display_name]);

  const filteredSettlements = settlements.filter((settlement) => {
    if (filter === 'all') return true;
    return settlement.direction === filter;
  });

  const totalOwed = settlements.filter((item) => item.direction === 'owe');

  const totalOwedToYou = settlements.filter((item) => item.direction === 'owed');

  const summarizeByCurrency = (items: SettlementItem[]) => {
    const totals = new Map<string, number>();

    items.forEach((item) => {
      const currency = item.workspace.currency;

      totals.set(currency, (totals.get(currency) ?? 0) + item.amount);
    });

    return [...totals.entries()].map(([currency, amount]) => formatCurrency(amount, currency)).join(' · ') || '—';
  };

  const owedSummary = summarizeByCurrency(totalOwed);
  const owedToYouSummary = summarizeByCurrency(totalOwedToYou);

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
          {/* Welcome section */}
          <section className="space-y-3">
            <div className="space-y-2">
              <h1 className="font-heading text-foreground text-2xl leading-tight font-extrabold tracking-tight">
                Settlements
              </h1>

              <p className="text-muted-foreground max-w-2xl text-xs leading-6 sm:text-sm">
                Keep track of what you owe and what others owe you across all your workspaces.
              </p>
            </div>
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

          {/* Settlement list */}
          <section className="min-w-0 space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold tracking-tight">Outstanding settlements</h2>
              </div>

              <Badge variant="outline" className="w-fit text-[10px]">
                {settlements.length} total
              </Badge>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { value: 'all', label: 'All' },
                  { value: 'owe', label: 'You owe' },
                  { value: 'owed', label: 'Owed to you' },
                ] as const
              ).map((option) => (
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
                <p className="text-muted-foreground text-xs">Loading your settlements...</p>
              </div>
            ) : hasError ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-center">
                <WarningCircleIcon size={24} className="text-destructive" />
                <p className="text-sm font-semibold">Unable to load settlements</p>
                <p className="text-muted-foreground text-xs">Please refresh the page and try again.</p>
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
                      ? 'There are no outstanding payments involving you across your workspaces.'
                      : 'There are no payments matching this filter.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filteredSettlements.map((settlement, index) => {
                  const isOwing = settlement.direction === 'owe';

                  const otherPerson = isOwing ? settlement.to : settlement.from;

                  return (
                    <div
                      key={`${settlement.workspace.id}-${settlement.from_id}-${settlement.to_id}-${index}`}
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
                          Settle up
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
