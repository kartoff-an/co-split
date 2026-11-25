
import { useState } from 'react';

import type {
  Settlement,
  SettlementQueryParams,
  WorkspaceMember,
} from '@/api/types';

import { formatCurrency } from '@/lib/currency';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  TrashIcon,
} from '@phosphor-icons/react';

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

function getMemberName(
  members: WorkspaceMember[],
  userId: string,
): string {
  return (
    members.find((member) => member.id === userId)?.display_name ??
    'Unknown member'
  );
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

  const updateFilter = (
    key: keyof SettlementQueryParams,
    value: string,
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const handleConfirm = async (settlement: Settlement) => {
    if (settlement.to_user_id !== currentUserId) return;

    setActionError(null);

    try {
      await onConfirm(settlement.id);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to confirm settlement.',
      );
    }
  };

  const handleDelete = async (settlement: Settlement) => {
    if (settlement.status !== 'pending') return;

    const confirmed = window.confirm(
      'Delete this pending settlement? This action cannot be undone.',
    );

    if (!confirmed) return;

    setActionError(null);

    try {
      await onDelete(settlement.id);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Unable to delete settlement.',
      );
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight">
            Settlement history
          </h3>

          <p className="text-muted-foreground text-xs">
            Payments recorded in this workspace.
          </p>
        </div>

        <Badge variant="outline" className="text-[10px]">
          {settlements.length}{' '}
          {settlements.length === 1 ? 'record' : 'records'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <MagnifyingGlassIcon
            size={15}
            className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
          />

          <Input
            value={filters.search ?? ''}
            onChange={(event) =>
              updateFilter('search', event.target.value)
            }
            placeholder="Search notes..."
            className="h-9 pl-9 text-xs"
          />
        </div>

        <select
          value={filters.status ?? ''}
          onChange={(event) =>
            updateFilter('status', event.target.value)
          }
          className="border-input bg-background h-9 rounded-md border px-3 text-xs"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
        </select>

        <select
          value={filters.from_user_id ?? ''}
          onChange={(event) =>
            updateFilter('from_user_id', event.target.value)
          }
          className="border-input bg-background h-9 rounded-md border px-3 text-xs"
          aria-label="Filter by sender"
        >
          <option value="">All senders</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              From: {member.display_name}
            </option>
          ))}
        </select>

        <select
          value={filters.to_user_id ?? ''}
          onChange={(event) =>
            updateFilter('to_user_id', event.target.value)
          }
          className="border-input bg-background h-9 rounded-md border px-3 text-xs"
          aria-label="Filter by recipient"
        >
          <option value="">All recipients</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              To: {member.display_name}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border px-3 py-2 text-xs"
        >
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-xs">
          Loading settlement history...
        </div>
      ) : settlements.length === 0 ? (
        <div className="border-border rounded-lg border border-dashed px-4 py-10 text-center">
          <ClockIcon
            size={24}
            className="text-muted-foreground mx-auto mb-2"
          />

          <p className="text-sm font-medium">
            No settlements found
          </p>

          <p className="text-muted-foreground mt-1 text-xs">
            Recorded payments matching these filters will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-border rounded-lg border">
          {settlements.map((settlement) => {
            const canConfirm =
              settlement.status === 'pending' &&
              settlement.to_user_id === currentUserId;

            const canDelete =
              settlement.status === 'pending';

            return (
              <div
                key={settlement.id}
                className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold">
                      {getMemberName(
                        members,
                        settlement.from_user_id,
                      )}
                      <span className="text-muted-foreground mx-1.5">
                        paid
                      </span>
                      {getMemberName(
                        members,
                        settlement.to_user_id,
                      )}
                    </p>

                    <Badge
                      variant={
                        settlement.status === 'confirmed'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-[9px]"
                    >
                      {settlement.status === 'confirmed'
                        ? 'Confirmed'
                        : 'Pending'}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground text-[10px]">
                    {new Date(settlement.timestamp).toLocaleString()}
                  </p>

                  {settlement.note && (
                    <p className="text-muted-foreground truncate text-[11px]">
                      {settlement.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="text-xs font-semibold tabular-nums">
                    {formatCurrency(
                      Number(settlement.amount),
                      currency,
                    )}
                  </p>

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
                        className="size-8 text-muted-foreground hover:text-destructive"
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
      )}

      {fetching && !loading && (
        <p className="text-muted-foreground text-center text-[10px]">
          Updating settlement history...
        </p>
      )}
    </section>
  );
}
