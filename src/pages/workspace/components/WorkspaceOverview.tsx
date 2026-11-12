import { ArrowsLeftRightIcon, CurrencyCircleDollarIcon, UsersThreeIcon } from '@phosphor-icons/react';

import { formatCurrency } from '@/lib/currency';

interface WorkspaceOverviewProps {
  totalSpent: number;
  averagePerPerson: number;
  memberCount: number;
  currency: string;
  transactionCount: number;
}

export function WorkspaceOverview({
  totalSpent,
  averagePerPerson,
  currency,
  transactionCount,
}: WorkspaceOverviewProps) {
  const metrics = [
    {
      label: 'Total spent',
      value: formatCurrency(totalSpent, currency),
      icon: CurrencyCircleDollarIcon,
    },
    {
      label: 'Average per person',
      value: formatCurrency(averagePerPerson, currency),
      icon: UsersThreeIcon,
    },
    {
      label: 'Transactions',
      value: transactionCount.toString(),
      icon: ArrowsLeftRightIcon,
    },
  ];

  return (
    <section className="flex flex-wrap items-center gap-x-10 gap-y-5">
      {metrics.map(({ label, value, icon: Icon }) => (
        <div key={label} className="flex min-w-0 items-center gap-3">
          <div className="text-muted-foreground">
            <Icon size={21} weight="duotone" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="text-foreground text-base font-semibold tabular-nums sm:text-lg">{value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
