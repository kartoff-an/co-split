import type React from 'react';
import { useState, useMemo } from 'react';
import type { Expense, Member } from '../../types';
import {
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Avatar } from '../../components/Avatar';
import { formatCurrency } from '../../lib/currency';
import { EditExpenseModal } from './EditExpenseModal';

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 5) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 1) {
    return 'just now';
  }
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  activeUserId?: string | null;
  currency?: string;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  onUpdateExpense?: (
    expenseId: number | string,
    updates: Partial<Omit<Expense, 'id' | 'workspace_id' | 'timestamp'>>
  ) => Promise<unknown>;
  onDeleteExpense?: (expenseId: number | string) => Promise<unknown>;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  activeUserId,
  currency = 'PHP',
  hasMore,
  onLoadMore,
  loadingMore,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [search, setSearch] = useState('');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const getMemberName = (id: string) => {
    if (id === activeUserId) return 'you';
    return (
      members.find((member) => member.id === id)?.display_name || 'Unknown'
    );
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(search.toLowerCase()) ||
        getMemberName(expense.paid_by)
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesSearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, search, members, activeUserId]);

  const handleDeleteConfirm = async () => {
    if (!deletingExpenseId || !onDeleteExpense) return;
    setIsDeleting(true);
    try {
      await onDeleteExpense(deletingExpenseId);
      setDeletingExpenseId(null);
    } catch (err) {
      console.error('Failed to delete expense:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="animate-fade-in border-border-subtle bg-surface rounded-2xl border p-10 text-center shadow-xs">
        <div className="bg-surface-subtle text-text-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <ClipboardDocumentIcon className="h-8 w-8" />
        </div>
        <h4 className="text-text-primary text-base">
          No transactions recorded
        </h4>
        <p className="text-text-muted mx-auto mt-1 max-w-xs text-sm">
          Add expenses to begin balancing your workspace budget.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in border-border-subtle bg-surface overflow-hidden rounded-2xl border shadow-xs transition-shadow duration-300 hover:shadow-md">
        <div className="border-border-subtle bg-surface-subtle/50 border-b p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-text-primary text-sm font-bold tracking-tight">
                Ledger transactions
              </h3>
              <p className="text-text-muted mt-0.5 text-[10px]">
                {expenses.length} expense{expenses.length === 1 ? '' : 's'}{' '}
                logged in total
              </p>
            </div>

            <div className="relative w-full max-w-xs">
              <span className="text-text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassesOrSearch className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="border-border-subtle bg-surface text-text-primary placeholder:text-text-muted focus:border-primary-green focus:ring-primary-green/20 w-full rounded-xl border py-1.5 pr-3 pl-8 text-xs outline-hidden transition-all focus:ring-2"
              />
            </div>
          </div>
        </div>

        <div className="divide-border-subtle max-h-125 divide-y overflow-y-auto">
          {filteredExpenses.length === 0 ? (
            <div className="text-text-muted p-8 text-center">
              <p className="text-xs">
                No transactions match your search criteria.
              </p>
              <button
                onClick={() => {
                  setSearch('');
                }}
                className="[data-theme='dark']_&:text-emerald-400 mt-2.5 cursor-pointer text-xs text-emerald-600 underline hover:text-emerald-800"
              >
                Clear search
              </button>
            </div>
          ) : (
            <>
              {filteredExpenses.map((expense, index) => {
                const payer = members.find(
                  (member) => member.id === expense.paid_by
                );
                const isPayerYou = expense.paid_by === activeUserId;
                const payerName = isPayerYou
                  ? 'you'
                  : payer?.display_name || 'Unknown';

                const isPayment =
                  expense.category === 'Payment' ||
                  expense.category === 'Settlement';

                // Only debtor (expense.paid_by) can delete their settlement; for regular expenses, logger or payer can delete
                const canDelete =
                  !!activeUserId &&
                  (isPayment
                    ? expense.paid_by === activeUserId
                    : (expense as { created_by?: string | null }).created_by
                      ? (expense as { created_by?: string | null })
                          .created_by === activeUserId
                      : expense.paid_by === activeUserId);

                const canEdit =
                  !isPayment &&
                  !!activeUserId &&
                  ((expense as { created_by?: string | null }).created_by
                    ? (expense as { created_by?: string | null }).created_by ===
                      activeUserId
                    : expense.paid_by === activeUserId);

                return (
                  <div
                    key={expense.id}
                    className="group hover:bg-surface-subtle/50 p-3 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-surface-subtle text-text-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] shadow-2xs transition-transform duration-200 group-hover:scale-105">
                          #{index + 1}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-text-primary truncate text-xs md:text-sm">
                              {expense.description}
                            </p>
                            {isPayment && (
                              <span className="[data-theme='dark']_&:text-emerald-400 inline-flex shrink-0 items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                                Payment
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span className="text-text-muted flex items-center gap-1 text-[10px] font-medium">
                              <Avatar
                                avatarUrl={payer?.avatar_url}
                                name={payerName}
                                className="h-3 w-3"
                              />
                              <span>
                                Paid by{' '}
                                <strong className="text-text-secondary font-semibold">
                                  {payerName}
                                </strong>
                              </span>
                            </span>
                            <span className="bg-border-strong hidden h-1 w-1 rounded-full sm:inline" />
                            <span className="text-text-muted text-[10px] font-medium">
                              {formatRelativeTime(expense.timestamp)}
                            </span>
                            {expense.split_members &&
                              expense.split_members.length > 0 && (
                                <>
                                  <span className="bg-border-strong hidden h-1 w-1 rounded-full sm:inline" />
                                  <span
                                    className="border-border-subtle bg-surface-subtle text-text-muted hover:bg-surface inline-flex cursor-help items-center rounded-md border px-1.5 py-0.5 text-[9px] transition-colors"
                                    title={expense.split_members
                                      .map(
                                        (memberId) =>
                                          members.find(
                                            (member) => member.id === memberId
                                          )?.display_name || 'Unknown'
                                      )
                                      .join(', ')}
                                  >
                                    Split with {expense.split_members.length}{' '}
                                    member
                                    {expense.split_members.length === 1
                                      ? ''
                                      : 's'}
                                  </span>
                                </>
                              )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-text-primary text-xs md:text-sm">
                          {formatCurrency(expense.amount, currency)}
                        </span>

                        {(canEdit || canDelete) && (
                          <div className="flex items-center gap-1 opacity-90 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                            {onUpdateExpense && canEdit && (
                              <button
                                type="button"
                                onClick={() => setEditingExpense(expense)}
                                className="text-text-muted [data-theme='dark']_&:hover:text-emerald-400 cursor-pointer rounded-lg p-1.5 transition-colors hover:text-emerald-600"
                                title="Edit Expense"
                              >
                                <PencilSquareIcon className="h-4 w-4" />
                              </button>
                            )}
                            {onDeleteExpense && canDelete && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeletingExpenseId(Number(expense.id))
                                }
                                className="text-text-muted cursor-pointer rounded-lg p-1.5 transition-colors hover:text-rose-600"
                                title={
                                  isPayment
                                    ? 'Delete Settlement Payment'
                                    : 'Delete Expense'
                                }
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {hasMore && (
                <div className="border-border-subtle bg-surface-subtle/50 border-t p-3 text-center">
                  <button
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="[data-theme='dark']_&:text-emerald-400 inline-flex cursor-pointer items-center gap-1.5 text-xs text-emerald-600 transition-colors hover:text-emerald-800 disabled:opacity-50"
                  >
                    {loadingMore
                      ? 'Loading older transactions...'
                      : 'Load more transactions'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editingExpense && onUpdateExpense && (
        <EditExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          expense={editingExpense}
          members={members}
          activeUserId={activeUserId}
          currency={currency}
          onSave={onUpdateExpense}
        />
      )}

      {deletingExpenseId !== null &&
        (() => {
          const targetExpense = expenses.find(
            (e) => Number(e.id) === deletingExpenseId
          );
          const isPayment =
            targetExpense?.category === 'Payment' ||
            targetExpense?.category === 'Settlement';

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
              <div className="animate-scale-up border-border-subtle bg-surface relative w-full max-w-sm space-y-4 rounded-2xl border p-6 text-center shadow-xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-600">
                  <ExclamationTriangleIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-text-primary text-base font-bold">
                    {isPayment ? 'Delete Settlement?' : 'Delete Expense?'}
                  </h3>
                  <p className="text-text-muted mt-1 text-xs">
                    {isPayment
                      ? 'Are you sure you want to delete this settlement payment? The unsettled debt will be restored to your balance.'
                      : 'Are you sure you want to delete this transaction? This action will update workspace balances and cannot be undone.'}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeletingExpenseId(null)}
                    disabled={isDeleting}
                    className="border-border-subtle bg-surface text-text-secondary hover:bg-surface-subtle w-1/2 cursor-pointer rounded-xl border py-2.5 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="flex w-1/2 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <span>Deleting...</span>
                    ) : (
                      <span>Delete</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
    </>
  );
};
const MagnifyingGlassesOrSearch = MagnifyingGlassIcon;
