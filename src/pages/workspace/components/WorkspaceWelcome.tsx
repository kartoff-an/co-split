import { useWorkspaceContext } from '@/contexts/WorkspaceContext';
import { CalendarDotsIcon } from '@phosphor-icons/react';

export function WorkspaceWelcome() {
  const { workspace } = useWorkspaceContext();
  return (
    <section className="space-y-2">
      <div className="space-y-1.5">
        <h2 className="font-heading text-foreground text-2xl leading-tight font-extrabold tracking-tight">
          {workspace.name}
        </h2>

        <p className="text-muted-foreground max-w-2xl text-xs leading-6 sm:text-sm">
          Track shared expenses, monitor balances, and settle up with your group.
        </p>
      </div>

      {workspace.created_at && (
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
          <CalendarDotsIcon size={13} />
          Created {new Date(workspace.created_at).toLocaleDateString()}
        </div>
      )}
    </section>
  );
}
