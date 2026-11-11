import { useState } from 'react';

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

import { SignInIcon, SpinnerGapIcon } from '@phosphor-icons/react';

interface JoinWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onJoin: (id: string) => Promise<string | null>;
}

export function JoinWorkspaceDialog({ open, onOpenChange, loading, onJoin }: JoinWorkspaceDialogProps) {
  const [workspaceCode, setWorkspaceCode] = useState('');

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const workspaceId = await onJoin(workspaceCode);

    if (workspaceId) {
      setWorkspaceCode('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join a workspace</DialogTitle>
          <DialogDescription>Enter the invitation code shared by a workspace member.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="workspace-code" className="text-sm font-medium">
              Invitation code
            </label>

            <Input
              id="workspace-code"
              placeholder="Paste invitation code..."
              value={workspaceCode}
              onChange={(event) => setWorkspaceCode(event.target.value)}
              disabled={loading}
              required
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>

            <Button type="submit" disabled={loading || !workspaceCode.trim()}>
              {loading ? (
                <SpinnerGapIcon data-icon="inline-start" className="animate-spin" />
              ) : (
                <SignInIcon data-icon="inline-start" />
              )}
              Join workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
