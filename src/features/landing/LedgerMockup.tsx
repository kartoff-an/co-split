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

      <div className="border-border-subtle flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="text-text-muted ml-1.5 text-[9px] font-bold">
            IoT Smart Sensor
          </span>
        </div>
      </div>

      <div className="border-border-subtle bg-surface flex flex-col justify-between gap-2 rounded-xl border p-3 shadow-2xs md:flex-row md:items-center">
        <div className="space-y-0.5 text-left">
          <span className="text-text-muted text-[8px] font-bold">
            Workspace ledger
          </span>
          <h2 className="text-text-primary text-xs leading-tight font-extrabold tracking-tight">
            IoT Smart Sensor
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 md:justify-end">
          <span className="border-accent-coral/45 text-accent-coral bg-surface flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold shadow-2xs">
            <span>Sarah (You)</span>
          </span>
          <span className="border-border-subtle bg-surface text-text-secondary flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold">
            <span>Alex</span>
          </span>
          <span className="border-border-subtle bg-surface text-text-secondary flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold">
            <span>Jamie</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="border-border-subtle bg-surface-subtle flex flex-col justify-between rounded-xl border p-2 text-left">
          <span className="text-text-muted text-[8px] font-bold">
            Total spent
          </span>
          <p className="text-text-primary text-xs font-extrabold">$90.00</p>
        </div>
        <div className="border-border-subtle bg-surface-subtle flex flex-col justify-between rounded-xl border p-2 text-left">
          <span className="text-text-muted text-[8px] font-bold">
            Avg / Head
          </span>
          <p className="text-text-primary text-xs font-extrabold">$30.00</p>
        </div>
        <div className="border-border-subtle bg-surface-subtle flex flex-col justify-between rounded-xl border p-2 text-left">
          <span className="text-text-muted text-[8px] font-bold">Settles</span>
          <p className="text-text-primary text-xs font-extrabold">1</p>
        </div>
      </div>

      <div className="border-border-subtle bg-surface space-y-2 rounded-xl border p-3 text-left">
        <div className="flex items-center gap-1">
          <div className="[data-theme='dark']_&:text-emerald-400 flex h-5 w-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-600">
            <ChartBarIcon className="h-3 w-3" />
          </div>
          <h3 className="text-text-primary text-[10px] font-bold">Balances</h3>
        </div>

        <div className="space-y-2">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-medium">
              <span className="text-text-secondary">Sarah (You)</span>
              <span className="[data-theme='dark']_&:text-emerald-400 font-bold text-emerald-600">
                +$35.00
              </span>
            </div>
            <div className="bg-surface-subtle relative h-1 w-full rounded-full">
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
            <div className="bg-surface-subtle relative h-1 w-full rounded-full">
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
            <div className="bg-surface-subtle relative h-1 w-full rounded-full">
              <div
                className="absolute right-1/2 h-full rounded-l bg-rose-500"
                style={{ width: '35%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="border-border-subtle bg-surface space-y-2 rounded-xl border p-3 text-left">
          <div className="flex items-center gap-1">
            <div className="bg-surface-subtle text-text-secondary flex h-5 w-5 items-center justify-center rounded">
              <CommandLineIcon className="h-3 w-3" />
            </div>
            <h3 className="text-text-primary text-[10px] font-bold">
              Transactions
            </h3>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px]">
              <div className="min-w-0">
                <p className="text-text-primary truncate font-semibold">
                  Microcontrollers & Sensors
                </p>
                <p className="text-text-muted text-[8px]">Paid by Alex</p>
              </div>
              <span className="text-text-primary shrink-0 font-extrabold">
                $25.00
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <div className="min-w-0">
                <p className="text-text-primary truncate font-semibold">
                  PCB Fab & SMD Components
                </p>
                <p className="text-text-muted text-[8px]">Paid by you</p>
              </div>
              <span className="text-text-primary shrink-0 font-extrabold">
                $65.00
              </span>
            </div>
          </div>
        </div>

        <div className="border-border-subtle bg-surface space-y-2 rounded-xl border p-3 text-left">
          <div className="flex items-center gap-1">
            <div className="[data-theme='dark']_&:text-teal-400 flex h-5 w-5 items-center justify-center rounded bg-teal-500/15 text-teal-600">
              <CheckCircleIcon className="h-3 w-3" />
            </div>
            <h3 className="text-text-primary text-[10px] font-bold">
              Settlements
            </h3>
          </div>

          <div className="space-y-1">
            <div className="bg-surface-subtle flex items-center justify-between rounded p-1 text-[8px]">
              <div className="flex items-center gap-1">
                <span className="[data-theme='dark']_&:text-rose-400 rounded border border-rose-500/20 bg-rose-500/10 px-1 text-rose-600">
                  Jamie
                </span>
                <ArrowRightIcon className="text-text-muted h-2.5 w-2.5" />
                <span className="[data-theme='dark']_&:text-emerald-400 rounded border border-emerald-500/20 bg-emerald-500/10 px-1 text-emerald-600">
                  Sarah
                </span>
              </div>
              <span className="text-text-primary font-extrabold">$30.00</span>
            </div>
            <div className="bg-surface-subtle flex items-center justify-between rounded p-1 text-[8px]">
              <div className="flex items-center gap-1">
                <span className="[data-theme='dark']_&:text-rose-400 rounded border border-rose-500/20 bg-rose-500/10 px-1 text-rose-600">
                  Alex
                </span>
                <ArrowRightIcon className="text-text-muted h-2.5 w-2.5" />
                <span className="[data-theme='dark']_&:text-emerald-400 rounded border border-emerald-500/20 bg-emerald-500/10 px-1 text-emerald-600">
                  Sarah
                </span>
              </div>
              <span className="text-text-primary font-extrabold">$5.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
