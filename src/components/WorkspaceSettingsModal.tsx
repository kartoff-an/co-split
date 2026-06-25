import type React from 'react';
import { useState, useEffect } from 'react';
import type { Member, Workspace } from '../types';
import { XMarkIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { Spinner } from './Spinner';
import { SUPPORTED_CURRENCIES } from '../lib/currency';

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

export const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({
  isOpen,
  onClose,
  workspace,
  members,
  onUpdateWorkspace,
  onRemoveMember,
  onDeleteWorkspace,
  currentUserId,
}) => {
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [allowedMembers, setAllowedMembers] = useState(
    workspace.allowed_members ?? 10
  );
  const [currency, setCurrency] = useState(workspace.currency ?? 'PHP');
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWorkspaceName(workspace.name);
      setAllowedMembers(workspace.allowed_members ?? 10);
      setCurrency(workspace.currency ?? 'PHP');
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, workspace]);

  if (!isOpen) return null;

  const currentMemberCount = members.length;
  const isLimitInvalid = allowedMembers < currentMemberCount;

  const handleSave = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLimitInvalid) {
      setErrorMessage(
        `Allowed members limit cannot be less than the current member count (${currentMemberCount}).`
      );
      return;
    }
    if (!workspaceName.trim()) {
      setErrorMessage('Workspace name cannot be empty.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const updated = await onUpdateWorkspace({
      name: workspaceName.trim(),
      allowed_members: allowedMembers,
      currency,
    });

    setSaving(false);
    if (updated) {
      setSuccessMessage('Workspace settings saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage('Failed to save settings. Please try again.');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === workspace.owner_id) return; // Prevent removing owner

    if (
      !window.confirm(
        'Are you sure you want to remove this member? This will delete them from the workspace.'
      )
    ) {
      return;
    }

    setRemovingId(userId);
    setErrorMessage(null);
    setSuccessMessage(null);

    const success = await onRemoveMember(userId);
    setRemovingId(null);

    if (success) {
      setSuccessMessage('Member removed successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage('Failed to remove member. Please try again.');
    }
  };

  const handleDelete = async () => {
    const confirm1 = window.confirm(
      'Are you sure you want to delete this workspace? This will delete all its expenses and members permanently and cannot be undone.'
    );
    if (!confirm1) return;

    const workspaceNameInput = window.prompt(
      `To confirm deletion, type the workspace name: "${workspace.name}"`
    );
    if (workspaceNameInput !== workspace.name) {
      alert("Workspace name didn't match. Deletion cancelled.");
      return;
    }

    setSaving(true);
    const success = await onDeleteWorkspace();
    setSaving(false);
    if (success) {
      onClose();
    } else {
      setErrorMessage('Failed to delete workspace. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="animate-scale-up relative w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-slate-800">
              Workspace Settings
            </h3>
            <p className="text-[10px] font-medium text-slate-400">
              Configure ledger controls and manage members
            </p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:divide-x md:divide-slate-100">
          {/* Form settings */}
          <form onSubmit={handleSave} className="space-y-4 md:pr-6">
            <h4 className="text-xs font-bold text-slate-500">
              Ledger Settings
            </h4>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-400">
                Workspace Name
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="focus:ring-primary-green/15 focus:border-primary-green text-slate-755 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold outline-hidden transition-all focus:bg-white focus:ring-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-400">
                Workspace Currency
              </label>
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="focus:ring-primary-green/15 focus:border-primary-green text-slate-755 w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-semibold outline-hidden transition-all focus:bg-white focus:ring-2"
                required
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-400">
                Max Allowed Members
              </label>
              <div className="space-y-1.5">
                <input
                  type="number"
                  min={1}
                  value={allowedMembers}
                  onChange={(event) =>
                    setAllowedMembers(parseInt(event.target.value) || 1)
                  }
                  className={`focus:ring-primary-green/15 focus:border-primary-green text-slate-755 w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-hidden transition-all focus:bg-white focus:ring-2 ${
                    isLimitInvalid
                      ? 'border-rose-300 bg-rose-50/50 ring-rose-100'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                  required
                />
                {isLimitInvalid && (
                  <p className="text-[9px] font-bold text-rose-500">
                    Cannot be less than current member count (
                    {currentMemberCount}).
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || isLimitInvalid}
              className="bg-primary-green hover:bg-primary-green-hover flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-all duration-200 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving ? (
                <Spinner className="h-4 w-4 animate-spin text-white" />
              ) : (
                'Save Changes'
              )}
            </button>

            {currentUserId === workspace.owner_id && (
              <div className="mt-6 border-t border-rose-100 pt-4">
                <h5 className="text-xs font-bold text-rose-600">Danger Zone</h5>
                <p className="mt-1 text-[10px] leading-snug text-slate-400">
                  Deleting this workspace will permanently erase all ledger
                  data, expenses, and memberships.
                </p>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={saving}
                  className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-200 hover:bg-rose-700 disabled:pointer-events-none disabled:opacity-50"
                >
                  Delete Workspace
                </button>
              </div>
            )}
          </form>

          {/* Manage members list */}
          <div className="space-y-4 md:pl-6">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500">
                Manage Members
              </h4>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">
                {currentMemberCount} / {allowedMembers}
              </span>
            </div>

            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {members.map((member) => {
                const isMemberOwner = member.id === workspace.owner_id;
                const isCurrentUser = member.id === currentUserId;

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl border border-slate-50 bg-slate-50/30 p-2 transition-all hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.display_name}
                          className="h-6 w-6 rounded-full border border-slate-200"
                        />
                      ) : (
                        <div className="bg-primary-green-light text-primary-green flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold">
                          {member.display_name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs leading-tight font-semibold text-slate-700">
                          {member.display_name} {isCurrentUser ? '(You)' : ''}
                        </p>
                        {isMemberOwner && (
                          <span className="mt-0.5 inline-block rounded-md border border-emerald-100 bg-emerald-50 px-1 py-0.5 text-[8px] leading-none font-bold text-emerald-600">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>

                    {!isMemberOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={removingId === member.id}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none"
                        title="Remove member from workspace"
                      >
                        {removingId === member.id ? (
                          <Spinner className="h-3.5 w-3.5 animate-spin text-rose-600" />
                        ) : (
                          <UserMinusIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
