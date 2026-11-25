import type { ReactNode } from 'react';

import type { MemberBalance } from '@/api/types';

import { BalanceSummary } from './BalanceSummary';
import { useWorkspaceContext } from '@/contexts/WorkspaceContext';

interface WorkspaceTransactionTabProps {
  balances: MemberBalance[];
  currentUserId?: string;
  transactions: ReactNode;
}

export function WorkspaceTransactionTab({ balances, currentUserId, transactions }: WorkspaceTransactionTabProps) {
  const { members, currency } = useWorkspaceContext();

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <section className="bg-card border-border/80 rounded-lg border p-4">
        <BalanceSummary balances={balances} members={members} currency={currency} currentUserId={currentUserId} />
      </section>

      <section className="min-w-0 space-y-3">{transactions}</section>
    </div>
  );
}
