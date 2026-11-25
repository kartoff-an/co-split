import type { ReactNode } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type WorkspaceTab = 'transactions' | 'settlements';

interface WorkspaceTabNavigationProps {
  value: WorkspaceTab;
  onValueChange: (value: WorkspaceTab) => void;
  children: ReactNode;
}

export function WorkspaceTabNavigation({ value, onValueChange, children }: WorkspaceTabNavigationProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue === 'transactions' || nextValue === 'settlements') {
          onValueChange(nextValue);
        }
      }}
      className="w-full"
    >
      <TabsList variant="line" className="h-10 w-full justify-start gap-5 rounded-none bg-transparent p-0">
        <TabsTrigger
          value="transactions"
          className="h-10 flex-none rounded-none px-1 text-xs data-active:font-semibold"
        >
          Transactions
        </TabsTrigger>
        <TabsTrigger value="settlements" className="h-10 flex-none rounded-none px-1 text-xs data-active:font-semibold">
          Settlements
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
}
