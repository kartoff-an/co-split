import type { Expense, Member } from '@/types';
import { formatCurrency } from '@/lib/currency';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';

interface ExpenseDetailsModalProps {
  expense: Expense | null;
  members: Member[];
  activeUserId?: string | null;
  currency: string;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseDetailsModal({
  expense,
  members,
  activeUserId,
  currency,
  onClose,
  onEdit,
  onDelete,
}: ExpenseDetailsModalProps) {
  if (!expense) return null;

  const getMemberName = (id: string) => {
    if (id === activeUserId) return 'You';

    return members.find((member) => member.id === id)?.display_name || 'Unknown member';
  };

  const getLoggerName = (createdBy?: string | null) => {
    if (!createdBy) return 'Unknown';

    return getMemberName(createdBy);
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return 'Unknown date';

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  const isPayment = expense.category === 'Payment' || expense.category === 'Settlement';

  const createdBy = (expense as Expense & { created_by?: string | null }).created_by;

  const canManage = !!activeUserId && (createdBy === activeUserId || expense.paid_by === activeUserId);

  const handleEdit = () => {
    onClose();
    onEdit(expense);
  };

  const handleDelete = () => {
    onDelete(expense);
  };

  return (
    <Dialog
      open={!!expense}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="border-border bg-card max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-xl p-5 sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Transaction details
            </span>

            {isPayment && (
              <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                Payment
              </span>
            )}
          </div>

          <DialogTitle className="text-lg font-semibold break-words">{expense.description}</DialogTitle>

          <DialogDescription>Details about this workspace transaction.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <DetailItem label="Amount">
            <p className="text-lg font-semibold tabular-nums">{formatCurrency(expense.amount, currency)}</p>
          </DetailItem>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailItem label="Paid by">
              <p className="text-sm font-medium">{getMemberName(expense.paid_by)}</p>
            </DetailItem>

            <DetailItem label="Logged by">
              <p className="text-sm font-medium">{getLoggerName(createdBy)}</p>
            </DetailItem>
          </div>

          <DetailItem label="Logged on">
            <p className="text-sm font-medium">{formatDateTime(expense.timestamp)}</p>
          </DetailItem>

          {expense.split_members && expense.split_members.length > 0 && (
            <DetailItem label="Split with">
              <div className="flex flex-wrap gap-2">
                {expense.split_members.map((memberId) => (
                  <span
                    key={memberId}
                    className="border-border bg-background text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium"
                  >
                    {getMemberName(memberId)}
                  </span>
                ))}
              </div>
            </DetailItem>
          )}
        </div>

        <div className="mt-2 flex flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>

          {canManage && (
            <>
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDelete}
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </Button>

              <Button type="button" onClick={handleEdit}>
                <PencilSimpleIcon className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DetailItemProps {
  label: string;
  children: React.ReactNode;
}

function DetailItem({ label, children }: DetailItemProps) {
  return (
    <div className="border-border bg-muted/30 rounded-lg border p-3">
      <p className="text-muted-foreground mb-1 text-xs font-medium">{label}</p>
      {children}
    </div>
  );
}
