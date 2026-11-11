interface DashboardWelcomeProps {
  displayName: string;
}

export function DashboardWelcome({ displayName }: DashboardWelcomeProps) {
  return (
    <section className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Welcome back, {displayName.split(' ')[0]}.</h1>

      <p className="text-muted-foreground text-sm">
        Manage your shared expenses and keep track of your group's balances.
      </p>
    </section>
  );
}
