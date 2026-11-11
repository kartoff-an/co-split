import type { WorkspaceItem } from '@/types';

import { WorkspaceCard } from './WorkspaceCard';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { TrayIcon, SpinnerGapIcon } from '@phosphor-icons/react';

interface WorkspaceListProps {
  workspaces: WorkspaceItem[];
  userId: string;
  loading: boolean;
  onOpen: (id: string) => void;
}

export function WorkspaceList({ workspaces, userId, loading, onOpen }: WorkspaceListProps) {
  return (
    <section id="workspaces" className="min-w-0 scroll-mt-20 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold tracking-tight">Your workspaces</h2>
          <p className="text-muted-foreground text-xs">Manage and view your group expenses.</p>
        </div>

        <Badge variant="outline" className="text-[10px]">
          {workspaces.length} total
        </Badge>
      </div>

      {loading ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
          <SpinnerGapIcon size={24} className="text-muted-foreground animate-spin" />
          <p className="text-muted-foreground text-xs">Loading your workspaces...</p>
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <TrayIcon size={24} weight="duotone" className="text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-semibold">No workspaces yet</h3>
              <p className="text-muted-foreground max-w-sm text-xs">
                Create a workspace for your group or join one using an invitation code.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} userId={userId} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
