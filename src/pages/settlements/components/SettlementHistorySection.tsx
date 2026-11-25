import { useState } from 'react';

import type { Settlement, SettlementQueryParams, WorkspaceMember } from '@/api/types';

import { formatCurrency } from '@/lib/currency';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { CheckCircleIcon, ClockIcon, MagnifyingGlassIcon, TrashIcon } from '@phosphor-icons/react';
import { SettlementFiltersPopover } from './SettlementFiltersPopover';

interface SettlementHistorySectionProps {
  settlements: Settlement[];
  members: WorkspaceMember[];
  currency: string;
  currentUserId?: string;

  filters: SettlementQueryParams;

  loading: boolean;
  fetching: boolean;
  confirming: boolean;
  deleting: boolean;

  onFiltersChange: (filters: SettlementQueryParams) => void;
  onConfirm: (settlementId: number) => Promise<void>;
  onDelete: (settlementId: number) => Promise<void>;
}

function getMemberName(members: WorkspaceMember[], userId: string): string {
  return members.find((member) => member.id === userId)?.display_name ?? 'Unknown member';
}

function formatDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function SettlementHistorySection({
  settlements,
  members,
  currency,
  currentUserId,
  filters,
  loading,
  fetching,
  confirming,
  deleting,
  onFiltersChange,
  onConfirm,
  onDelete,
}: SettlementHistorySectionProps) {
  const [actionError, setActionError] = useState<string | null>(null);

  // const updateFilter = (
  //   key: keyof SettlementQueryParams,
  //   value: string,
  // ) => {
  //   onFiltersChange({
  //     ...filters,
  //     [key]: value || undefined,
  //   });
  // };

  const handleConfirm = async (settlement: Settlement) => {
    if (settlement.status !== 'pending' || settlement.to_user_id !== currentUserId) {
      return;
    }

    setActionError(null);

    try {
      await onConfirm(settlement.id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to confirm settlement.');
    }
  };

  const handleDelete = async (settlement: Settlement) => {
    if (settlement.status !== 'pending') return;

    const confirmed = window.confirm('Delete this pending settlement? This action cannot be undone.');

    if (!confirmed) return;

    setActionError(null);

    try {
      await onDelete(settlement.id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete settlement.');
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ''
  );

  return (
    <section className="min-w-0 space-y-4">
      {/* Section header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight">Settlement history</h3>

          <p className="text-muted-foreground text-xs">
            {settlements.length.toLocaleString()} recorded settlement
            {settlements.length === 1 ? '' : 's'}
          </p>
        </div>

        <Badge variant="outline" className="w-fit text-[10px]">
          {settlements.filter((item) => item.status === 'pending').length} pending
        </Badge>
      </div>

      {/* Search and filters */}
      <div className="flex w-full gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />

          <Input
            placeholder="Search settlements..."
            value={filters.search ?? ''}
            onChange={(event) => onFiltersChange({ ...filters, search: event.target.value || undefined })}
            aria-label="Search settlements"
            className="h-9 pl-9 text-sm"
          />
        </div>

        <SettlementFiltersPopover
          filters={filters}
          members={members}
          onApply={(advancedFilters) => onFiltersChange({ ...filters, ...advancedFilters })}
        />
      </div>

      {/* Action errors */}
      {actionError && (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border px-3 py-2 text-xs"
        >
          {actionError}
        </div>
      )}

      {/* Fetching status */}
      {fetching && !loading && (
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
          Updating settlements...
        </div>
      )}

      {/* Settlement list */}
      <div className="border-border bg-card overflow-hidden rounded-lg border">
        {loading ? (
          <div className="text-muted-foreground py-12 text-center text-xs">Loading settlement history...</div>
        ) : settlements.length > 0 ? (
          <div className="divide-border divide-y">
            {settlements.map((settlement) => {
              const isPending = settlement.status === 'pending';

              const canConfirm = isPending && settlement.to_user_id === currentUserId;

              const canDelete = isPending;

              return (
                <div
                  key={settlement.id}
                  className={[
                    'flex flex-col gap-3 px-4 py-3 transition-colors sm:flex-row sm:items-center sm:justify-between',
                    isPending
                      ? 'border-l-2 border-l-amber-500/40 bg-amber-500/[0.035]'
                      : 'border-l-2 border-l-transparent',
                  ].join(' ')}
                >
                  {/* Settlement information */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={[
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        isPending
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {isPending ? <ClockIcon size={17} /> : <CheckCircleIcon size={17} />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">
                          {getMemberName(members, settlement.from_user_id)}

                          <span className="text-muted-foreground mx-1.5">paid</span>

                          {getMemberName(members, settlement.to_user_id)}
                        </p>

                        <Badge
                          variant={isPending ? 'outline' : 'secondary'}
                          className={
                            isPending
                              ? 'border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400'
                              : 'text-[10px]'
                          }
                        >
                          {isPending ? 'Pending' : 'Confirmed'}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                        <span>{formatDate(settlement.timestamp)}</span>

                        {settlement.note && (
                          <>
                            <span>·</span>
                            <span className="max-w-60 truncate">{settlement.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount and actions */}
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatCurrency(Number(settlement.amount), currency)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {canConfirm && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-[11px]"
                          disabled={confirming || deleting}
                          onClick={() => void handleConfirm(settlement)}
                        >
                          <CheckCircleIcon size={14} />
                          Confirm
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive size-8"
                          aria-label="Delete pending settlement"
                          disabled={confirming || deleting}
                          onClick={() => void handleDelete(settlement)}
                        >
                          <TrashIcon size={15} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="bg-muted mb-3 flex h-10 w-10 items-center justify-center rounded-full">
              <ClockIcon size={20} className="text-muted-foreground" />
            </div>

            <h3 className="text-sm font-medium">No settlements found</h3>

            <p className="text-muted-foreground mt-1 max-w-xs text-xs">
              {hasActiveFilters ? 'Try adjusting your search or filters.' : 'Recorded payments will appear here.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
