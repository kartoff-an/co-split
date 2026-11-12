import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { PlusIcon, SignInIcon } from '@phosphor-icons/react';

import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import { JoinWorkspaceDialog } from './JoinWorkspaceDialog';

interface WorkspaceActionsProps {
  loading: boolean;
  onCreate: (name: string) => Promise<string | null>;
  onJoin: (id: string) => Promise<string | null>;
}

export function WorkspaceActions({ loading, onCreate, onJoin }: WorkspaceActionsProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={() => setJoinOpen(true)}>
          <SignInIcon data-icon="inline-start" />
          Join workspace
        </Button>

        <Button onClick={() => setCreateOpen(true)}>
          <PlusIcon data-icon="inline-start" />
          Create workspace
        </Button>
      </div>

      <JoinWorkspaceDialog open={joinOpen} onOpenChange={setJoinOpen} loading={loading} onJoin={onJoin} />

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} loading={loading} onCreate={onCreate} />
    </>
  );
}
