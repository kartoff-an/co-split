import { ArrowLeftIcon, GearSixIcon, UserPlusIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface WorkspaceHeaderProps {
  workspaceName: string;
  isOwner: boolean;
  onBack: () => void;
  onInvite: () => void;
  onSettings: () => void;
}

export function WorkspaceHeader({ workspaceName, isOwner, onBack, onInvite, onSettings }: WorkspaceHeaderProps) {
  return (
    <header className="bg-background/85 sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>

        <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onBack} aria-label="Back to dashboard">
          <ArrowLeftIcon size={17} />
        </Button>

        <div className="min-w-0">
          <p className="text-muted-foreground text-[10px] leading-none">Workspace</p>
          <h1 className="truncate text-sm font-semibold tracking-tight">{workspaceName}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isOwner && (
          <Button variant="outline" size="icon" className="size-8" onClick={onSettings} aria-label="Workspace settings">
            <GearSixIcon size={16} />
          </Button>
        )}

        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={onInvite}>
          <UserPlusIcon size={15} />
          <span>Invite</span>
        </Button>
      </div>
    </header>
  );
}
