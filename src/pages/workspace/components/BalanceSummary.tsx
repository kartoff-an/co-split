import type { Balance, Member } from '@/types';
import { formatCurrency } from '@/lib/currency';

interface BalanceSummaryProps {
  balances: Balance[];
  members: Member[];
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
            const member = members.find((item) => item.id === balance.member_id);
            const positive = balance.net_balance > 0;
            const negative = balance.net_balance < 0;

            return (
              <div key={balance.member_id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {member?.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="size-7 rounded-full object-cover" />
                  ) : (
                    <div className="bg-muted text-muted-foreground flex size-7 items-center justify-center rounded-full text-[10px] font-semibold">
                      {balance.member_name?.slice(0, 1).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">
                      {balance.member_name}
                      {balance.member_id === currentUserId ? ' (You)' : ''}
                    </p>
                  </div>
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
                  {formatCurrency(Math.abs(balance.net_balance), currency)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
