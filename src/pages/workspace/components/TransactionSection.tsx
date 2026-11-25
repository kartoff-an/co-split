import { useEffect, useMemo, useState } from 'react';

import { ArrowDownIcon, ArrowUpIcon, MagnifyingGlassIcon, PlusIcon, ReceiptIcon, XIcon } from '@phosphor-icons/react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { ExpenseForm } from './ExpenseForm';
import { ExpenseDetailsModal } from './ExpenseDetailsModal';
import { EditExpenseModal } from './EditExpenseModal';
import { ExpenseFiltersPopover } from './ExpenseFilterPopover';

import type { Expense, ExpenseCreate, ExpenseFilters, ExpenseUpdate, WorkspaceMember } from '@/api/types';

interface TransactionSectionProps {
  expenses: Expense[];
  expensesTotal: number;
  members: WorkspaceMember[];
  currency: string;
  currentUserId?: string;

  filters: ExpenseFilters;
  isFetching: boolean;
  hasMore: boolean;
  loadingMore: boolean;

  onFiltersChange: (filters: ExpenseFilters) => void;
  onLoadMore: () => void;

  onAddExpense: (expense: ExpenseCreate) => Promise<void>;

  onDeleteExpense?: (expense: Expense) => void;

  onUpdateExpense: (expenseId: number | string, updates: ExpenseUpdate) => Promise<unknown>;
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
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

export function TransactionSection({
  expenses,
  expensesTotal,
  members,
  currency,
  currentUserId,
  filters,
  isFetching,
  hasMore,
  loadingMore,
  onFiltersChange,
  onLoadMore,
  onAddExpense,
  onDeleteExpense,
  onUpdateExpense,
}: TransactionSectionProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? '');

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Resolve payer IDs to member names.
  const memberMap = useMemo(() => new Map(members.map((member) => [member.id, member])), [members]);

  // Derive available categories from loaded expenses.
  // Preserve the currently selected category even if it is not on this page.
  const categories = useMemo(() => {
    const values = new Set<string>();

    expenses.forEach((expense) => {
      if (expense.category) {
        values.add(expense.category);
      }
    });

    if (filters.category) {
      values.add(filters.category);
    }

    return [...values].sort((a, b) => a.localeCompare(b));
  }, [expenses, filters.category]);

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

  // Any active filter should affect the empty state.
  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== null && value !== ''
  );

  // const activeFilterCount = [
  //   filters.category,
  //   filters.paid_by,
  //   filters.created_by,
  //   filters.from_date,
  //   filters.to_date,
  //   filters.min_amount !== undefined,
  //   filters.max_amount !== undefined,
  //   filters.search,
  // ].filter(Boolean).length;

  const handleAdvancedFiltersChange = (advancedFilters: Omit<ExpenseFilters, 'search' | 'created_by'>) => {
    onFiltersChange({
      ...filters,
      ...advancedFilters,
    });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFiltersChange({});
  };

  const handleAddExpense = async (expense: ExpenseCreate) => {
    await onAddExpense(expense);
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(null);
    onDeleteExpense?.(expense);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(null);
    setEditingExpense(expense);
  };

  return (
    <>
      <section className="min-w-0 space-y-4">
        {/* Section header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight">Transactions</h2>

            <p className="text-muted-foreground text-xs">
              {expensesTotal.toLocaleString()} transaction
              {expensesTotal === 1 ? '' : 's'}
            </p>
          </div>

          <Button type="button" onClick={() => setIsAddExpenseOpen(true)} className="h-9 gap-2 text-xs font-medium">
            <PlusIcon size={15} weight="bold" />
            Add expense
          </Button>
        </div>

        {/* Search and advanced filters */}
        <div className="full-width flex gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlassIcon size={16} className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" />

            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search transactions..."
              aria-label="Search transactions"
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

          <ExpenseFiltersPopover
            filters={filters}
            categories={categories}
            members={members}
            onApply={handleAdvancedFiltersChange}
          />
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search}
              </Badge>
            )}

            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                {filters.category}
              </Badge>
            )}

            {filters.paid_by && (
              <Badge variant="secondary" className="gap-1">
                Paid by: {memberMap.get(filters.paid_by)?.display_name ?? 'Member'}
              </Badge>
            )}

            {(filters.from_date || filters.to_date) && <Badge variant="secondary">Date range</Badge>}

            {(filters.min_amount !== undefined || filters.max_amount !== undefined) && (
              <Badge variant="secondary">Amount range</Badge>
            )}

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
        {isFetching && !loadingMore && (
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className="bg-primary h-1.5 w-1.5 animate-pulse rounded-full" />
            Updating transactions...
          </div>
        )}

        {/* Transaction list */}
        <div className="border-border bg-card overflow-hidden rounded-lg border">
          {expenses.length > 0 ? (
            <div className="divide-border divide-y">
              {expenses.map((expense) => {
                const payer = memberMap.get(expense.paid_by);

                const payerName = payer?.display_name || 'Unknown member';

                const isCurrentUser = expense.paid_by === currentUserId;

                const isPayment = expense.category?.toLowerCase() === 'payment';

                return (
                  <button
                    key={expense.id}
                    type="button"
                    onClick={() => setSelectedExpense(expense)}
                    className="hover:bg-muted/50 focus-visible:ring-ring w-full text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      {/* Transaction information */}
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

                      {/* Amount */}
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
            /* Empty state */
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <div className="bg-muted mb-3 flex h-10 w-10 items-center justify-center rounded-full">
                <ReceiptIcon size={20} className="text-muted-foreground" />
              </div>

              <h3 className="text-sm font-medium">
                {hasActiveFilters ? 'No matching transactions' : 'No transactions yet'}
              </h3>

              <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                {hasActiveFilters
                  ? 'Try adjusting your search or filters.'
                  : 'Expenses added to this workspace will appear here.'}
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

        {/* Pagination */}
        {hasMore && (
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore || isFetching}
              className="h-9 px-5 text-xs"
            >
              {loadingMore ? 'Loading...' : 'Load more transactions'}
            </Button>
          </div>
        )}

        {/* Results summary */}
        {expenses.length > 0 && (
          <p className="text-muted-foreground text-center text-xs">
            Showing {expenses.length.toLocaleString()} of {expensesTotal.toLocaleString()} transactions
          </p>
        )}
      </section>

      {/* Add expense dialog */}
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

      {/* Expense details */}
      <ExpenseDetailsModal
        expense={selectedExpense}
        members={members}
        activeUserId={currentUserId}
        currency={currency}
        onClose={() => setSelectedExpense(null)}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Edit expense */}
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
