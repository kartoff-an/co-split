import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import type { Settlement, Member } from '../../types';
import { XMarkIcon, ArrowRightIcon, BanknotesIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getCurrencySymbol, formatCurrency } from '../../lib/currency';
import { Spinner } from '../../components/Spinner';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlements: Settlement[];
  members: Member[];
  activeUserId?: string | null;
  currency?: string;
  onConfirmSettlement: (
    paidBy: string,
    paidTo: string,
    amount: number
  ) => Promise<void>;
}

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  settlements,
  members,
  activeUserId,
  currency = 'PHP',
  onConfirmSettlement,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only settlements where the active user is the debtor (the one who owes money)
  const payableDebts = useMemo(() => {
    if (!activeUserId) return settlements;
    const currentMember = members.find((m) => m.id === activeUserId);
    return settlements.filter(
      (s) =>
        s.from_id === activeUserId ||
        s.from === currentMember?.display_name
    );
  }, [settlements, activeUserId, members]);

  const selectedSettlement = payableDebts[selectedIndex] || null;

  useEffect(() => {
    if (isOpen && payableDebts.length > 0) {
      setSelectedIndex(0);
      setAmount(payableDebts[0].amount.toString());
      setError(null);
    }
  }, [isOpen, payableDebts]);

  const handleSelectSettlement = (index: number) => {
    setSelectedIndex(index);
    if (payableDebts[index]) {
      setAmount(payableDebts[index].amount.toString());
    }
    setError(null);
  };

  if (!isOpen) return null;

  const symbol = getCurrencySymbol(currency);

  const creditorMember = selectedSettlement
    ? members.find(
        (m) =>
          m.id === selectedSettlement.to_id ||
          m.display_name === selectedSettlement.to
      )
    : null;

  const payerId = activeUserId || selectedSettlement?.from_id || '';
  const payeeId = creditorMember?.id || selectedSettlement?.to_id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedSettlement) {
      setError('Please select a debt to settle.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (!payerId || !payeeId) {
      setError('Invalid settlement parties.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirmSettlement(payerId, payeeId, parsedAmount);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to record settlement payment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border-subtle bg-surface text-text-primary shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 [data-theme='dark']_&:text-emerald-400">
              <BanknotesIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Settle Up</h2>
              <p className="text-xs text-text-muted">Pay an outstanding debt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-surface-subtle hover:text-text-primary"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 [data-theme='dark']_&:border-rose-900/50 [data-theme='dark']_&:bg-rose-950/40 [data-theme='dark']_&:text-rose-300">
              {error}
            </div>
          )}

          {payableDebts.length === 0 ? (
            <div className="py-8 text-center text-text-muted">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <CheckIcon className="h-5 w-5" />
              </div>
              <p className="text-xs font-bold text-text-primary">No debts to settle!</p>
              <p className="mt-1 text-[11px] text-text-muted">You do not owe any money in this workspace.</p>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-xs font-bold text-text-muted">
                Select Debt to Pay:
              </label>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {payableDebts.map((settlement, idx) => {
                  const isSelected = selectedIndex === idx;

                  return (
                    <label
                      key={idx}
                      onClick={() => handleSelectSettlement(idx)}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'border-border-subtle bg-surface-subtle/50 hover:bg-surface-subtle'
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <input
                          type="radio"
                          name="settlement-option"
                          checked={isSelected}
                          onChange={() => handleSelectSettlement(idx)}
                          className="h-4 w-4 shrink-0 cursor-pointer text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-text-primary">
                          <span className="truncate max-w-[90px] sm:max-w-[120px]">
                            {settlement.from} (You)
                          </span>
                          <ArrowRightIcon className="h-3 w-3 shrink-0 text-text-muted" />
                          <span className="truncate max-w-[90px] sm:max-w-[120px]">
                            {settlement.to}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 [data-theme='dark']_&:text-rose-400">
                          You owe
                        </span>
                        <span className="text-xs font-extrabold text-text-primary">
                          {formatCurrency(settlement.amount, currency)}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSettlement && (
            <div>
              <label className="mb-1.5 block text-xs font-bold text-text-primary">
                Payment Amount
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm font-bold text-text-muted">
                  {symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-border-subtle bg-surface-subtle py-2.5 pr-4 pl-8 text-sm font-bold text-text-primary focus:border-primary-green focus:bg-surface focus:ring-2 focus:ring-primary-green/20 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-xl border border-border-subtle bg-surface py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-subtle"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || payableDebts.length === 0}
              className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Spinner className="h-4 w-4 text-white" />
              ) : (
                'Record Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
