import { useEffect, useMemo, useState } from 'react';

import { CheckCircleIcon, ClockIcon, MagnifyingGlassIcon, TrashIcon, XIcon } from '@phosphor-icons/react';

import type { Settlement, SettlementQueryParams } from '@/api/types';

import { formatCurrency } from '@/lib/currency';
import { formatDate } from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useWorkspaceContext } from '@/contexts/WorkspaceContext';

import { SettlementFiltersPopover } from './SettlementFiltersPopover';

interface SettlementHistorySectionProps {
  settlements: Settlement[];
  currentUserId?: string;
  filters: SettlementQueryParams;
  loading: boolean;
  fetching: boolean;
  confirming: boolean;
  deleting: boolean;
  onFiltersChange: (filters: SettlementQueryParams) => void;
  onConfirm: (settlementId: number) => Promise<unknown>;
  onDelete: (settlementId: number) => Promise<void>;
}

export function SettlementHistorySection({
  settlements,
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
  const { members, currency } = useWorkspaceContext();

  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const [actionError, setActionError] = useState<string | null>(null);

  // Resolve member IDs to names.
  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const getMemberName = (userId: string) => memberMap.get(userId)?.display_name ?? 'Unknown member';

  // Debounce search requests.
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const search = searchInput.trim();
      const currentSearch = filters.search ?? '';

      if (search === currentSearch) {
        return;
      }

      onFiltersChange({
        ...filters,
        search: search || undefined,
      });
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [searchInput, filters, onFiltersChange]);

  // Active filter state.
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ''
  );

  const pendingCount = useMemo(
    () => settlements.filter((settlement) => settlement.status === 'pending').length,
    [settlements]
  );

  // Preserve search when applying advanced filters.
  const handleAdvancedFiltersChange = (
    advancedFilters: Pick<SettlementQueryParams, 'status' | 'from_user_id' | 'to_user_id'>
  ) => {
    onFiltersChange({
      ...filters,
      ...advancedFilters,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({});
  };

  // Settlement actions.
  const handleConfirm = async (settlement: Settlement) => {
    if (settlement.to_user_id !== currentUserId) return;

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

  return (
    <section className="min-w-0 space-y-4">
      {/* Section header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">Settlement history</h2>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-muted-foreground text-xs">
              {settlements.length.toLocaleString()} settlement
              {settlements.length === 1 ? '' : 's'}
            </p>

            {pendingCount > 0 && (
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400"
              >
                {pendingCount} pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Search and advanced filters */}
      <div className="flex gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <MagnifyingGlassIcon size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />

          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search settlements..."
            aria-label="Search settlements"
            className="h-9 pl-9 text-sm"
          />

          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
            >
              <XIcon size={15} />
            </button>
          )}
        </div>

        <SettlementFiltersPopover filters={filters} members={members} onApply={handleAdvancedFiltersChange} />
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.search && <Badge variant="secondary">Search: {filters.search}</Badge>}

          {filters.status && <Badge variant="secondary">Status: {filters.status}</Badge>}

          {filters.from_user_id && <Badge variant="secondary">From: {getMemberName(filters.from_user_id)}</Badge>}

          {filters.to_user_id && <Badge variant="secondary">To: {getMemberName(filters.to_user_id)}</Badge>}

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
          >
            <XIcon size={12} />
            Clear all
          </button>
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

              const fromName = getMemberName(settlement.from_user_id);
              const toName = getMemberName(settlement.to_user_id);

              return (
                <div
                  key={settlement.id}
                  className={[
                    'relative flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
                    isPending
                      ? 'bg-amber-500/4 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-amber-500'
                      : 'hover:bg-muted/30 transition-colors',
                  ].join(' ')}
                >
                  {/* Settlement information */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={[
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                        isPending
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {isPending ? <ClockIcon size={17} /> : <CheckCircleIcon size={17} />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {fromName}
                          <span className="text-muted-foreground mx-1.5">paid</span>
                          {toName}
                        </p>

                        {isPending ? (
                          <Badge
                            variant="outline"
                            className="border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-700 dark:text-amber-400"
                          >
                            Pending
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Confirmed
                          </Badge>
                        )}
                      </div>

                      <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                        <span>{formatDate(settlement.timestamp)}</span>

                        {settlement.note && (
                          <>
                            <span>·</span>
                            <span className="max-w-60 truncate">{settlement.note}</span>
                          </>
                        )}

                        {settlement.to_user_id === currentUserId && (
                          <>
                            <span>·</span>
                            <span className="text-primary">You receive</span>
                          </>
                        )}

                        {settlement.from_user_id === currentUserId && (
                          <>
                            <span>·</span>
                            <span className="text-primary">You paid</span>
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

                      <div
                        className={[
                          'mt-1 flex items-center justify-end gap-1 text-[10px]',
                          isPending ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground',
                        ].join(' ')}
                      >
                        {isPending ? <ClockIcon size={12} /> : <CheckCircleIcon size={12} />}

                        <span>{isPending ? 'Awaiting confirmation' : 'Payment recorded'}</span>
                      </div>
                    </div>

                    {/* Preserve existing settlement actions */}
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
          /* Empty state */
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="bg-muted mb-3 flex h-10 w-10 items-center justify-center rounded-full">
              <CheckCircleIcon size={20} className="text-muted-foreground" />
            </div>

            <h3 className="text-sm font-medium">
              {hasActiveFilters ? 'No matching settlements' : 'No settlements yet'}
            </h3>

            <p className="text-muted-foreground mt-1 max-w-xs text-xs">
              {hasActiveFilters
                ? 'Try adjusting your search or filters.'
                : 'Payments recorded in this workspace will appear here.'}
            </p>

            {hasActiveFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 h-8 text-xs"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
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
    </section>
  );
}
