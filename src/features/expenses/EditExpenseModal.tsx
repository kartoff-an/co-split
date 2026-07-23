import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { Expense, Member } from '../../types';
import { XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { getCurrencySymbol } from '../../lib/currency';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  members: Member[];
  activeUserId?: string | null;
  currency?: string;
  onSave: (
    expenseId: number | string,
    updates: Partial<Omit<Expense, 'id' | 'workspace_id' | 'timestamp'>>
  ) => Promise<unknown>;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  members,
  activeUserId,
  currency = 'PHP',
  onSave,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUnequalSplit, setIsUnequalSplit] = useState(false);
  const [excludedSplitMembers, setExcludedSplitMembers] = useState<string[]>([]);
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);

  const bubbleRef = useRef<HTMLDivElement>(null);
  const symbol = getCurrencySymbol(currency);

  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(String(expense.amount));
      setPaidBy(expense.paid_by);
      setError(null);

      if (expense.split_members && expense.split_members.length > 0) {
        setIsUnequalSplit(true);
        const excluded = members
          .map((m) => m.id)
          .filter((id) => !expense.split_members?.includes(id));
        setExcludedSplitMembers(excluded);
      } else {
        setIsUnequalSplit(false);
        setExcludedSplitMembers([]);
      }
    }
  }, [expense, members]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bubbleRef.current &&
        !bubbleRef.current.contains(event.target as Node)
      ) {
        setIsBubbleOpen(false);
      }
    };
    if (isBubbleOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBubbleOpen]);

  if (!isOpen || !expense) return null;
  if (expense.category === 'Payment' || expense.category === 'Settlement') return null;

  const selectedSplitMembers = members
    .map((member) => member.id)
    .filter((memberId) => !excludedSplitMembers.includes(memberId));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !paidBy) {
      setError('Please fill in all required fields with valid values.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSave(expense.id, {
        description: description.trim(),
        amount: parsedAmount,
        paid_by: paidBy,
        split_members: isUnequalSplit ? selectedSplitMembers : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="animate-scale-up relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <PencilSquareIcon className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Edit Expense</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-400">
              Description
            </label>
            <input
              type="text"
              placeholder="Expense description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 outline-hidden transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-400">
                Amount ({currency})
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-slate-400">
                  {symbol}
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-7 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-hidden transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  disabled={isLoading}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-400">
                Payer
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 outline-hidden transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                disabled={isLoading}
                required
              >
                <option value="">Who paid?</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.display_name}{' '}
                    {member.id === activeUserId ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <input
              type="checkbox"
              id="edit-unequal-split"
              checked={isUnequalSplit}
              onChange={(e) => {
                setIsUnequalSplit(e.target.checked);
                if (!e.target.checked) {
                  setExcludedSplitMembers([]);
                }
              }}
              className="h-3.5 w-3.5 cursor-pointer rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={isLoading}
            />
            <label
              htmlFor="edit-unequal-split"
              className="cursor-pointer text-xs font-bold text-slate-400 select-none"
            >
              Split unequally
            </label>
          </div>

          {isUnequalSplit && (
            <div className="relative mt-2" ref={bubbleRef}>
              <label className="mb-1 block text-xs font-bold text-slate-400">
                Split Members
              </label>
              <button
                type="button"
                onClick={() => setIsBubbleOpen((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 outline-hidden transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                disabled={isLoading}
              >
                <span>
                  {selectedSplitMembers.length === members.length
                    ? 'All members'
                    : `${selectedSplitMembers.length} of ${members.length} selected`}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  Configure…
                </span>
              </button>

              {isBubbleOpen && (
                <div className="animate-scale-up absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                  <h4 className="mb-2 text-xs font-extrabold text-slate-700">
                    Include in Split:
                  </h4>
                  <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                    {members.map((member) => {
                      const isSelected = selectedSplitMembers.includes(
                        member.id
                      );
                      return (
                        <label
                          key={member.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                if (selectedSplitMembers.length > 1) {
                                  setExcludedSplitMembers([
                                    ...excludedSplitMembers,
                                    member.id,
                                  ]);
                                }
                              } else {
                                setExcludedSplitMembers(
                                  excludedSplitMembers.filter(
                                    (memberId) => memberId !== member.id
                                  )
                                );
                              }
                            }}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>{member.display_name}</span>
                        </label>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsBubbleOpen(false)}
                      className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition-all hover:bg-emerald-700"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-1/2 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
