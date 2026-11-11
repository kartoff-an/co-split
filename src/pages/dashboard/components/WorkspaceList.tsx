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
          <h2 className="text-lg font-semibold tracking-tight">Your workspaces</h2>
        </div>

        <Badge variant="outline">{workspaces.length} total</Badge>
      </div>

      {loading ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
          <SpinnerGapIcon size={28} className="text-muted-foreground animate-spin" />

          <p className="text-muted-foreground text-sm">Loading your workspaces...</p>
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
            <div className="bg-muted flex size-14 items-center justify-center rounded-full">
              <TrayIcon size={28} weight="duotone" className="text-muted-foreground" />
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold">No workspaces yet</h3>

              <p className="text-muted-foreground max-w-sm text-sm">
                Create a workspace for your group or join one using an invitation code.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} userId={userId} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
