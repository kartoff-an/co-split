import type React from 'react';
import { useState } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '../../components/Spinner';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  inviteCode?: string;
  isOwner?: boolean;
  onRegenerateInvite?: () => Promise<string | null>;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  inviteCode,
  isOwner = false,
  onRegenerateInvite,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const inviteUrl = inviteCode
    ? `${window.location.origin}/join/${inviteCode}`
    : `${window.location.origin}/dashboard`;
  const inviteMessage = `Hey! Join my workspace ledger "${workspaceName || 'Sheet'}" on Co-Split.\nLink: ${inviteUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="animate-scale-up border-border-subtle bg-surface text-text-primary relative w-full max-w-md rounded-2xl border p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-text-primary text-lg font-bold">
            Invite Members
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:bg-surface-subtle hover:text-text-primary cursor-pointer rounded-lg p-1"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-text-muted mb-1 block text-xs font-bold">
              Workspace ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={workspaceId}
                className="border-border-subtle bg-surface-subtle text-text-primary w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-hidden"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(workspaceId);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="text-text-muted hover:bg-surface-subtle hover:text-text-primary flex cursor-pointer items-center justify-center rounded-xl p-2 transition-all duration-150 active:scale-95"
                title={copiedId ? 'Copied Workspace ID!' : 'Copy Workspace ID'}
              >
                {copiedId ? (
                  <CheckIcon className="[data-theme='dark']_&:text-emerald-400 h-4 w-4 stroke-[2.5] text-emerald-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-text-muted mb-1 block text-xs font-bold">
              Invite Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="border-border-subtle bg-surface-subtle text-text-primary w-full truncate rounded-xl border px-3 py-2 text-xs font-semibold outline-hidden"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="text-text-muted hover:bg-surface-subtle hover:text-text-primary flex cursor-pointer items-center justify-center rounded-xl p-2 transition-all duration-150 active:scale-95"
                title={copiedUrl ? 'Copied link!' : 'Copy link to clipboard'}
              >
                {copiedUrl ? (
                  <CheckIcon className="[data-theme='dark']_&:text-emerald-400 h-4 w-4 stroke-[2.5] text-emerald-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-text-muted mb-1 block text-xs font-bold">
              Share Message
            </label>
            <div className="relative">
              <textarea
                readOnly
                rows={4}
                value={inviteMessage}
                className="border-border-subtle bg-surface-subtle text-text-primary w-full resize-none rounded-xl border px-3 py-2 text-xs font-medium outline-hidden"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteMessage);
                  setCopiedMsg(true);
                  setTimeout(() => setCopiedMsg(false), 2000);
                }}
                className="text-text-muted hover:bg-surface hover:text-text-primary absolute right-2.5 bottom-3 flex cursor-pointer items-center justify-center rounded-lg p-1.5 transition-all duration-150 active:scale-95"
                title={copiedMsg ? 'Copied message!' : 'Copy message template'}
              >
                {copiedMsg ? (
                  <CheckIcon className="[data-theme='dark']_&:text-emerald-400 h-3.5 w-3.5 stroke-[2.5] text-emerald-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {isOwner && onRegenerateInvite && (
            <div className="border-border-subtle mt-6 space-y-2 border-t pt-4 text-left">
              <h5 className="text-text-muted text-[10px] font-bold tracking-wider uppercase">
                Invite Link Security
              </h5>
              <p className="text-text-muted text-[10px] leading-snug">
                If your invite link is leaked, you can regenerate the secret
                code. This will invalidate all previous invite links
                immediately.
              </p>
              {successMessage && (
                <p className="[data-theme='dark']_&:text-emerald-400 text-[10px] font-semibold text-emerald-600">
                  {successMessage}
                </p>
              )}
              {errorMessage && (
                <p className="text-[10px] font-semibold text-rose-500">
                  {errorMessage}
                </p>
              )}
              <button
                type="button"
                onClick={async () => {
                  if (
                    window.confirm(
                      'Are you sure you want to regenerate the invite code? All old invite links will stop working.'
                    )
                  ) {
                    setRegenerating(true);
                    setSuccessMessage(null);
                    setErrorMessage(null);
                    const newCode = await onRegenerateInvite();
                    setRegenerating(false);
                    if (newCode) {
                      setSuccessMessage(
                        'Invite link regenerated successfully!'
                      );
                      setTimeout(() => setSuccessMessage(null), 3000);
                    } else {
                      setErrorMessage('Failed to regenerate invite link.');
                    }
                  }
                }}
                disabled={regenerating}
                className="border-border-subtle bg-surface-subtle text-text-secondary hover:bg-surface flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all disabled:pointer-events-none disabled:opacity-50"
              >
                {regenerating ? (
                  <Spinner className="text-text-muted h-4 w-4 animate-spin" />
                ) : (
                  'Regenerate Invite Link'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
