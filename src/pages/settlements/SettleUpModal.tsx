import React, { useMemo, useState } from 'react';

import type { Settlement, Member } from '@/types';
import { getCurrencySymbol, formatCurrency } from '@/lib/currency';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { ArrowRightIcon, BankIcon, CheckCircleIcon } from '@phosphor-icons/react';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlements: Settlement[];
  members: Member[];
  activeUserId?: string | null;
  currency?: string;
  onConfirmSettlement: (paidBy: string, paidTo: string, amount: number) => Promise<void>;
}

export function SettleUpModal({
  isOpen,
  onClose,
  settlements,
  members,
  activeUserId,
  currency = 'PHP',
  onConfirmSettlement,
}: SettleUpModalProps) {
  const [selectedIndex, setSelectedIndex] = useState('0');
  const [amount, setAmount] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const symbol = getCurrencySymbol(currency);

  const currentMember = useMemo(() => members.find((member) => member.id === activeUserId), [members, activeUserId]);

  const availableSettlements = useMemo(() => {
    if (!activeUserId) return settlements;

    return settlements.filter(
      (settlement) =>
        settlement.from_id === activeUserId ||
        settlement.to_id === activeUserId ||
        settlement.from === currentMember?.display_name ||
        settlement.to === currentMember?.display_name
    );
  }, [settlements, activeUserId, currentMember]);

  const selectedSettlement = availableSettlements[Number(selectedIndex)] ?? null;
  const paymentAmount = amount ?? selectedSettlement?.amount.toString() ?? '';

  const debtorMember = selectedSettlement
    ? members.find(
        (member) => member.id === selectedSettlement.from_id || member.display_name === selectedSettlement.from
      )
    : null;

  const creditorMember = selectedSettlement
    ? members.find((member) => member.id === selectedSettlement.to_id || member.display_name === selectedSettlement.to)
    : null;

  const payerId = debtorMember?.id || selectedSettlement?.from_id || '';
  const payeeId = creditorMember?.id || selectedSettlement?.to_id || '';

  const handleSelectSettlement = (value: string) => {
    setSelectedIndex(value);

    const settlement = availableSettlements[Number(value)];

    if (settlement) {
      setAmount(settlement.amount.toString());
    }

    setError(null);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!selectedSettlement) {
      setError('Please select a debt to settle.');
      return;
    }

    const parsedAmount = Number.parseFloat(paymentAmount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid payment amount greater than zero.');
      return;
    }

    if (!payerId || !payeeId || payerId === payeeId) {
      setError('Unable to identify the settlement participants.');
      return;
    }

    try {
      setIsSubmitting(true);

      await onConfirmSettlement(payerId, payeeId, parsedAmount);

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record settlement payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentUserDebtor = (settlement: Settlement) =>
    settlement.from_id === activeUserId || settlement.from === currentMember?.display_name;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="border-border bg-card flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-lg flex-col overflow-x-hidden overflow-y-auto rounded-xl p-4 sm:p-6">
        <DialogHeader className="min-w-0 text-left">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BankIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold">Settle up</DialogTitle>

              <DialogDescription className="text-xs">Record a payment for an outstanding debt.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="min-w-0 space-y-5">
          {error && (
            <div
              role="alert"
              className="border-destructive/20 bg-destructive/5 text-destructive min-w-0 rounded-lg border px-3 py-2.5 text-sm wrap-break-word"
            >
              {error}
            </div>
          )}

          {availableSettlements.length === 0 ? (
            <div className="border-border bg-muted/30 rounded-lg border px-4 py-8 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircleIcon className="h-5 w-5" />
              </div>

              <p className="text-sm font-semibold">No outstanding debts</p>

              <p className="text-muted-foreground mt-1 text-xs">There are no unsettled balances involving you.</p>
            </div>
          ) : (
            <>
              <div className="min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm font-medium">Select a debt</label>

                  <span className="text-muted-foreground shrink-0 text-xs">
                    {availableSettlements.length} outstanding
                  </span>
                </div>

                <RadioGroup
                  value={selectedIndex}
                  onValueChange={handleSelectSettlement}
                  className="max-h-60 min-w-0 space-y-2 overflow-x-hidden overflow-y-auto"
                >
                  {availableSettlements.map((settlement, index) => {
                    const isSelected = selectedIndex === String(index);
                    const isDebtor = isCurrentUserDebtor(settlement);

                    return (
                      <label
                        key={`${settlement.from_id}-${settlement.to_id}-${index}`}
                        className={`flex min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border p-3 transition-colors ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20'
                            : 'border-border bg-background hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <RadioGroupItem value={String(index)} disabled={isSubmitting} className="shrink-0" />

                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 items-center gap-1.5 text-sm font-medium">
                              <span className="min-w-0 flex-1 truncate">{settlement.from}</span>

                              <ArrowRightIcon className="text-muted-foreground h-3.5 w-3.5 shrink-0" />

                              <span className="min-w-0 flex-1 truncate">{settlement.to}</span>
                            </div>

                            <p className="text-muted-foreground mt-1 text-xs">
                              {isDebtor ? 'You owe' : 'You are owed'}
                            </p>
                          </div>
                        </div>

                        <span className="max-w-[40%] shrink-0 truncate text-right text-sm font-semibold tabular-nums">
                          {formatCurrency(settlement.amount, currency)}
                        </span>
                      </label>
                    );
                  })}
                </RadioGroup>
              </div>

              {selectedSettlement && (
                <div className="min-w-0 space-y-2">
                  <label htmlFor="settlement-amount" className="text-sm font-medium">
                    Payment amount
                  </label>

                  <div className="relative min-w-0">
                    <span className="text-muted-foreground absolute inset-y-0 left-3 flex items-center text-sm">
                      {symbol}
                    </span>

                    <Input
                      id="settlement-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="0.00"
                      className="min-w-0 pl-8"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <p className="text-muted-foreground text-xs wrap-break-word">
                    Outstanding balance: {formatCurrency(selectedSettlement.amount, currency)}
                  </p>
                </div>
              )}
            </>
          )}

          <div className="border-border flex min-w-0 flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting || availableSettlements.length === 0}
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
            >
              {isSubmitting ? 'Recording payment...' : 'Record payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
