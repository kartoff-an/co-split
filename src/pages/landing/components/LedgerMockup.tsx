import type React from 'react';
import { useRef } from 'react';

import { ArrowRightIcon, CheckCircleIcon, PlusIcon, ReceiptIcon, UsersIcon } from '@phosphor-icons/react';

import { motion } from 'motion/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export const LedgerMockup: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const members = [
    { name: 'Sarah', initials: 'S' },
    { name: 'Alex', initials: 'A' },
    { name: 'Jamie', initials: 'J' },
  ];

  const expenses = [
    {
      name: 'Groceries',
      category: 'Food & Drinks',
      payer: 'Alex',
      amount: '₱450.00',
      initials: 'A',
      date: 'Today',
    },
    {
      name: 'Internet bill',
      category: 'Utilities',
      payer: 'You',
      amount: '₱1,200.00',
      initials: 'S',
      date: 'Yesterday',
    },
    {
      name: 'Dinner with everyone',
      category: 'Food & Drinks',
      payer: 'Jamie',
      amount: '₱780.00',
      initials: 'J',
      date: 'Yesterday',
    },
  ];

  const balances = [
    { name: 'Sarah (You)', amount: '+₱295.90', positive: true },
    { name: 'Alex', amount: '-₱275.14', positive: false },
    { name: 'Jamie', amount: '-₱20.76', positive: false },
  ];

  const settlements = [
    { from: 'Alex', to: 'Sarah', amount: '₱275.14' },
    { from: 'Jamie', to: 'Sarah', amount: '₱20.76' },
  ];

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
      className="h-full [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
    >
      <div className="border-border bg-background space-y-3 rounded-xl border p-3 shadow-lg shadow-black/5 sm:space-y-4 sm:p-4">
        {/* Workspace Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
              <ReceiptIcon className="size-4" />
            </div>

            <div className="min-w-0">
              <h3 className="text-foreground truncate text-sm font-semibold tracking-tight">Weekend Expenses</h3>
              <p className="text-muted-foreground text-xs">Shared workspace</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden -space-x-2 sm:flex">
              {members.map((member) => (
                <Avatar key={member.initials} className="border-background size-7 border-2">
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-semibold">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>

            <Badge variant="secondary" className="gap-1 text-[10px]">
              <UsersIcon className="size-3" />3 members
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Workspace Content */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(220px,1fr)]">
          {/* Left: Transactions */}
          <div className="min-w-0">
            <Card className="border-border gap-3 rounded-xl py-3 shadow-none">
              <CardHeader className="px-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-semibold">Transactions</CardTitle>
                    <p className="text-muted-foreground mt-1 text-[10px]">Track and manage shared expenses</p>
                  </div>

                  <Button size="sm" className="h-8 shrink-0 gap-1.5 text-xs">
                    <PlusIcon className="size-3.5" />
                    Add expense
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 px-3">
                {/* Search */}
                <Input placeholder="Search transactions..." className="h-8 text-xs" readOnly />

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[10px] font-medium">Recent activity</span>

                  <Badge variant="secondary" className="text-[10px]">
                    3 records
                  </Badge>
                </div>

                {/* Transaction List */}
                <div className="divide-border divide-y">
                  {expenses.map((expense) => (
                    <div key={expense.name} className="flex min-w-0 items-center justify-between gap-2 py-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Avatar className="size-8 shrink-0 rounded-lg">
                          <AvatarFallback className="bg-muted text-muted-foreground rounded-lg text-xs font-semibold">
                            {expense.initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 space-y-0.5">
                          <p className="text-foreground truncate text-xs font-semibold">{expense.name}</p>

                          <div className="text-muted-foreground flex flex-wrap items-center gap-1 text-[10px]">
                            <span>{expense.category}</span>
                            <span>·</span>
                            <span>Paid by {expense.payer}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-foreground text-xs font-semibold">{expense.amount}</p>
                        <p className="text-muted-foreground mt-0.5 text-[9px]">{expense.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[10px]">Showing 3 expenses</span>

                  <Button variant="ghost" size="sm" className="text-primary h-7 px-2 text-[10px]">
                    View all
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Balances and Settlements */}
          <div className="flex min-w-0 flex-col gap-4">
            {/* Balance Summary */}
            <Card className="border-border gap-3 rounded-xl py-3 shadow-none">
              <CardHeader className="px-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Balances</CardTitle>

                  <Badge variant="outline" className="text-[9px]">
                    Overview
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 px-3">
                <div>
                  <p className="text-muted-foreground text-[10px]">Total workspace cost</p>

                  <p className="text-foreground mt-0.5 text-xl font-bold tracking-tight">₱2,430.00</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  {balances.map((member) => (
                    <div key={member.name} className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground truncate">{member.name}</span>

                      <span
                        className={`shrink-0 font-semibold ${
                          member.positive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {member.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Settlements */}
            <Card className="border-border gap-3 rounded-xl py-3 shadow-none">
              <CardHeader className="px-3">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">Settlements</CardTitle>

                  <Badge variant="secondary" className="text-[9px]">
                    2 pending
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-2 px-3">
                {settlements.map((item) => (
                  <div
                    key={item.from}
                    className="bg-muted/60 flex min-w-0 items-center justify-between gap-2 rounded-lg px-2.5 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-1.5 text-[10px]">
                      <span className="text-muted-foreground truncate">{item.from}</span>

                      <ArrowRightIcon className="text-muted-foreground size-3 shrink-0" />

                      <span className="text-foreground truncate font-medium">{item.to}</span>
                    </div>

                    <span className="text-foreground shrink-0 text-[10px] font-semibold">{item.amount}</span>
                  </div>
                ))}

                <Button variant="outline" size="sm" className="h-8 w-full gap-1.5 text-xs">
                  <CheckCircleIcon className="size-3.5" />
                  Settle up
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Workspace Footer */}
        <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
          <p className="text-muted-foreground text-[10px]">All expenses are synced with your workspace</p>

          <Badge variant="outline" className="gap-1 text-[9px] font-normal">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Synced
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};
