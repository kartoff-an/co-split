import type React from 'react';
import { useRef } from 'react';

import { ArrowRightIcon, ChartBarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

import { motion } from 'motion/react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export const LedgerMockup: React.FC = () => {
  const transactions = [
    { name: 'Groceries', payer: 'Alex', amount: '₱450.00' },
    { name: 'Internet bill', payer: 'You', amount: '₱1,200.00' },
    { name: 'Dinner with everyone', payer: 'Jamie', amount: '₱780.00' },
  ];

  const members = [
    { initials: 'S', className: 'bg-primary/10 text-primary' },
    { initials: 'A', className: 'bg-orange-100 text-orange-700' },
    { initials: 'J', className: 'bg-blue-100 text-blue-700' },
  ];

  const balances = [
    { name: 'Sarah (You)', amount: '+₱295.90', positive: true, width: 76 },
    { name: 'Alex', amount: '-₱275.14', positive: false, width: 70 },
    { name: 'Jamie', amount: '-₱20.76', positive: false, width: 12 },
  ];

  const settlements = [
    { from: 'Alex', to: 'Sarah', amount: '₱275.14' },
    { from: 'Jamie', to: 'Sarah', amount: '₱20.76' },
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
      <Card className="border-border bg-card w-full gap-0 overflow-hidden rounded-2xl py-0 shadow-lg shadow-black/5">
        {/* Header */}
        <CardHeader className="border-border flex flex-row items-center justify-between gap-3 border-b px-4 py-4">
          <div>
            <h3 className="text-card-foreground text-sm font-bold">Weekend Expenses</h3>

            <p className="text-muted-foreground mt-1 text-xs">3 members · Shared workspace</p>
          </div>

          <div className="flex -space-x-2">
            {members.map((member) => (
              <Avatar key={member.initials} className="border-card h-8 w-8 border-2">
                <AvatarFallback className={`text-xs font-bold ${member.className}`}>{member.initials}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-4 sm:p-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total spent', value: '₱2,430' },
              { label: 'Avg / head', value: '₱810' },
              { label: 'Settlements', value: '2' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-muted-foreground text-[10px] sm:text-xs">{item.label}</p>

                <p className="text-card-foreground mt-1 text-sm font-bold sm:text-base">{item.value}</p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Balances */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <ChartBarIcon className="text-primary h-4 w-4" />

              <h4 className="text-card-foreground text-sm font-bold">Balances</h4>
            </div>

            <div className="space-y-3">
              {balances.map((member) => (
                <div key={member.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">{member.name}</span>

                    <span
                      className={
                        member.positive
                          ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                          : 'font-semibold text-rose-500'
                      }
                    >
                      {member.amount}
                    </span>
                  </div>

                  <Progress
                    value={member.width}
                    className={`h-1.5 ${member.positive ? '[&>div]:bg-emerald-500' : '[&>div]:bg-rose-500'}`}
                  />
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Transactions */}
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-card-foreground text-sm font-bold">Recent transactions</h4>

              <Badge variant="secondary" className="text-[10px]">
                View all
              </Badge>
            </div>

            <div className="divide-border divide-y">
              {transactions.map((transaction) => (
                <div key={transaction.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-card-foreground truncate text-xs font-semibold">{transaction.name}</p>

                    <p className="text-muted-foreground mt-1 text-[10px]">Paid by {transaction.payer}</p>
                  </div>

                  <span className="text-card-foreground shrink-0 text-xs font-semibold">{transaction.amount}</span>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          {/* Settlements */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <CheckCircleIcon className="text-primary h-4 w-4" />

              <h4 className="text-card-foreground text-sm font-bold">Settlement plan</h4>

              <Badge variant="outline" className="ml-auto text-[10px]">
                2 payments
              </Badge>
            </div>

            <div className="space-y-2">
              {settlements.map((settlement) => (
                <div
                  key={settlement.from}
                  className="bg-muted/70 flex items-center justify-between gap-2 rounded-lg p-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2 text-xs">
                    <span className="text-muted-foreground truncate">{settlement.from}</span>

                    <ArrowRightIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />

                    <span className="text-primary truncate font-medium">{settlement.to}</span>
                  </div>

                  <span className="text-card-foreground shrink-0 text-xs font-semibold">{settlement.amount}</span>
                </div>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>
    </motion.div>
  );
};
