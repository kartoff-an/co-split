import { useMemo, useState } from 'react';

import { ArrowDownIcon, ArrowUpIcon, MagnifyingGlassIcon, PlusIcon, ReceiptIcon } from '@phosphor-icons/react';

import type { Expense, Member } from '@/types';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { ExpenseForm } from './ExpenseForm';

import { ExpenseDetailsModal } from './ExpenseDetailsModal';
import { EditExpenseModal } from './EditExpenseModal';

interface TransactionSectionProps {
  expenses: Expense[];
  members: Member[];
  currency: string;
  currentUserId?: string;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onAddExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>) => Promise<void>;
  onDeleteExpense?: (expense: Expense) => void;
  onUpdateExpense: (
    expenseId: number | string,
    updates: Partial<Omit<Expense, 'id' | 'workspace_id' | 'timestamp'>>
  ) => Promise<unknown>;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(timestamp: string | number | Date) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function TransactionSection({
  expenses,
  members,
  currency,
  currentUserId,
  hasMore,
  loadingMore,
  onLoadMore,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}: TransactionSectionProps) {
  const [search, setSearch] = useState('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return expenses;

    return expenses.filter((expense) => {
      const payer = memberMap.get(expense.paid_by)?.display_name ?? '';

      return (
        expense.description?.toLowerCase().includes(query) ||
        expense.category?.toLowerCase().includes(query) ||
        payer.toLowerCase().includes(query)
      );
    });
  }, [expenses, search, memberMap]);

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>) => {
    await onAddExpense(expense);
    setIsAddExpenseOpen(false);
  };

  return (
    <>
      <section className="min-w-0 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">Transactions</h2>
          </div>

          <Button onClick={() => setIsAddExpenseOpen(true)} className="h-9 gap-2 text-xs font-medium">
            <PlusIcon size={15} weight="bold" />
            Add expense
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transactions..."
            className="h-9 pl-9 text-sm"
          />
        </div>

        {/* Transactions */}
        <div className="border-border bg-card overflow-hidden rounded-lg border">
          {filteredExpenses.length > 0 ? (
            <div className="divide-border divide-y">
              {filteredExpenses.map((expense) => {
                const payer = memberMap.get(expense.paid_by);
                const payerName = payer?.display_name || 'Unknown member';
                const isCurrentUser = expense.paid_by === currentUserId;
                const isPayment = expense.category?.toLowerCase() === 'payment';

                return (
                  <button
                    key={expense.id}
                    type="button"
                    onClick={() => setSelectedExpense(expense)}
                    className="hover:bg-muted/50 focus-visible:ring-ring w-full rounded-lg text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <div
                      key={expense.id}
                      className="hover:bg-muted/40 flex items-center justify-between gap-3 px-4 py-3 transition-colors"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-muted text-muted-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                          <ReceiptIcon size={17} />
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-medium">{expense.description || 'Untitled expense'}</p>

                            {isPayment && (
                              <Badge variant="secondary" className="text-[10px]">
                                Settlement
                              </Badge>
                            )}
                          </div>

                          <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-xs">
                            <span>{payerName}</span>
                            <span>·</span>
                            <span>{formatDate(expense.timestamp)}</span>

                            {expense.category && (
                              <>
                                <span>·</span>
                                <span>{expense.category}</span>
                              </>
                            )}

                            {isCurrentUser && (
                              <>
                                <span>·</span>
                                <span className="text-primary">You paid</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(Number(expense.amount), currency)}
                        </p>

                        <div className="text-muted-foreground mt-1 flex items-center justify-end gap-1 text-[10px]">
                          {isPayment ? <ArrowDownIcon size={12} /> : <ArrowUpIcon size={12} />}
                          <span>{isPayment ? 'Payment' : 'Expense'}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="bg-muted mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                <ReceiptIcon size={20} className="text-muted-foreground" />
              </div>

              <h3 className="text-sm font-medium">{search ? 'No matching transactions' : 'No transactions yet'}</h3>

              <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                {search
                  ? 'Try a different description, category, or member name.'
                  : 'Expenses added to this workspace will appear here.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {hasMore && !search && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="h-9 px-5 text-xs"
            >
              {loadingMore ? 'Loading...' : 'Load more transactions'}
            </Button>
          </div>
        )}

        {search && filteredExpenses.length > 0 && (
          <p className="text-muted-foreground text-center text-xs">
            Showing {filteredExpenses.length} matching transactions
          </p>
        )}
      </section>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add an expense</DialogTitle>

            <DialogDescription className="text-xs">
              Record a shared expense and split it with your workspace members.
            </DialogDescription>
          </DialogHeader>

          <ExpenseForm
            members={members}
            currency={currency}
            activeUserId={currentUserId}
            onAddExpense={handleAddExpense}
            className="pt-2"
          />
        </DialogContent>
      </Dialog>

      <ExpenseDetailsModal
        expense={selectedExpense}
        members={members}
        activeUserId={currentUserId}
        currency={currency}
        onClose={() => setSelectedExpense(null)}
        onEdit={(expense) => {
          setSelectedExpense(null);
          setEditingExpense(expense);
        }}
        onDelete={(expense) => {
          onDeleteExpense?.(expense);
        }}
      />

      <EditExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        members={members}
        activeUserId={currentUserId}
        currency={currency}
        onClose={() => setEditingExpense(null)}
        onSave={onUpdateExpense}
      />
    </>
  );
}
