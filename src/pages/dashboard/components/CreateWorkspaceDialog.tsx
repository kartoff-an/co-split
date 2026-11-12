import { useState, type SubmitEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { PlusIcon, SpinnerGapIcon } from '@phosphor-icons/react';

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onCreate: (name: string) => Promise<string | null>;
}

export function CreateWorkspaceDialog({ open, onOpenChange, loading, onCreate }: CreateWorkspaceDialogProps) {
  const [workspaceName, setWorkspaceName] = useState('');

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const workspaceId = await onCreate(workspaceName);

    if (workspaceId) {
      setWorkspaceName('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a workspace</DialogTitle>
          <DialogDescription>Create a group to start tracking and splitting expenses.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="workspace-name" className="text-sm font-medium">
              Workspace name
            </label>

            <Input
              id="workspace-name"
              placeholder="e.g. Summer Trip"
              value={workspaceName}
              onChange={(event) => setWorkspaceName(event.target.value)}
              disabled={loading}
              required
              maxLength={80}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>

            <Button type="submit" disabled={loading || !workspaceName.trim()}>
              {loading ? (
                <SpinnerGapIcon data-icon="inline-start" className="animate-spin" />
              ) : (
                <PlusIcon data-icon="inline-start" />
              )}
              Create workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
