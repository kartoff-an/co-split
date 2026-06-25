import type React from 'react';
import { useState, useMemo } from 'react';
import type { Expense, Member } from '../types';
import {
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { Avatar } from './Avatar';
import { formatCurrency } from '../lib/currency';

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
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  activeUserId,
  currency = 'PHP',
  hasMore,
  onLoadMore,
  loadingMore,
}) => {
  const [search, setSearch] = useState('');

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

  if (expenses.length === 0) {
    return (
      <div className="animate-fade-in rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <ClipboardDocumentIcon className="h-8 w-8" />
        </div>
        <h4 className="text-base font-bold text-slate-700">
          No transactions recorded
        </h4>
        <p className="text-slate-450 mx-auto mt-1 max-w-xs text-sm">
          Add expenses in the left panel to begin balancing your workspace
          budget.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-shadow duration-300 hover:shadow-md">
      <div className="border-b border-slate-100 bg-linear-to-b from-slate-50/50 to-white p-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-800">
              Ledger transactions
            </h3>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
              {expenses.length} expense{expenses.length === 1 ? '' : 's'} logged
              in total
            </p>
          </div>

          <div className="relative w-full max-w-xs">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <MagnifyingGlassIcon className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="text-slate-755 w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs font-semibold placeholder-slate-400 outline-hidden transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      <div className="max-h-[500px] divide-y divide-slate-100 overflow-y-auto">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-xs font-medium">
              No transactions match your search criteria.
            </p>
            <button
              onClick={() => {
                setSearch('');
              }}
              className="text-emerald-650 mt-2.5 cursor-pointer text-xs font-semibold underline hover:text-emerald-800"
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

              return (
                <div
                  key={expense.id}
                  className="group p-3 transition-colors duration-200 hover:bg-slate-50/50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-slate-500 shadow-xs transition-transform duration-200 group-hover:scale-105">
                        #{index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800 md:text-sm">
                          {expense.description}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                            <Avatar
                              avatarUrl={payer?.avatar_url}
                              name={payerName}
                              className="h-3 w-3"
                            />
                            <span>
                              Paid by{' '}
                              <strong className="font-semibold text-slate-500">
                                {payerName}
                              </strong>
                            </span>
                          </span>
                          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" />
                          <span className="text-[10px] font-medium text-slate-400">
                            {formatRelativeTime(expense.timestamp)}
                          </span>
                          {expense.split_members &&
                            expense.split_members.length > 0 && (
                              <>
                                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline" />
                                <span
                                  className="inline-flex cursor-help items-center rounded-md border border-slate-100 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 transition-colors hover:bg-slate-100"
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

                    <div className="shrink-0 text-right">
                      <span className="text-xs font-extrabold tracking-tight text-slate-800 md:text-sm">
                        {formatCurrency(expense.amount, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {hasMore && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-3 text-center">
                <button
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="text-emerald-650 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold transition-colors hover:text-emerald-800 disabled:opacity-50"
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
  );
};
