import type { KeyboardEvent } from 'react';

import type { WorkspaceItem } from '@/types';
import { formatCurrency } from '@/lib/currency';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { ArrowUpRightIcon, UsersThreeIcon, TrendUpIcon, TrendDownIcon } from '@phosphor-icons/react';

interface WorkspaceCardProps {
  workspace: WorkspaceItem;
  userId: string;
  onOpen: (id: string) => void;
}

export function WorkspaceCard({ workspace, userId, onOpen }: WorkspaceCardProps) {
  const isOwner = workspace.owner_id === userId;
  const netBalance = workspace.user_net_balance;
  const isSettled = Math.abs(netBalance) < 0.01;
  const isPositive = netBalance >= 0;

  const createdAt = new Date(workspace.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(workspace.id);
    }
  };

  const balanceColor = isSettled
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-rose-600 dark:text-rose-400';

  const balanceText = isSettled
    ? 'Settled'
    : `${isPositive ? '+' : '-'}${formatCurrency(Math.abs(netBalance), workspace.currency)}`;

  return (
    <Card
      className="group bg-card border-border/80 hover:border-primary/35 focus-visible:ring-ring hover:bg-muted/30 cursor-pointer rounded-lg py-0 shadow-none transition-colors focus-visible:ring-2"
      onClick={() => onOpen(workspace.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Open ${workspace.name} workspace`}
    >
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
            <UsersThreeIcon size={17} className="text-muted-foreground" />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <p className="group-hover:text-primary truncate text-xs font-semibold transition-colors">
                {workspace.name}
              </p>

              {isOwner && (
                <Badge variant="secondary" className="rounded-full px-1.5 py-0 text-[9px]">
                  Owner
                </Badge>
              )}
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-[10px]">
              <span className="truncate">Created by {workspace.owner_name}</span>

              <span className="flex shrink-0 items-center gap-0.5">
                <UsersThreeIcon size={12} />
                {workspace.member_count}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-64 sm:shrink-0">
          <div className="space-y-0.5">
            <p className="text-muted-foreground text-[9px] font-medium tracking-wide uppercase">Total expenses</p>
            <p className="text-xs font-semibold tabular-nums">
              {formatCurrency(workspace.total_expenses, workspace.currency)}
            </p>
          </div>

          <div className="space-y-0.5">
            <p className="text-muted-foreground text-[9px] font-medium tracking-wide uppercase">Your balance</p>

            <div className="flex items-center gap-1">
              {!isSettled &&
                (isPositive ? (
                  <TrendUpIcon size={12} weight="bold" className={balanceColor} />
                ) : (
                  <TrendDownIcon size={12} weight="bold" className={balanceColor} />
                ))}

              <p className={`text-xs font-semibold tabular-nums ${balanceColor}`}>{balanceText}</p>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center justify-between gap-3 border-t pt-2 text-[10px] sm:w-36 sm:shrink-0 sm:justify-end sm:border-t-0 sm:pt-0">
          <span>{createdAt}</span>

          <ArrowUpRightIcon size={14} className="group-hover:text-primary shrink-0 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
