import type React from 'react';
import { ArrowRightIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';
import { motion } from 'motion/react';

export const LedgerMockup: React.FC = () => {
  const transactions = [
    { name: 'Groceries', payer: 'Alex', amount: '₱450.00' },
    { name: 'Internet bill', payer: 'You', amount: '₱1,200.00' },
    { name: 'Dinner with everyone', payer: 'Jamie', amount: '₱780.00' },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);


  const scrollTo = (bottom: boolean) => {
    const element = scrollRef.current;
    if (!element) return;

    element.scrollTo({
      top: bottom ? element.scrollHeight : 0,
      behavior: 'smooth',
    });
  };

  return (
    <motion.div
      ref={scrollRef}
      onHoverStart={() => scrollTo(true)}
      onHoverEnd={() => scrollTo(false)}
      className="h-full overflow-y-auto [scrollbar:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="border-border-subtle bg-surface w-full overflow-hidden rounded-2xl border shadow-lg shadow-slate-900/5">
        {/* Header */}
        <div className="border-border-subtle flex items-center justify-between border-b px-4 py-4">
          <div>
            <h3 className="text-text-primary text-sm font-bold">Weekend Expenses</h3>
            <p className="text-text-muted mt-1 text-xs">3 members · Shared workspace</p>
          </div>

          <div className="flex -space-x-2">
            {[
              { initials: 'S', color: 'bg-primary-green-light text-primary-green' },
              { initials: 'A', color: 'bg-orange-100 text-orange-700' },
              { initials: 'J', color: 'bg-blue-100 text-blue-700' },
            ].map((member) => (
              <div
                key={member.initials}
                className={`border-surface flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${member.color}`}
              >
                {member.initials}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-text-muted text-[10px] sm:text-xs">Total spent</p>
              <p className="text-text-primary mt-1 text-sm font-bold sm:text-base">₱2,430</p>
            </div>

            <div>
              <p className="text-text-muted text-[10px] sm:text-xs">Avg / head</p>
              <p className="text-text-primary mt-1 text-sm font-bold sm:text-base">₱810</p>
            </div>

            <div>
              <p className="text-text-muted text-[10px] sm:text-xs">Settlements</p>
              <p className="text-text-primary mt-1 text-sm font-bold sm:text-base">2</p>
            </div>
          </div>

          {/* Balances */}
          <div className="border-border-subtle border-t pt-4">
            <div className="mb-4 flex items-center gap-2">
              <ChartBarIcon className="text-primary-green h-4 w-4" />
              <h4 className="text-text-primary text-sm font-bold">Balances</h4>
            </div>

            {[
              { name: 'Sarah (You)', amount: '+₱295.90', positive: true, width: '76%' },
              { name: 'Alex', amount: '-₱275.14', positive: false, width: '70%' },
              { name: 'Jamie', amount: '-₱20.76', positive: false, width: '12%' },
            ].map((member) => (
              <div key={member.name} className="mb-3 last:mb-0">
                <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                  <span className="text-text-secondary">{member.name}</span>
                  <span
                    className={member.positive ? 'text-status-positive font-semibold' : 'font-semibold text-rose-500'}
                  >
                    {member.amount}
                  </span>
                </div>

                <div className="bg-surface-subtle h-1.5 overflow-hidden rounded-full">
                  <div
                    className={`h-full rounded-full ${member.positive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: member.width }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Transactions */}
          <div className="border-border-subtle border-t pt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-text-primary text-sm font-bold">Recent transactions</h4>
              <span className="text-text-muted text-xs">View all</span>
            </div>

            <div className="divide-border-subtle divide-y">
              {transactions.map((transaction) => (
                <div key={transaction.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-text-primary truncate text-xs font-semibold">{transaction.name}</p>
                    <p className="text-text-muted mt-1 text-[10px]">Paid by {transaction.payer}</p>
                  </div>

                  <span className="text-text-primary shrink-0 text-xs font-semibold">{transaction.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Settlements */}
          <div className="border-border-subtle border-t pt-4">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircleIcon className="text-primary-green h-4 w-4" />
              <h4 className="text-text-primary text-sm font-bold">Settlement plan</h4>
            </div>

            {[
              { from: 'Alex', to: 'Sarah', amount: '₱275.14' },
              { from: 'Jamie', to: 'Sarah', amount: '₱20.76' },
            ].map((settlement) => (
              <div
                key={settlement.from}
                className="bg-surface-subtle mb-2 flex items-center justify-between gap-2 rounded-lg p-2.5 last:mb-0"
              >
                <div className="flex min-w-0 items-center gap-2 text-xs">
                  <span className="text-text-secondary truncate">{settlement.from}</span>
                  <ArrowRightIcon className="text-text-muted h-3.5 w-3.5 shrink-0" />
                  <span className="text-primary-green truncate font-medium">{settlement.to}</span>
                </div>

                <span className="text-text-primary shrink-0 text-xs font-semibold">{settlement.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
