import type React from 'react';
import {
  CommandLineIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export const LedgerMockup: React.FC = () => {
  return (
    <div className="glass-card group relative space-y-4 overflow-hidden rounded-2xl p-4 shadow-md">
      <div className="border-primary-green/20 pointer-events-none absolute top-2.5 left-2.5 h-2.5 w-2.5 rounded-tl-xs border-t-2 border-l-2" />
      <div className="border-primary-green/20 pointer-events-none absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-tr-xs border-t-2 border-r-2" />
      <div className="border-primary-green/20 pointer-events-none absolute bottom-2.5 left-2.5 h-2.5 w-2.5 rounded-bl-xs border-b-2 border-l-2" />
      <div className="border-primary-green/20 pointer-events-none absolute right-2.5 bottom-2.5 h-2.5 w-2.5 rounded-br-xs border-r-2 border-b-2" />

      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-1.5 text-[9px] font-bold text-text-muted">
            IoT Smart Sensor
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-2 rounded-xl border border-border-subtle bg-surface p-3 shadow-2xs md:flex-row md:items-center">
        <div className="space-y-0.5 text-left">
          <span className="text-[8px] font-bold text-text-muted">
            Workspace ledger
          </span>
          <h2 className="text-xs leading-tight font-extrabold tracking-tight text-text-primary">
            IoT Smart Sensor
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 md:justify-end">
          <span className="border-accent-coral/45 text-accent-coral flex items-center gap-1 rounded-full border bg-surface px-1.5 py-0.5 text-[9px] font-semibold shadow-2xs">
            <span>Sarah (You)</span>
          </span>
          <span className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-text-secondary">
            <span>Alex</span>
          </span>
          <span className="flex items-center gap-1 rounded-full border border-border-subtle bg-surface px-1.5 py-0.5 text-[9px] font-semibold text-text-secondary">
            <span>Jamie</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-subtle p-2 text-left">
          <span className="text-[8px] font-bold text-text-muted">
            Total spent
          </span>
          <p className="text-xs font-extrabold text-text-primary">$90.00</p>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-subtle p-2 text-left">
          <span className="text-[8px] font-bold text-text-muted">
            Avg / Head
          </span>
          <p className="text-xs font-extrabold text-text-primary">$30.00</p>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-subtle p-2 text-left">
          <span className="text-[8px] font-bold text-text-muted">Settles</span>
          <p className="text-xs font-extrabold text-text-primary">1</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border-subtle bg-surface p-3 text-left">
        <div className="flex items-center gap-1">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-600 [data-theme='dark']_&:text-emerald-400">
            <ChartBarIcon className="h-3 w-3" />
          </div>
          <h3 className="text-[10px] font-bold text-text-primary">Balances</h3>
        </div>

        <div className="space-y-2">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-medium">
              <span className="text-text-secondary">Sarah (You)</span>
              <span className="font-bold text-emerald-600 [data-theme='dark']_&:text-emerald-400">+$35.00</span>
            </div>
            <div className="relative h-1 w-full rounded-full bg-surface-subtle">
              <div
                className="absolute left-1/2 h-full rounded-r bg-emerald-500"
                style={{ width: '40%' }}
              ></div>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-medium">
              <span className="text-text-secondary">Alex</span>
              <span className="font-bold text-rose-500">-$5.00</span>
            </div>
            <div className="relative h-1 w-full rounded-full bg-surface-subtle">
              <div
                className="absolute right-1/2 h-full rounded-l bg-rose-500"
                style={{ width: '10%' }}
              ></div>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-medium">
              <span className="text-text-secondary">Jamie</span>
              <span className="font-bold text-rose-500">-$30.00</span>
            </div>
            <div className="relative h-1 w-full rounded-full bg-surface-subtle">
              <div
                className="absolute right-1/2 h-full rounded-l bg-rose-500"
                style={{ width: '35%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-border-subtle bg-surface p-3 text-left">
          <div className="flex items-center gap-1">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-surface-subtle text-text-secondary">
              <CommandLineIcon className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-bold text-text-primary">
              Transactions
            </h3>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px]">
              <div className="min-w-0">
                <p className="truncate font-semibold text-text-primary">
                  Microcontrollers & Sensors
                </p>
                <p className="text-[8px] text-text-muted">Paid by Alex</p>
              </div>
              <span className="shrink-0 font-extrabold text-text-primary">
                $25.00
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <div className="min-w-0">
                <p className="truncate font-semibold text-text-primary">
                  PCB Fab & SMD Components
                </p>
                <p className="text-[8px] text-text-muted">Paid by you</p>
              </div>
              <span className="shrink-0 font-extrabold text-text-primary">
                $65.00
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-border-subtle bg-surface p-3 text-left">
          <div className="flex items-center gap-1">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-500/15 text-teal-600 [data-theme='dark']_&:text-teal-400">
              <CheckCircleIcon className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-bold text-text-primary">
              Settlements
            </h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between rounded bg-surface-subtle p-1 text-[8px]">
              <div className="flex items-center gap-1">
                <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1 text-rose-600 [data-theme='dark']_&:text-rose-400">
                  Jamie
                </span>
                <ArrowRightIcon className="h-2.5 w-2.5 text-text-muted" />
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1 text-emerald-600 [data-theme='dark']_&:text-emerald-400">
                  Sarah
                </span>
              </div>
              <span className="font-extrabold text-text-primary">$30.00</span>
            </div>
            <div className="flex items-center justify-between rounded bg-surface-subtle p-1 text-[8px]">
              <div className="flex items-center gap-1">
                <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1 text-rose-600 [data-theme='dark']_&:text-rose-400">
                  Alex
                </span>
                <ArrowRightIcon className="h-2.5 w-2.5 text-text-muted" />
                <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1 text-emerald-600 [data-theme='dark']_&:text-emerald-400">
                  Sarah
                </span>
              </div>
              <span className="font-extrabold text-text-primary">$5.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
