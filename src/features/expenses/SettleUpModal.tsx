import type React from 'react';
import { useState, useEffect } from 'react';
import type { Settlement, Member } from '../../types';
import { XMarkIcon, ArrowRightIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { getCurrencySymbol, formatCurrency } from '../../lib/currency';
import { Spinner } from '../../components/Spinner';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: Settlement | null;
  members: Member[];
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
  settlement,
  members,
  currency = 'PHP',
  onConfirmSettlement,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [payerId, setPayerId] = useState<string>('');
  const [payeeId, setPayeeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settlement) {
      setAmount(settlement.amount.toString());

      const debtor = members.find(
        (m) => m.id === settlement.from_id || m.display_name === settlement.from
      );
      setPayerId(debtor?.id || members[0]?.id || '');

      const creditor = members.find(
        (m) => m.id === settlement.to_id || m.display_name === settlement.to
      );
      setPayeeId(creditor?.id || members[1]?.id || '');
      setError(null);
    }
  }, [settlement, members]);

  if (!isOpen || !settlement) return null;

  const symbol = getCurrencySymbol(currency);
  const payerMember = members.find((m) => m.id === payerId);
  const payeeMember = members.find((m) => m.id === payeeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-surface text-text-primary shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-subtle/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 [data-theme='dark']_&:text-emerald-400">
              <BanknotesIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Settle Up</h2>
              <p className="text-xs text-text-muted">Record a debt repayment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-surface-subtle hover:text-text-primary"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-6 mt-5 flex items-center justify-between rounded-xl border border-border-subtle bg-surface-subtle p-4">
          <div className="flex flex-col items-center gap-1">
            {payerMember?.avatar_url ? (
              <img
                src={payerMember.avatar_url}
                alt=""
                className="h-10 w-10 rounded-full border border-border-subtle object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 font-bold text-rose-600 [data-theme='dark']_&:text-rose-400">
                {(payerMember?.display_name || settlement.from)[0]?.toUpperCase()}
              </div>
            )}
            <span className="max-w-[100px] truncate text-xs font-bold text-text-primary">
              {payerMember?.display_name || settlement.from}
            </span>
            <span className="text-[10px] font-semibold text-rose-600 [data-theme='dark']_&:text-rose-400">Payer</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-extrabold text-emerald-600 [data-theme='dark']_&:text-emerald-400">
              <ArrowRightIcon className="h-3.5 w-3.5" />
              <span>{formatCurrency(parseFloat(amount) || settlement.amount, currency)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            {payeeMember?.avatar_url ? (
              <img
                src={payeeMember.avatar_url}
                alt=""
                className="h-10 w-10 rounded-full border border-border-subtle object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/15 font-bold text-emerald-600 [data-theme='dark']_&:text-emerald-400">
                {(payeeMember?.display_name || settlement.to)[0]?.toUpperCase()}
              </div>
            )}
            <span className="max-w-[100px] truncate text-xs font-bold text-text-primary">
              {payeeMember?.display_name || settlement.to}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 [data-theme='dark']_&:text-emerald-400">
              Receiver
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600 [data-theme='dark']_&:border-rose-900/50 [data-theme='dark']_&:bg-rose-950/40 [data-theme='dark']_&:text-rose-300">
              {error}
            </div>
          )}

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
              disabled={isSubmitting}
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
