import type { KeyboardEvent } from 'react';

import type { WorkspaceItem } from '@/types';
import { formatCurrency } from '@/lib/currency';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(workspace.id);
    }
  };

  return (
    <Card
      className="group hover:border-primary/40 cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs"
      onClick={() => onOpen(workspace.id)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <CardHeader className="space-y-1.5 px-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="group-hover:text-primary truncate text-sm font-semibold transition-colors">
            {workspace.name}
          </CardTitle>

          <div className="flex shrink-0 items-center gap-1.5">
            {isOwner && (
              <Badge variant="secondary" className="px-2 py-0 text-[10px]">
                Owner
              </Badge>
            )}

            <ArrowUpRightIcon
              size={16}
              className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
        </div>

        <CardDescription className="text-xs">Created by {workspace.owner_name}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4">
        <div className="bg-muted/40 grid grid-cols-2 overflow-hidden rounded-lg border">
          <div className="space-y-0.5 p-2.5">
            <p className="text-muted-foreground text-[11px]">Total expenses</p>

            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(workspace.total_expenses, workspace.currency)}
            </p>
          </div>

          <div className="space-y-0.5 border-l p-2.5">
            <p className="text-muted-foreground text-[11px]">Your balance</p>

            <div className="flex items-center gap-1">
              {!isSettled &&
                (isPositive ? (
                  <TrendUpIcon size={14} weight="bold" className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendDownIcon size={14} weight="bold" className="text-rose-600 dark:text-rose-400" />
                ))}

              <p
                className={`text-sm font-semibold tabular-nums ${
                  isSettled
                    ? 'text-muted-foreground'
                    : isPositive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isSettled
                  ? 'Settled'
                  : `${isPositive ? '+' : '-'}${formatCurrency(Math.abs(netBalance), workspace.currency)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1">
            <UsersThreeIcon size={14} />

            <span>
              {workspace.member_count} member
              {workspace.member_count === 1 ? '' : 's'}
            </span>
          </div>

          <span>
            {new Date(workspace.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
