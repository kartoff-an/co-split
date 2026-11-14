import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { CheckIcon, ClipboardTextIcon, LinkIcon, ArrowsClockwiseIcon } from '@phosphor-icons/react';

import { Spinner } from '@/components/Spinner';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  inviterName: string;
  inviteCode?: string;
  isOwner?: boolean;
  onRegenerateInvite?: () => Promise<string | null>;
}

export function InviteModal(props: InviteModalProps) {
  return (
    <InviteModalContent
      key={`${props.workspaceId}-${props.isOpen}`}
      {...props}
    />
  );
}

export function InviteModalContent({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  inviterName,
  inviteCode,
  isOwner = false,
  onRegenerateInvite,
}: InviteModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const [regenerating, setRegenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inviteUrl = inviteCode
    ? new URL(`/join/${encodeURIComponent(inviteCode)}`, window.location.origin)
    : new URL('/dashboard', window.location.origin);

  const inviteLink = inviteUrl.toString();

  const inviteMessage = `${inviterName || 'A group member'} invited you to join "${workspaceName || 'Workspace'}" on Co-Split.\nLink: ${inviteLink}`;

  const copyToClipboard = async (value: string, setCopied: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setErrorMessage('Unable to copy to clipboard. Please copy manually.');
    }
  };

  const handleRegenerateInvite = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to regenerate the invite code? All old invite links will stop working.'
    );

    if (!confirmed || !onRegenerateInvite) return;

    setRegenerating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const newCode = await onRegenerateInvite();

      if (newCode) {
        setSuccessMessage('Invite link regenerated successfully!');
      } else {
        setErrorMessage('Failed to regenerate invite link.');
      }
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !regenerating) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite members</DialogTitle>
          <DialogDescription>Share your workspace details with other members so they can join.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Workspace ID */}
          <div className="space-y-2">
            <label htmlFor="workspace-id" className="text-xs font-medium">
              Workspace ID
            </label>

            <div className="flex gap-2">
              <Input id="workspace-id" readOnly value={workspaceId} className="h-10 min-w-0 text-xs" />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                onClick={() => copyToClipboard(workspaceId, setCopiedId)}
                title="Copy workspace ID"
              >
                {copiedId ? (
                  <CheckIcon className="size-4 text-emerald-600" />
                ) : (
                  <ClipboardTextIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Invite Link */}
          <div className="space-y-2">
            <label htmlFor="invite-link" className="text-xs font-medium">
              Invite link
            </label>

            <div className="flex gap-2">
              <Input id="invite-link" readOnly value={inviteLink} className="h-10 min-w-0 text-xs" />

              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                onClick={() => copyToClipboard(inviteLink, setCopiedUrl)}
                title="Copy invite link"
              >
                {copiedUrl ? <CheckIcon className="size-4 text-emerald-600" /> : <LinkIcon className="size-4" />}
              </Button>
            </div>
          </div>

          {/* Share Message */}
          <div className="space-y-2">
            <label htmlFor="invite-message" className="text-xs font-medium">
              Share message
            </label>

            <div className="relative">
              <Textarea
                id="invite-message"
                readOnly
                rows={4}
                value={inviteMessage}
                className="resize-none pr-12 text-xs leading-relaxed"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 bottom-2 size-8"
                onClick={() => copyToClipboard(inviteMessage, setCopiedMsg)}
                title="Copy message"
              >
                {copiedMsg ? (
                  <CheckIcon className="size-4 text-emerald-600" />
                ) : (
                  <ClipboardTextIcon className="size-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Regenerate Invite */}
          {isOwner && onRegenerateInvite && (
            <div className="border-border space-y-3 border-t pt-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold">Regenerate invite link</p>

                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  If your invite link is leaked, you can generate a new one. This immediately invalidates all previous
                  invite links.
                </p>
              </div>

              {successMessage && <p className="text-xs font-medium text-emerald-600">{successMessage}</p>}

              {errorMessage && <p className="text-xs font-medium text-rose-500">{errorMessage}</p>}

              <Button
                type="button"
                variant="outline"
                disabled={regenerating}
                onClick={handleRegenerateInvite}
                className="h-10 w-full gap-2 text-xs"
              >
                {regenerating ? (
                  <>
                    <Spinner className="size-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <ArrowsClockwiseIcon className="size-4" />
                    Regenerate invite link
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
