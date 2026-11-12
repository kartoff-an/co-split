import { CalendarDotsIcon } from '@phosphor-icons/react';

interface WorkspaceWelcomeProps {
  name: string;
  description?: string | null;
  createdAt?: string;
}

export function WorkspaceWelcome({ name, description, createdAt }: WorkspaceWelcomeProps) {
  return (
    <section className="space-y-2">
      <div className="space-y-1.5">
        <h2 className="font-heading text-foreground text-2xl leading-tight font-extrabold tracking-tight">{name}</h2>

        <p className="text-muted-foreground max-w-2xl text-xs leading-6 sm:text-sm">
          {description || 'Track shared expenses, monitor balances, and settle up with your group.'}
        </p>
      </div>

      {createdAt && (
        <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
          <CalendarDotsIcon size={13} />
          Created {new Date(createdAt).toLocaleDateString()}
        </div>
      )}
    </section>
  );
}
