import React, { useMemo } from 'react';
import type { Balance, Settlement, Member } from '../../types';
import {
  ChartBarIcon,
  CheckCircleIcon,
  CheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../lib/currency';

interface BalanceSummaryProps {
  balances: Balance[];
  settlements: Settlement[];
  totalWorkspaceCost: number;
  averageCostPerPerson: number;
  activeUserId?: string | null;
  members: Member[];
  currency?: string;
  onSettleUp?: () => void;
  className?: string;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  balances,
  settlements,
  totalWorkspaceCost,
  averageCostPerPerson,
  activeUserId,
  members,
  currency = 'PHP',
  onSettleUp,
  className = '',
}) => {
  const maxAbsBalance = useMemo(() => {
    const values = balances.map((balance) => Math.abs(balance.net_balance));
    return Math.max(...values, 1);
  }, [balances]);

  const hasUserSettlements = useMemo(() => {
    if (!activeUserId) return settlements.length > 0;
    const currentMember = members.find((member) => member.id === activeUserId);
    return settlements.some(
      (settlement) =>
        settlement.from_id === activeUserId ||
        settlement.to_id === activeUserId ||
        settlement.from === currentMember?.display_name ||
        settlement.to === currentMember?.display_name
    );
  }, [settlements, activeUserId, members]);

  return (
    <div className={`divide-border-subtle divide-y ${className}`}>
      {/* Balances Section */}
      <div className="p-4 sm:p-5">
        <div className="mb-3.5 flex items-center gap-2">
          <div className="[data-theme='dark']_&:text-emerald-400 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600">
            <ChartBarIcon className="h-4 w-4" />
          </div>
          <h3 className="text-text-primary text-sm font-bold tracking-tight">
            Balances
          </h3>
        </div>

        {/* 3-Column Metrics Segment Bar (Total spent, Avg / Head, Settles) */}
        <div className="mb-4">
          <div className="divide-border-subtle border-border-subtle bg-surface-subtle grid grid-cols-3 divide-x overflow-hidden rounded-xl border">
            <div className="flex flex-col justify-between p-2.5">
              <span className="text-text-muted text-[9px]">Total spent</span>
              <p className="text-text-primary mt-1 text-xs md:text-sm">
                {formatCurrency(totalWorkspaceCost, currency)}
              </p>
            </div>

            <div className="flex flex-col justify-between p-2.5">
              <span className="text-text-muted text-[9px]">Avg / Head</span>
              <p className="text-text-primary mt-1 text-xs md:text-sm">
                {formatCurrency(averageCostPerPerson, currency)}
              </p>
            </div>

            <div className="flex flex-col justify-between p-2.5">
              <span className="text-text-muted text-[9px]">Settles</span>
              <p className="text-text-primary mt-1 text-xs md:text-sm">
                {settlements.length}
              </p>
            </div>
          </div>
        </div>

        {/* Individual Member Balances */}
        <div className="space-y-3">
          {balances.map((balance) => {
            const isPositive = balance.net_balance > 0;
            const isNegative = balance.net_balance < 0;
            const absoluteBalance = Math.abs(balance.net_balance);
            const barWidth = Math.min(
              (absoluteBalance / maxAbsBalance) * 100,
              100
            );
            const isCurrentUser = balance.member_id === activeUserId;

            return (
              <div key={balance.member_id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`text-text-secondary flex items-center gap-1.5 ${
                      isCurrentUser
                        ? '[data-theme="dark"]_&:text-emerald-400 text-emerald-600'
                        : ''
                    }`}
                  >
                    {members.find((member) => member.id === balance.member_id)
                      ?.avatar_url ? (
                      <img
                        src={
                          members.find(
                            (member) => member.id === balance.member_id
                          )?.avatar_url || ''
                        }
                        alt=""
                        className="border-border-subtle h-3.5 w-3.5 shrink-0 rounded-full border"
                      />
                    ) : (
                      <span className="bg-surface-subtle text-text-muted flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold">
                        {balance.member_name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span>
                      {balance.member_name} {isCurrentUser ? '(You)' : ''}
                    </span>
                  </span>
                  <span
                    className={`${
                      isPositive
                        ? '[data-theme="dark"]_&:text-emerald-400 text-emerald-600'
                        : isNegative
                          ? '[data-theme="dark"]_&:text-rose-400 text-rose-600'
                          : 'text-text-muted'
                    }`}
                  >
                    {isPositive ? '+' : isNegative ? '-' : ''}
                    {formatCurrency(balance.net_balance, currency)}
                  </span>
                </div>

                {/* Visual Balance Bar */}
                <div className="bg-surface-subtle relative h-1.5 w-full overflow-hidden rounded-full">
                  {isPositive && (
                    <div
                      className="absolute left-1/2 h-full origin-left rounded-r-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${barWidth / 2}%` }}
                    />
                  )}
                  {isNegative && (
                    <div
                      className="absolute right-1/2 h-full origin-right rounded-l-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${barWidth / 2}%` }}
                    />
                  )}
                  {/* Center Line Indicator */}
                  <div className="bg-border-strong absolute top-0 bottom-0 left-1/2 w-px" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlement Plan Section */}
      <div className="p-4 sm:p-5">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="[data-theme='dark']_&:text-teal-400 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-teal-600">
              <CheckCircleIcon className="h-4 w-4" />
            </div>
            <h3 className="text-text-primary text-sm font-bold tracking-tight">
              Settlement Plan
            </h3>
          </div>

          {onSettleUp && hasUserSettlements && (
            <button
              onClick={onSettleUp}
              className="cursor-pointer rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-2xs transition-all hover:bg-emerald-700 active:scale-95"
            >
              Settle Up
            </button>
          )}
        </div>

        {settlements.length === 0 ? (
          <div className="text-text-muted py-3 text-center">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckIcon className="h-4 w-4" />
            </div>
            <p className="text-text-primary text-xs">All settled up!</p>
            <p className="text-text-muted mt-0.5 text-[10px]">
              No transactions or all balances are balanced.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="border-border-subtle bg-surface-subtle hover:bg-surface flex items-center justify-between rounded-xl border p-2 transition-colors duration-200"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {/* Debtor */}
                  <span className="[data-theme='dark']_&:text-rose-400 max-w-20 truncate rounded-md border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[10px] text-rose-600 md:max-w-25">
                    {settlement.from}
                  </span>

                  {/* Arrow transfer animation */}
                  <div className="text-text-muted mx-0.5 flex shrink-0 items-center">
                    <ArrowRightIcon className="h-3.5 w-3.5 animate-pulse" />
                  </div>

                  {/* Creditor */}
                  <span className="[data-theme='dark']_&:text-emerald-400 max-w-20 truncate rounded-md border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-600 md:max-w-25">
                    {settlement.to}
                  </span>
                </div>

                <span className="text-text-primary shrink-0 text-xs">
                  {formatCurrency(settlement.amount, currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
