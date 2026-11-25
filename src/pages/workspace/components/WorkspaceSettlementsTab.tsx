import type { ReactNode } from 'react';

import { ArrowRightIcon, CheckCircleIcon } from '@phosphor-icons/react';

import type { SuggestedSettlement, WorkspaceMember } from '@/api/types';

import { formatCurrency } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WorkspaceSettlementsTabProps {
  suggestedSettlements: SuggestedSettlement[];
  members: WorkspaceMember[];
  currency: string;
  pendingCount: number;
  onSettleUp: () => void;
  onViewPendingHistory: () => void;
  history: ReactNode;
}

export function WorkspaceSettlementsTab({
  suggestedSettlements,
  members,
  currency,
  onSettleUp,
  history,
}: WorkspaceSettlementsTabProps) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {/* Suggested settlements */}
      <section className="border-primary/20 bg-card overflow-hidden rounded-lg border">
        <div className="border-primary/10 bg-primary/[0.035] border-b px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold tracking-tight">Suggested settlements</h2>

                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Recommended
                  </Badge>
                </div>
              </div>
            </div>

            {suggestedSettlements.length > 0 && (
              <Button size="sm" className="h-8 text-xs" onClick={onSettleUp}>
                Settle up
              </Button>
            )}
          </div>
        </div>

        <div className="p-4">
          {suggestedSettlements.length === 0 ? (
            <div className="bg-muted/30 flex flex-col items-center justify-center gap-2 rounded-md px-3 py-8 text-center">
              <CheckCircleIcon size={24} className="text-primary" weight="duotone" />

              <p className="text-sm font-medium">Everyone is settled up</p>

              <p className="text-muted-foreground text-xs">There are no outstanding balances to settle.</p>
            </div>
          ) : (
            <div className="divide-border divide-y">
              {suggestedSettlements.map((settlement, index) => {
                const from = members.find((member) => member.id === settlement.from_user_id);

                const to = members.find((member) => member.id === settlement.to_user_id);

                return (
                  <div
                    key={`${settlement.from_user_id}-${settlement.to_user_id}-${index}`}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
                        <ArrowRightIcon size={15} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs">
                          <span className="font-medium">{from?.display_name ?? 'Unknown member'}</span>

                          <span className="text-muted-foreground"> pays </span>

                          <span className="font-medium">{to?.display_name ?? 'Unknown member'}</span>
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatCurrency(Number(settlement.amount), currency)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Settlement history */}
      <section className="bg-card border-border/80 rounded-lg">{history}</section>
    </div>
  );
}
