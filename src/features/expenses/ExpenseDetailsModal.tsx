import type React from 'react';
import type { Expense, Member } from '../../types';
import { Button } from '../../components/Button';
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../lib/currency';

interface ExpenseDetailsModalProps {
  expense: Expense;
  members: Member[];
  activeUserId?: string | null;
  currency: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  expense,
  members,
  activeUserId,
  currency,
  onClose,
  onEdit,
  onDelete,
}) => {
  const getMemberName = (id: string) => {
    if (id === activeUserId) return 'you';
    return (
      members.find((member) => member.id === id)?.display_name || 'Unknown'
    );
  };

  const getLoggerName = (createdBy?: string | null) => {
    if (!createdBy) return 'Unknown';
    if (createdBy === activeUserId) return 'you';
    return (
      members.find((member) => member.id === createdBy)?.display_name ||
      'Unknown'
    );
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const isPayment =
    expense.category === 'Payment' || expense.category === 'Settlement';
  const createdBy = (expense as { created_by?: string | null }).created_by;
  const canDelete =
    !!activeUserId &&
    (isPayment
      ? expense.paid_by === activeUserId
      : createdBy
        ? createdBy === activeUserId
        : expense.paid_by === activeUserId);
  const canEdit =
    !isPayment &&
    !!activeUserId &&
    (createdBy ? createdBy === activeUserId : expense.paid_by === activeUserId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="animate-scale-up border-border-subtle bg-surface text-text-primary relative w-full max-w-lg rounded-2xl border p-5 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-text-muted text-[10px] font-semibold uppercase">
                Expense details
              </span>
              {isPayment && (
                <span className="[data-theme='dark']_&:text-emerald-400 inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                  Payment
                </span>
              )}
            </div>
            <h3 className="text-text-primary text-lg font-bold wrap-break-word">
              {expense.description}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:bg-surface-subtle hover:text-text-primary cursor-pointer rounded-lg p-1.5 transition-colors"
            aria-label="Close expense details"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="border-border-subtle bg-surface-subtle rounded-xl border p-3">
            <div className="text-text-muted mb-1 text-[10px] font-semibold">
              Amount
            </div>
            <div className="text-text-primary text-base">
              {formatCurrency(expense.amount, currency)}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="border-border-subtle bg-surface-subtle rounded-xl border p-3">
              <div className="text-text-muted mb-1 text-[10px] font-semibold">
                Paid by
              </div>
              <div className="text-text-primary text-sm">
                {getMemberName(expense.paid_by)}
              </div>
            </div>

            <div className="border-border-subtle bg-surface-subtle rounded-xl border p-3">
              <div className="text-text-muted mb-1 text-[10px] font-semibold">
                Logged by
              </div>
              <div className="text-text-primary text-sm">
                {getLoggerName(createdBy)}
              </div>
            </div>
          </div>

          <div className="border-border-subtle bg-surface-subtle rounded-xl border p-3">
            <div className="text-text-muted mb-1 text-[10px] font-semibold">
              Logged on
            </div>
            <div className="text-text-primary text-sm">
              {formatDateTime(expense.timestamp)}
            </div>
          </div>

          {expense.split_members && expense.split_members.length > 0 && (
            <div className="border-border-subtle bg-surface-subtle rounded-xl border p-3">
              <div className="text-text-muted mb-2 text-[10px] font-semibold uppercase tracking-[0.12em]">
                Split with
              </div>
              <div className="flex flex-wrap gap-2">
                {expense.split_members.map((memberId) => (
                  <span
                    key={memberId}
                    className="bg-surface text-text-secondary inline-flex items-center rounded-full border border-emerald-500/20 px-2 py-1 text-[10px] font-medium"
                  >
                    {getMemberName(memberId)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          {canEdit && (
            <Button
              type="button"
              size="md"
              onClick={onEdit}
              className="[data-theme='dark']_&:text-emerald-400 bg-emerald-600 hover:bg-emerald-700"
            >
              <PencilSquareIcon className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}

          {canDelete && (
            <Button type="button" variant="danger" size="md" onClick={onDelete}>
              <TrashIcon className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
