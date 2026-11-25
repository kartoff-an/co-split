import type { MemberBalance, WorkspaceMember } from '@/api/types';

import { formatCurrency } from '@/lib/currency';

interface BalanceSummaryProps {
  balances: MemberBalance[];
  members: WorkspaceMember[];
  currency: string;
  currentUserId?: string;
}

export function BalanceSummary({ balances, members, currency, currentUserId }: BalanceSummaryProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight">Member balances</h3>
      </div>

      {balances.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-xs">No balances available yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {balances.map((balance) => {
            const member = members.find((item) => item.id === balance.user_id);

            const netBalance = Number(balance.net_balance);
            const positive = netBalance > 0;
            const negative = netBalance < 0;

            return (
              <div key={balance.user_id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {member?.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="size-7 rounded-full object-cover" />
                  ) : (
                    <div className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-full text-[10px] font-semibold">
                      {member?.display_name?.slice(0, 1).toUpperCase() ?? '?'}
                    </div>
                  )}

                  <p className="truncate text-xs font-medium">
                    {member?.display_name ?? 'Unknown member'}
                    {balance.user_id === currentUserId ? ' (You)' : ''}
                  </p>
                </div>

                <p
                  className={`shrink-0 text-xs font-semibold tabular-nums ${
                    positive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : negative
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-muted-foreground'
                  }`}
                >
                  {positive ? '+' : negative ? '-' : ''}
                  {formatCurrency(Math.abs(netBalance), currency)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
