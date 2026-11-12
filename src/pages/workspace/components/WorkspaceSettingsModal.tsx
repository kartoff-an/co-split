import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type { Member, Workspace } from '@/types';

import { Spinner } from '@/components/Spinner';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { WarningIcon, CrownIcon, TrashIcon, UserMinusIcon } from '@phosphor-icons/react';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace;
  members: Member[];
  onUpdateWorkspace: (updates: Partial<Workspace>) => Promise<Workspace | null>;
  onRemoveMember: (userId: string) => Promise<boolean>;
  onDeleteWorkspace: () => Promise<boolean>;
  currentUserId: string | undefined;
}

export function WorkspaceSettingsModal({
  isOpen,
  onClose,
  workspace,
  members,
  onUpdateWorkspace,
  onRemoveMember,
  onDeleteWorkspace,
  currentUserId,
}: WorkspaceSettingsModalProps) {
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [allowedMembers, setAllowedMembers] = useState(workspace.allowed_members ?? 10);
  const [currency, setCurrency] = useState(workspace.currency ?? 'PHP');

  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentMemberCount = members.length;
  const isLimitInvalid = allowedMembers < currentMemberCount;

  const isOwner = currentUserId === workspace.owner_id;

  // Base UI Select collection
  const currencyItems = useMemo(
    () =>
      SUPPORTED_CURRENCIES.map((item) => ({
        value: item.code,
        label: `${item.code} (${item.symbol}) - ${item.name}`,
      })),
    []
  );

  useEffect(() => {
    if (!isOpen) return;

    setWorkspaceName(workspace.name);
    setAllowedMembers(workspace.allowed_members ?? 10);
    setCurrency(workspace.currency ?? 'PHP');
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [isOpen, workspace]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!workspaceName.trim()) {
      showError('Workspace name cannot be empty.');
      return;
    }

    if (isLimitInvalid) {
      showError(`Allowed members limit cannot be less than the current member count (${currentMemberCount}).`);
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await onUpdateWorkspace({
        name: workspaceName.trim(),
        allowed_members: allowedMembers,
        currency,
      });

      if (updated) {
        showSuccess('Workspace settings saved successfully.');
      } else {
        showError('Failed to save settings. Please try again.');
      }
    } catch {
      showError('Something went wrong while saving settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === workspace.owner_id || removingId || saving) return;

    const confirmed = window.confirm(
      'Are you sure you want to remove this member? They will lose access to the workspace.'
    );

    if (!confirmed) return;

    setRemovingId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const success = await onRemoveMember(userId);

      if (success) {
        showSuccess('Member removed successfully.');
      } else {
        showError('Failed to remove member. Please try again.');
      }
    } catch {
      showError('Something went wrong while removing the member.');
    } finally {
      setRemovingId(null);
    }
  };

  const handleDelete = async () => {
    if (!isOwner || saving || removingId) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this workspace? This will permanently delete all its expenses and memberships. This action cannot be undone.'
    );

    if (!confirmed) return;

    const workspaceNameInput = window.prompt(`To confirm deletion, type the workspace name: "${workspace.name}"`);

    if (workspaceNameInput !== workspace.name) {
      window.alert("Workspace name didn't match. Deletion cancelled.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const success = await onDeleteWorkspace();

      if (success) {
        onClose();
      } else {
        showError('Failed to delete workspace. Please try again.');
      }
    } catch {
      showError('Something went wrong while deleting the workspace.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !saving && !removingId) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Workspace settings</DialogTitle>
          <DialogDescription>Configure workspace preferences and manage its members.</DialogDescription>
        </DialogHeader>

        {/* Feedback messages */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-600 dark:text-rose-400"
          >
            <WarningIcon size={16} className="mt-0.5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            {successMessage}
          </div>
        )}

        <div className="md:divide-border grid grid-cols-1 gap-7 md:grid-cols-2 md:divide-x">
          {/* Workspace settings */}
          <form onSubmit={handleSave} className="space-y-5 md:pr-6">
            <div>
              <h3 className="text-sm font-semibold">General settings</h3>
              <p className="text-muted-foreground mt-1 text-xs">Update your workspace preferences.</p>
            </div>

            {/* Workspace name */}
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-xs font-medium">
                Workspace name
              </label>

              <Input
                id="workspace-name"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                placeholder="Enter workspace name"
                maxLength={100}
                disabled={saving}
                required
                className="h-10 text-sm"
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Workspace currency</label>

              <Select
                items={currencyItems}
                value={currency}
                onValueChange={(value) => setCurrency(value ?? 'PHP')}
                disabled={saving}
              >
                <SelectTrigger className="h-10 w-full text-sm">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>

                <SelectContent>
                  {currencyItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Member limit */}
            <div className="space-y-2">
              <label htmlFor="allowed-members" className="text-xs font-medium">
                Maximum allowed members
              </label>

              <Input
                id="allowed-members"
                type="number"
                min={Math.max(1, currentMemberCount)}
                value={allowedMembers}
                onChange={(event) => setAllowedMembers(Math.max(1, Number.parseInt(event.target.value) || 1))}
                disabled={saving}
                required
                className={`h-10 text-sm ${isLimitInvalid ? 'border-rose-500 focus-visible:ring-rose-500' : ''}`}
              />

              <p className="text-muted-foreground text-[11px]">
                Currently {currentMemberCount} of {allowedMembers} members.
              </p>

              {isLimitInvalid && (
                <p className="text-xs font-medium text-rose-500">
                  The limit cannot be lower than the current member count.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={saving || !!removingId || isLimitInvalid}
              className="h-10 w-full gap-2 text-xs font-semibold"
            >
              {saving && <Spinner className="size-4 animate-spin" />}
              {saving ? 'Saving changes...' : 'Save changes'}
            </Button>

            {/* Danger zone */}
            {isOwner && (
              <div className="space-y-3 border-t border-rose-500/20 pt-5">
                <div>
                  <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400">Danger zone</h3>

                  <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                    Permanently delete this workspace, including all expenses and memberships.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  disabled={saving || !!removingId}
                  onClick={handleDelete}
                  className="h-10 w-full gap-2 text-xs"
                >
                  <TrashIcon size={15} />
                  Delete workspace
                </Button>
              </div>
            )}
          </form>

          {/* Members */}
          <div className="flex min-w-0 flex-col gap-4 md:pl-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Manage members</h3>
                <p className="text-muted-foreground mt-1 text-xs">People with access to this workspace.</p>
              </div>

              <span className="bg-muted text-muted-foreground rounded-md px-2 py-1 text-[11px] font-medium tabular-nums">
                {currentMemberCount} / {allowedMembers}
              </span>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {members.map((member) => {
                const isMemberOwner = member.id === workspace.owner_id;
                const isCurrentUser = member.id === currentUserId;
                const displayName = member.display_name || 'Member';

                return (
                  <div
                    key={member.id}
                    className="border-border bg-card hover:bg-muted/40 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={displayName}
                          className="border-border size-9 shrink-0 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-semibold text-emerald-600">
                          {displayName.slice(0, 2).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {displayName}
                          {isCurrentUser && <span className="text-muted-foreground ml-1 font-normal">(You)</span>}
                        </p>

                        {isMemberOwner && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CrownIcon size={12} weight="fill" />
                            Workspace owner
                          </span>
                        )}
                      </div>
                    </div>

                    {!isMemberOwner && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={saving || removingId !== null}
                        onClick={() => handleRemoveMember(member.id)}
                        title={`Remove ${displayName}`}
                        className="text-muted-foreground size-8 shrink-0 hover:bg-rose-500/10 hover:text-rose-600"
                      >
                        {removingId === member.id ? (
                          <Spinner className="size-4 animate-spin" />
                        ) : (
                          <UserMinusIcon size={16} />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}

              {members.length === 0 && (
                <div className="border-border rounded-lg border border-dashed py-8 text-center">
                  <p className="text-muted-foreground text-xs">No members found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
