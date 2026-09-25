import type React from 'react';
import { useState, useMemo } from 'react';
import type { Settlement, Member } from '../../types';
import {
  XMarkIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
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
  // Either side of an outstanding debt can open and record its settlement.
  const availableSettlements = useMemo(() => {
    if (!activeUserId) return settlements;
    const currentMember = members.find((member) => member.id === activeUserId);
    return settlements.filter(
      (settlement) =>
        settlement.from_id === activeUserId ||
        settlement.to_id === activeUserId ||
        settlement.from === currentMember?.display_name ||
        settlement.to === currentMember?.display_name
    );
  }, [settlements, activeUserId, members]);

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [amount, setAmount] = useState<string>(
    availableSettlements[0]?.amount.toString() || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSettlement = availableSettlements[selectedIndex] || null;

  const handleSelectSettlement = (index: number) => {
    setSelectedIndex(index);
    if (availableSettlements[index]) {
      setAmount(availableSettlements[index].amount.toString());
    }
    setError(null);
  };

  if (!isOpen) return null;

  const symbol = getCurrencySymbol(currency);

  const debtorMember = selectedSettlement
    ? members.find(
        (member) =>
          member.id === selectedSettlement.from_id ||
          member.display_name === selectedSettlement.from
      )
    : null;

  const creditorMember = selectedSettlement
    ? members.find(
        (member) =>
          member.id === selectedSettlement.to_id ||
          member.display_name === selectedSettlement.to
      )
    : null;

  const payerId = debtorMember?.id || selectedSettlement?.from_id || '';
  const payeeId = creditorMember?.id || selectedSettlement?.to_id || '';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to record settlement payment.'
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

      <div className="border-border-subtle bg-surface text-text-primary relative w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl transition-all">
        <div className="border-border-subtle bg-surface-subtle/50 flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="[data-theme='dark']_&:text-emerald-400 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
              <BanknotesIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-text-primary text-base font-bold">
                Settle Up
              </h2>
              <p className="text-text-muted text-xs">Pay an outstanding debt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:bg-surface-subtle hover:text-text-primary flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="[data-theme='dark']_&:border-rose-900/50 [data-theme='dark']_&:bg-rose-950/40 [data-theme='dark']_&:text-rose-300 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          {availableSettlements.length === 0 ? (
            <div className="text-text-muted py-8 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <CheckIcon className="h-5 w-5" />
              </div>
              <p className="text-text-primary text-xs font-bold">
                No debts to settle!
              </p>
              <p className="text-text-muted mt-1 text-[11px]">
                There are no outstanding debts involving you.
              </p>
            </div>
          ) : (
            <div>
              <label className="text-text-muted mb-2 block text-xs">
                Select Debt to Settle:
              </label>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {availableSettlements.map((settlement, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isDebtor =
                    settlement.from_id === activeUserId ||
                    settlement.from ===
                      members.find((member) => member.id === activeUserId)
                        ?.display_name;

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
                        <div className="text-text-primary flex min-w-0 items-center gap-1.5 text-xs">
                          <span className="max-w-22.5 truncate sm:max-w-30">
                            {settlement.from}
                            {isDebtor ? ' (You)' : ''}
                          </span>
                          <ArrowRightIcon className="text-text-muted h-3 w-3 shrink-0" />
                          <span className="max-w-22.5 truncate sm:max-w-30">
                            {settlement.to}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="[data-theme='dark']_&:text-rose-400 rounded-md border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-[9px] text-rose-600">
                          {isDebtor ? 'You owe' : 'You are owed'}
                        </span>
                        <span className="text-text-primary text-xs font-extrabold">
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
              <label className="text-text-primary mb-1.5 block text-xs">
                Payment Amount
              </label>
              <div className="relative">
                <span className="text-text-muted absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                  {symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="border-border-subtle bg-surface-subtle text-text-primary focus:border-primary-green focus:bg-surface focus:ring-primary-green/20 w-full rounded-xl border py-2.5 pr-4 pl-8 text-sm focus:ring-2 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-border-subtle bg-surface text-text-secondary hover:bg-surface-subtle flex-1 cursor-pointer rounded-xl border py-2.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || availableSettlements.length === 0}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-700 disabled:opacity-50"
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
