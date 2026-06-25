import React, { useMemo } from 'react';
import type { Balance, Settlement, Member } from '../types';
import {
  ChartBarIcon,
  CheckCircleIcon,
  CheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../lib/currency';

interface BalanceSummaryProps {
  balances: Balance[];
  settlements: Settlement[];
  totalWorkspaceCost: number;
  averageCostPerPerson: number;
  activeUserId?: string | null;
  members: Member[];
  currency?: string;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({
  balances,
  settlements,
  totalWorkspaceCost,
  averageCostPerPerson,
  activeUserId,
  members,
  currency = 'PHP',
}) => {
  const maxAbsBalance = useMemo(() => {
    const values = balances.map((balance) => Math.abs(balance.net_balance));
    return Math.max(...values, 1); // Fallback to 1 to avoid division by zero
  }, [balances]);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Total Cost */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition-shadow duration-200 hover:shadow-xs">
          <div className="mb-1.5">
            <span className="text-slate-450 text-[9px] font-bold">
              Total spent
            </span>
          </div>
          <p className="text-xs font-extrabold tracking-tight text-slate-800 md:text-sm">
            {formatCurrency(totalWorkspaceCost, currency)}
          </p>
        </div>

        {/* Average Per Person */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition-shadow duration-200 hover:shadow-xs">
          <div className="mb-1.5">
            <span className="text-slate-450 text-[9px] font-bold">
              Avg / Head
            </span>
          </div>
          <p className="text-xs font-extrabold tracking-tight text-slate-800 md:text-sm">
            {formatCurrency(averageCostPerPerson, currency)}
          </p>
        </div>

        {/* Settlements Counter */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition-shadow duration-200 hover:shadow-xs">
          <div className="mb-1.5">
            <span className="text-slate-450 text-[9px] font-bold">Settles</span>
          </div>
          <p className="text-xs font-extrabold tracking-tight text-slate-800 md:text-sm">
            {settlements.length}
          </p>
        </div>
      </div>

      {/* Individual Balances */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-shadow duration-300 hover:shadow-md">
        <div className="mb-3.5 flex items-center gap-2">
          <div className="text-emerald-655 flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
            <ChartBarIcon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-slate-800">
            Balances
          </h3>
        </div>

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
                    className={`flex items-center gap-1.5 font-semibold text-slate-700 ${isCurrentUser ? 'text-emerald-650' : ''}`}
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
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-100"
                      />
                    ) : (
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[8px] font-bold text-slate-500">
                        {balance.member_name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span>
                      {balance.member_name} {isCurrentUser ? '(You)' : ''}
                    </span>
                  </span>
                  <span
                    className={`font-extrabold tracking-tight ${
                      isPositive
                        ? 'text-emerald-600'
                        : isNegative
                          ? 'text-rose-650'
                          : 'text-slate-400'
                    }`}
                  >
                    {isPositive ? '+' : isNegative ? '-' : ''}
                    {formatCurrency(balance.net_balance, currency)}
                  </span>
                </div>

                {/* Visual Balance Bar */}
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
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
                  <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-slate-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settlement Plan */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-shadow duration-300 hover:shadow-md">
        <div className="mb-3.5 flex items-center gap-2">
          <div className="text-teal-655 flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50">
            <CheckCircleIcon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-slate-800">
            Settlement Plan
          </h3>
        </div>

        {settlements.length === 0 ? (
          <div className="py-3 text-center text-slate-400">
            <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckIcon className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-slate-700">All settled up!</p>
            <p className="text-slate-450 mt-0.5 text-[10px]">
              No transactions or all balances are balanced.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {settlements.map((settlement, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-2 transition-colors duration-200 hover:bg-slate-100/50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  {/* Debtor */}
                  <span className="text-rose-750 max-w-[80px] truncate rounded-md border border-rose-100 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold md:max-w-[100px]">
                    {settlement.from}
                  </span>

                  {/* Arrow transfer animation */}
                  <div className="mx-0.5 flex shrink-0 items-center text-slate-400">
                    <ArrowRightIcon className="h-3.5 w-3.5 animate-pulse" />
                  </div>

                  {/* Creditor */}
                  <span className="text-emerald-750 max-w-[80px] truncate rounded-md border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold md:max-w-[100px]">
                    {settlement.to}
                  </span>
                </div>

                <span className="shrink-0 text-xs font-extrabold tracking-tight text-slate-800">
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
