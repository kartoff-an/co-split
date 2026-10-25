import type React from 'react';
import {
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ReceiptPercentIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';

export const LedgerMockup: React.FC = () => (
  <div className="overflow-hidden border border-border-subtle bg-surface shadow-[var(--shadow-card)]">
    <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center bg-primary-green-subtle text-primary-green">
          <ChartBarIcon className="h-4 w-4" strokeWidth={1.7} />
        </span>
        <div>
          <p className="text-xs font-semibold tracking-tight">Co-Split</p>
          <p className="text-[10px] text-text-muted">Workspace overview</p>
        </div>
      </div>
      <EllipsisHorizontalIcon className="h-5 w-5 text-text-muted" />
    </div>

    <div className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.12em] text-text-muted uppercase">Group expenses</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">₱12,450.00</p>
          <p className="mt-1 text-xs text-text-secondary">Across 3 members</p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-status-positive/20 bg-status-positive-bg px-2 py-1 text-[10px] font-semibold text-status-positive">
          <span className="h-1.5 w-1.5 bg-status-positive" /> Workspace active
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 border-y border-border-subtle">
        <div className="py-3 pr-2">
          <p className="text-[10px] text-text-muted">Your balance</p>
          <p className="mt-1 text-sm font-semibold text-status-positive sm:text-base">+₱850.00</p>
        </div>
        <div className="border-x border-border-subtle px-3 py-3">
          <p className="text-[10px] text-text-muted">You owe</p>
          <p className="mt-1 text-sm font-semibold sm:text-base">₱320.00</p>
        </div>
        <div className="py-3 pl-3">
          <p className="text-[10px] text-text-muted">Settlements</p>
          <p className="mt-1 text-sm font-semibold sm:text-base">2 pending</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold">Recent expenses</h3>
          <span className="text-[10px] font-medium text-primary-green">View all <ArrowRightIcon className="ml-0.5 inline h-3 w-3" /></span>
        </div>
        <div className="divide-y divide-border-subtle">
          <div className="flex items-center gap-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-subtle text-text-secondary">
              <ReceiptPercentIcon className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Dinner with friends</p>
              <p className="mt-0.5 text-[10px] text-text-muted">Paid by Alex · 3 members</p>
            </div>
            <p className="shrink-0 text-xs font-semibold">₱2,400.00</p>
          </div>
          <div className="flex items-center gap-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-surface-subtle text-text-secondary">
              <ReceiptPercentIcon className="h-4 w-4" strokeWidth={1.7} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Apartment utilities</p>
              <p className="mt-0.5 text-[10px] text-text-muted">Paid by you · 3 members</p>
            </div>
            <p className="shrink-0 text-xs font-semibold">₱1,800.00</p>
          </div>
        </div>
      </div>

      <div className="mt-2 border border-border-subtle bg-app p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-4 w-4 shrink-0 text-status-positive" />
            <div>
              <p className="text-xs font-semibold">Suggested settlement</p>
              <p className="mt-0.5 text-[10px] text-text-muted">Example calculation</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">₱450.00</p>
            <p className="text-[10px] text-text-secondary">Alex → Jamie</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
