import React, { useEffect, useMemo, useState } from 'react';

import type { Expense, Member } from '@/types';
import { getCurrencySymbol } from '@/lib/currency';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { PencilSimpleIcon, UsersThreeIcon } from '@phosphor-icons/react';

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

export function EditExpenseModal({
  isOpen,
  onClose,
  expense,
  members,
  activeUserId,
  currency = 'PHP',
  onSave,
}: EditExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnequalSplit, setIsUnequalSplit] = useState(false);
  const [excludedSplitMembers, setExcludedSplitMembers] = useState<string[]>([]);
  const [isSplitPopoverOpen, setIsSplitPopoverOpen] = useState(false);

  const symbol = getCurrencySymbol(currency);

  useEffect(() => {
    if (!isOpen || !expense) return;

    setDescription(expense.description);
    setAmount(String(expense.amount));
    setPaidBy(expense.paid_by);
    setIsLoading(false);
    setError(null);
    setIsSplitPopoverOpen(false);

    const hasCustomSplit = !!expense.split_members && expense.split_members.length > 0;

    setIsUnequalSplit(hasCustomSplit);

    setExcludedSplitMembers(
      hasCustomSplit ? members.map((member) => member.id).filter((id) => !expense.split_members?.includes(id)) : []
    );
  }, [isOpen, expense, members]);

  const selectedSplitMembers = useMemo(
    () => members.map((member) => member.id).filter((memberId) => !excludedSplitMembers.includes(memberId)),
    [members, excludedSplitMembers]
  );

  const payerItems = useMemo(
    () =>
      members.map((member) => ({
        value: member.id,
        label: `${member.display_name || 'Member'}${member.id === activeUserId ? ' (You)' : ''}`,
      })),
    [members, activeUserId]
  );

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expense) return;

    const parsedAmount = Number.parseFloat(amount);

    if (!description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || !paidBy) {
      setError('Please complete all required fields with valid values.');
      return;
    }

    if (isUnequalSplit && selectedSplitMembers.length === 0) {
      setError('Select at least one member to split this expense with.');
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

  const handleSplitMemberChange = (memberId: string, checked: boolean) => {
    setExcludedSplitMembers((current) => (checked ? current.filter((id) => id !== memberId) : [...current, memberId]));
  };

  return (
    <Dialog
      open={isOpen && !!expense}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogContent className="border-border bg-card max-h-[90vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl p-5 sm:p-6">
        <DialogHeader className="text-left">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PencilSimpleIcon className="h-4 w-4" />
            </div>

            <div>
              <DialogTitle className="text-base font-semibold">Edit expense</DialogTitle>
              <DialogDescription className="text-xs">Update the transaction details.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="border-destructive/20 bg-destructive/5 text-destructive rounded-lg border px-3 py-2.5 text-sm"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="edit-expense-description" className="text-sm font-medium">
              Description
            </label>

            <Input
              id="edit-expense-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Expense description"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="edit-expense-amount" className="text-sm font-medium">
                Amount ({currency})
              </label>

              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm">
                  {symbol}
                </span>

                <Input
                  id="edit-expense-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  className="pl-8"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Paid by</label>

              <Select
                items={payerItems}
                value={paidBy}
                onValueChange={(value) => setPaidBy(value ?? '')}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payer" />
                </SelectTrigger>

                <SelectContent>
                  {payerItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-border rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="edit-expense-unequal-split"
                  checked={isUnequalSplit}
                  onCheckedChange={(checked) => {
                    setIsUnequalSplit(checked === true);

                    if (checked !== true) {
                      setExcludedSplitMembers([]);
                      setIsSplitPopoverOpen(false);
                    }
                  }}
                  disabled={isLoading}
                />

                <label htmlFor="edit-expense-unequal-split" className="cursor-pointer text-sm font-medium">
                  Split unequally
                </label>
              </div>

              <span className="text-muted-foreground text-xs">{isUnequalSplit ? 'Custom members' : 'Everyone'}</span>
            </div>

            {isUnequalSplit && (
              <div className="mt-3 space-y-2">
                <label className="text-muted-foreground text-xs font-medium">Members included in this split</label>

                <Popover open={isSplitPopoverOpen} onOpenChange={setIsSplitPopoverOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between font-normal"
                        disabled={isLoading}
                      />
                    }
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <UsersThreeIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {selectedSplitMembers.length === members.length
                          ? 'All members'
                          : `${selectedSplitMembers.length} of ${members.length} selected`}
                      </span>
                    </span>
                    <span className="text-muted-foreground text-xs">Configure</span>
                  </PopoverTrigger>

                  <PopoverContent align="end" className="w-[var(--anchor-width)] min-w-64 p-3">
                    <div className="mb-2">
                      <p className="text-sm font-medium">Include in split</p>
                      <p className="text-muted-foreground text-xs">Select at least one member.</p>
                    </div>

                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {members.map((member) => {
                        const checked = selectedSplitMembers.includes(member.id);

                        return (
                          <label
                            key={member.id}
                            className="hover:bg-muted flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) => handleSplitMemberChange(member.id, value === true)}
                              disabled={isLoading || (checked && selectedSplitMembers.length === 1)}
                            />

                            <span className="min-w-0 flex-1 truncate">{member.display_name || 'Member'}</span>

                            {member.id === activeUserId && <span className="text-muted-foreground text-xs">You</span>}
                          </label>
                        );
                      })}
                    </div>

                    <div className="border-border mt-3 flex justify-end border-t pt-3">
                      <Button type="button" size="sm" onClick={() => setIsSplitPopoverOpen(false)}>
                        Done
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading} className="bg-emerald-600 text-white hover:bg-emerald-700">
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
