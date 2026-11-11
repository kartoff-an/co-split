import { WalletIcon, UsersThreeIcon } from '@phosphor-icons/react';

interface DashboardOverviewProps {
  totalWorkspaces: number;
  ownedWorkspaces: number;
  loading: boolean;
}

export function DashboardOverview({ totalWorkspaces, ownedWorkspaces, loading }: DashboardOverviewProps) {
  return (
    <section className="flex flex-wrap items-center gap-x-10 gap-y-5">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">
          <WalletIcon size={22} weight="duotone" />
        </div>

        <div className="space-y-0.5">
          <p className="text-muted-foreground text-sm">Total workspaces</p>
          <p className="text-2xl font-semibold tabular-nums">{loading ? '—' : totalWorkspaces}</p>
        </div>
      </div>

      <div className="bg-border hidden h-10 w-px sm:block" />

      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">
          <UsersThreeIcon size={22} weight="duotone" />
        </div>

        <div className="space-y-0.5">
          <p className="text-muted-foreground text-sm">Workspaces you own</p>
          <p className="text-2xl font-semibold tabular-nums">{loading ? '—' : ownedWorkspaces}</p>
        </div>
      </div>
    </section>
  );
}
