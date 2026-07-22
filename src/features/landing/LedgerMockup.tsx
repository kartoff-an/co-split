import type React from 'react';
import {
  CommandLineIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export const LedgerMockup: React.FC = () => {
  return (
    <div className="glass-card group relative space-y-4 overflow-hidden rounded-2xl border border-slate-100 p-4 shadow-xl">
      <div className="border-primary-green/20 pointer-events-none absolute top-2.5 left-2.5 h-2.5 w-2.5 rounded-tl-xs border-t-2 border-l-2" />
      <div className="border-primary-green/20 pointer-events-none absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-tr-xs border-t-2 border-r-2" />
      <div className="border-primary-green/20 pointer-events-none absolute bottom-2.5 left-2.5 h-2.5 w-2.5 rounded-bl-xs border-b-2 border-l-2" />
      <div className="border-primary-green/20 pointer-events-none absolute right-2.5 bottom-2.5 h-2.5 w-2.5 rounded-br-xs border-r-2 border-b-2" />

      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-1.5 text-[9px] font-bold text-slate-400">
            IoT Smart Sensor
          </span>
        </div>
        <span className="bg-primary-green-light text-primary-green border-primary-green-light/45 rounded-full border px-2 py-0.5 text-[8px] font-bold">
          Real-time sync
        </span>
      </div>

      <div className="flex flex-col justify-between gap-2 rounded-xl border border-slate-100 bg-white p-3 shadow-2xs md:flex-row md:items-center">
        <div className="space-y-0.5 text-left">
          <span className="text-[8px] font-bold text-slate-400">
            Workspace ledger
          </span>
          <h2 className="text-xs leading-tight font-extrabold tracking-tight text-slate-800">
            IoT Smart Sensor
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 md:justify-end">
          <span className="border-accent-coral/45 text-accent-coral flex items-center gap-1 rounded-full border bg-white px-1.5 py-0.5 text-[9px] font-semibold shadow-2xs">
            <span>Sarah (You)</span>
          </span>
          <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
            <span>Alex</span>
          </span>
          <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
            <span>Jamie</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-left">
          <span className="text-slate-450 text-[8px] font-bold">
            Total spent
          </span>
          <p className="text-slate-850 text-xs font-extrabold">$90.00</p>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-left">
          <span className="text-slate-450 text-[8px] font-bold">
            Avg / Head
          </span>
          <p className="text-slate-855 text-xs font-extrabold">$30.00</p>
        </div>
        <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-left">
          <span className="text-slate-450 text-[8px] font-bold">Settles</span>
          <p className="text-slate-850 text-xs font-extrabold">1</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 text-left">
        <div className="flex items-center gap-1">
          <div className="text-emerald-655 flex h-5 w-5 items-center justify-center rounded bg-emerald-50">
            <ChartBarIcon className="h-3 w-3" />
          </div>
          <h3 className="text-[10px] font-bold text-slate-800">Balances</h3>
        </div>

        <div className="space-y-2">
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-medium">
              <span className="text-slate-700">Sarah (You)</span>
              <span className="font-bold text-emerald-600">+$35.00</span>
            </div>
            <div className="relative h-1 w-full rounded-full bg-slate-100">
              <div
                className="absolute left-1/2 h-full rounded-r bg-emerald-500"
                style={{ width: '40%' }}
              ></div>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-medium">
              <span className="text-slate-700">Alex</span>
              <span className="font-bold text-rose-500">-$5.00</span>
            </div>
            <div className="relative h-1 w-full rounded-full bg-slate-100">
              <div
                className="absolute right-1/2 h-full rounded-l bg-rose-500"
                style={{ width: '10%' }}
              ></div>
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[9px] font-medium">
              <span className="text-slate-700">Jamie</span>
              <span className="font-bold text-rose-500">-$30.00</span>
            </div>
            <div className="relative h-1 w-full rounded-full bg-slate-100">
              <div
                className="absolute right-1/2 h-full rounded-l bg-rose-500"
                style={{ width: '35%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 text-left">
          <div className="flex items-center gap-1">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-50 text-slate-500">
              <CommandLineIcon className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-bold text-slate-800">
              Transactions
            </h3>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[9px]">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-700">
                  Microcontrollers & Sensors
                </p>
                <p className="text-slate-455 text-[8px]">Paid by Alex</p>
              </div>
              <span className="shrink-0 font-extrabold text-slate-800">
                $25.00
              </span>
            </div>
            <div className="flex items-center justify-between text-[9px]">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-700">
                  PCB Fab & SMD Components
                </p>
                <p className="text-slate-455 text-[8px]">Paid by you</p>
              </div>
              <span className="shrink-0 font-extrabold text-slate-800">
                $65.00
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-3 text-left">
          <div className="flex items-center gap-1">
            <div className="text-teal-655 flex h-5 w-5 items-center justify-center rounded bg-teal-50">
              <CheckCircleIcon className="h-3 w-3" />
            </div>
            <h3 className="text-[10px] font-bold text-slate-800">
              Settlements
            </h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between rounded bg-slate-50 p-1 text-[8px]">
              <div className="flex items-center gap-1">
                <span className="text-rose-750 rounded border border-rose-100 bg-rose-50 px-1">
                  Jamie
                </span>
                <ArrowRightIcon className="h-2.5 w-2.5 text-slate-400" />
                <span className="text-emerald-755 rounded border border-emerald-100 bg-emerald-50 px-1">
                  Sarah
                </span>
              </div>
              <span className="font-extrabold text-slate-800">$30.00</span>
            </div>
            <div className="flex items-center justify-between rounded bg-slate-50 p-1 text-[8px]">
              <div className="flex items-center gap-1">
                <span className="text-rose-750 rounded border border-rose-100 bg-rose-50 px-1">
                  Alex
                </span>
                <ArrowRightIcon className="h-2.5 w-2.5 text-slate-400" />
                <span className="text-emerald-755 rounded border border-emerald-100 bg-emerald-50 px-1">
                  Sarah
                </span>
              </div>
              <span className="font-extrabold text-slate-800">$5.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
