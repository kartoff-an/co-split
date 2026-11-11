interface DashboardWelcomeProps {
  displayName: string;
}

export function DashboardWelcome({ displayName }: DashboardWelcomeProps) {
  return (
    <section className="space-y-3">
      <div className="space-y-2">
        <h1 className="font-heading text-foreground text-2xl leading-tight font-extrabold tracking-tight sm:text-2xl">
          Welcome back, {displayName.split(' ')[0]}.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-xs leading-6 sm:text-sm">
          Your groups, shared expenses, and balances — all in one place.
        </p>
      </div>
    </section>
  );
}
