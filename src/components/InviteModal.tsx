import type React from 'react';
import { useState } from 'react';
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from './Spinner';

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
      <div className="animate-scale-up relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Invite Members</h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-400">
              Workspace ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={workspaceId}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 outline-hidden"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(workspaceId);
                  setCopiedId(true);
                  setTimeout(() => setCopiedId(false), 2000);
                }}
                className="flex cursor-pointer items-center justify-center rounded-xl p-2 text-slate-500 transition-all duration-150 hover:bg-slate-100 active:scale-95"
                title={copiedId ? 'Copied Workspace ID!' : 'Copy Workspace ID'}
              >
                {copiedId ? (
                  <CheckIcon className="h-4 w-4 stroke-[2.5] text-emerald-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-400">
              Invite Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteUrl}
                className="w-full truncate rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 outline-hidden"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="flex cursor-pointer items-center justify-center rounded-xl p-2 text-slate-500 transition-all duration-150 hover:bg-slate-100 active:scale-95"
                title={copiedUrl ? 'Copied link!' : 'Copy link to clipboard'}
              >
                {copiedUrl ? (
                  <CheckIcon className="h-4 w-4 stroke-[2.5] text-emerald-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-400">
              Share Message
            </label>
            <div className="relative">
              <textarea
                readOnly
                rows={4}
                value={inviteMessage}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 outline-hidden"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteMessage);
                  setCopiedMsg(true);
                  setTimeout(() => setCopiedMsg(false), 2000);
                }}
                className="absolute right-2.5 bottom-3 flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-slate-500 transition-all duration-150 hover:bg-slate-100 active:scale-95"
                title={copiedMsg ? 'Copied message!' : 'Copy message template'}
              >
                {copiedMsg ? (
                  <CheckIcon className="h-3.5 w-3.5 stroke-[2.5] text-emerald-600" />
                ) : (
                  <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {isOwner && onRegenerateInvite && (
            <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-left">
              <h5 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Invite Link Security
              </h5>
              <p className="text-[10px] leading-snug text-slate-400">
                If your invite link is leaked, you can regenerate the secret
                code. This will invalidate all previous invite links
                immediately.
              </p>
              {successMessage && (
                <p className="text-[10px] font-semibold text-emerald-600">
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
                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-50"
              >
                {regenerating ? (
                  <Spinner className="h-4 w-4 animate-spin text-slate-500" />
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
