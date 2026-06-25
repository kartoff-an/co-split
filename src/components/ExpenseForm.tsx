import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import type { Expense, Member } from '../types';
import { PlusIcon } from '@heroicons/react/24/outline';
import { getCurrencySymbol } from '../lib/currency';

interface ExpenseFormProps {
  members: Member[];
  onAddExpense: (
    expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>
  ) => Promise<void>;
  activeUserId?: string | null;
  currency?: string;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  members,
  onAddExpense,
  activeUserId,
  currency = 'PHP',
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnequalSplit, setIsUnequalSplit] = useState(false);
  const [excludedSplitMembers, setExcludedSplitMembers] = useState<string[]>(
    []
  );
  const [isBubbleOpen, setIsBubbleOpen] = useState(false);

  const bubbleRef = useRef<HTMLDivElement>(null);

  const symbol = getCurrencySymbol(currency);

  const selectedSplitMembers = members
    .map((member) => member.id)
    .filter((memberId) => !excludedSplitMembers.includes(memberId));

  useEffect(() => {
    if (activeUserId && members.some((member) => member.id === activeUserId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaidBy(activeUserId);
    } else if (members.length > 0 && !paidBy) {
      setPaidBy('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUserId, members]);

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

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (
      !description.trim() ||
      isNaN(parsedAmount) ||
      parsedAmount <= 0 ||
      !paidBy
    )
      return;

    setIsLoading(true);
    try {
      await onAddExpense({
        description: description.trim(),
        amount: parsedAmount,
        category: 'Other',
        paid_by: paidBy,
        split_members: isUnequalSplit ? selectedSplitMembers : null,
      });
      setDescription('');
      setAmount('');
      setIsUnequalSplit(false);
      setExcludedSplitMembers([]);
      setIsBubbleOpen(false);

      if (!activeUserId) {
        setPaidBy('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs transition-shadow duration-300 hover:shadow-md"
    >
      <div className="mb-3.5 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <PlusIcon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-slate-800">
          Add Expense
        </h3>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="mb-1 block text-[10px] font-bold text-slate-400">
            Description
          </label>
          <input
            type="text"
            placeholder="Cloud server hosting, sticker printing..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="focus:ring-primary-green/20 focus:border-primary-green w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 placeholder-slate-400 outline-hidden transition-all focus:bg-white focus:ring-2"
            disabled={isLoading}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="mb-1 block text-[10px] font-bold text-slate-400">
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
                onChange={(event) => setAmount(event.target.value)}
                className="focus:ring-primary-green/20 focus:border-primary-green w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-7 text-xs font-semibold text-slate-700 placeholder-slate-400 outline-hidden transition-all focus:bg-white focus:ring-2"
                disabled={isLoading}
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold text-slate-400">
              Payer
            </label>
            <select
              value={paidBy}
              onChange={(event) => setPaidBy(event.target.value)}
              className="focus:ring-primary-green/20 focus:border-primary-green w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs font-medium text-slate-700 outline-hidden transition-all focus:bg-white focus:ring-2"
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

        <div className="mt-1.5 flex items-center justify-end gap-1.5">
          <input
            type="checkbox"
            id="unequal-split"
            checked={isUnequalSplit}
            onChange={(event) => {
              setIsUnequalSplit(event.target.checked);
              if (!event.target.checked) {
                setExcludedSplitMembers([]);
              }
            }}
            className="border-slate-350 text-emerald-650 h-3.5 w-3.5 cursor-pointer rounded focus:ring-emerald-500"
            disabled={isLoading}
          />
          <label
            htmlFor="unequal-split"
            className="cursor-pointer text-[10px] font-bold text-slate-400 select-none"
          >
            Split unequally
          </label>
        </div>

        {isUnequalSplit && (
          <div className="relative mt-2" ref={bubbleRef}>
            <label className="mb-1 block text-[10px] font-bold text-slate-400">
              Split Members
            </label>
            <button
              type="button"
              onClick={() => setIsBubbleOpen((previousState) => !previousState)}
              className="focus:ring-primary-green/20 focus:border-primary-green flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700 outline-hidden transition-all focus:bg-white focus:ring-2"
              disabled={isLoading}
            >
              <span>
                {selectedSplitMembers.length === members.length
                  ? 'All members'
                  : `${selectedSplitMembers.length} of ${members.length} selected`}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Configure…
              </span>
            </button>

            {isBubbleOpen && (
              <div className="border-slate-250 animate-scale-up absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border bg-white p-4 shadow-xl">
                <h4 className="mb-2 text-xs font-extrabold text-slate-700">
                  Include in Split:
                </h4>
                <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                  {members.map((member) => {
                    const isSelected = selectedSplitMembers.includes(member.id);
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
                          className="border-slate-350 text-emerald-650 h-3.5 w-3.5 rounded focus:ring-emerald-500"
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
                    className="cursor-pointer rounded-lg bg-emerald-600 px-3 py-1 text-[10px] font-bold text-white transition-all duration-200 hover:bg-emerald-700"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={
            isLoading ||
            members.length === 0 ||
            !description.trim() ||
            !amount ||
            !paidBy
          }
          className="bg-accent-coral hover:bg-accent-coral-hover mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
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
              <span>Adding...</span>
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              <span>Add Transaction</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
