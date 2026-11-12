import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';

import type { Expense, Member } from '@/types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { PlusIcon, UsersIcon, CaretDownIcon } from '@phosphor-icons/react';

import { getCurrencySymbol } from '@/lib/currency';

interface ExpenseFormProps {
  members: Member[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'timestamp' | 'workspace_id'>) => Promise<void>;
  activeUserId?: string | null;
  currency?: string;
  className?: string;
}

export function ExpenseForm({
  members,
  onAddExpense,
  activeUserId,
  currency = 'PHP',
  className = '',
}: ExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnequalSplit, setIsUnequalSplit] = useState(false);
  const [excludedSplitMembers, setExcludedSplitMembers] = useState<string[]>([]);
  const [isSplitOpen, setIsSplitOpen] = useState(false);

  const symbol = getCurrencySymbol(currency);

  // Base UI Select collection
  const payerItems = useMemo(
    () =>
      members.map((member) => ({
        value: member.id,
        label: `${member.display_name || 'Member'}${member.id === activeUserId ? ' (You)' : ''}`,
      })),
    [members, activeUserId]
  );

  const selectedSplitMembers = useMemo(
    () => members.map((member) => member.id).filter((memberId) => !excludedSplitMembers.includes(memberId)),
    [members, excludedSplitMembers]
  );

  // Default payer
  useEffect(() => {
    if (activeUserId && members.some((member) => member.id === activeUserId)) {
      setPaidBy(activeUserId);
    }
  }, [activeUserId, members]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);

    if (
      !description.trim() ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !paidBy ||
      (isUnequalSplit && selectedSplitMembers.length === 0)
    ) {
      return;
    }

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
      setIsSplitOpen(false);

      if (!activeUserId) {
        setPaidBy('');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSplitMember = (memberId: string, checked: boolean) => {
    setExcludedSplitMembers((current) => (checked ? current.filter((id) => id !== memberId) : [...current, memberId]));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="expense-description" className="text-xs font-medium">
          Description
        </label>

        <Input
          id="expense-description"
          placeholder="e.g. Groceries, Dinner, Electricity"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isLoading}
          required
          maxLength={100}
          className="h-10 text-sm"
        />
      </div>

      {/* Amount and payer */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="expense-amount" className="text-xs font-medium">
            Amount ({currency})
          </label>

          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm">
              {symbol}
            </span>

            <Input
              id="expense-amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={isLoading}
              required
              className="h-10 pl-8 text-sm tabular-nums"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Paid by</label>

          <Select
            items={payerItems}
            value={paidBy}
            onValueChange={(value) => setPaidBy(value ?? '')}
            disabled={isLoading || members.length === 0}
          >
            <SelectTrigger className="h-10 w-full text-sm">
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

      {/* Unequal split */}
      <div className="border-border space-y-3 rounded-lg border p-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id="unequal-split"
            checked={isUnequalSplit}
            onCheckedChange={(checked) => {
              const enabled = checked === true;

              setIsUnequalSplit(enabled);

              if (!enabled) {
                setExcludedSplitMembers([]);
                setIsSplitOpen(false);
              }
            }}
            disabled={isLoading}
            className="mt-0.5"
          />

          <div className="min-w-0 flex-1 space-y-0.5">
            <label htmlFor="unequal-split" className="cursor-pointer text-xs font-medium">
              Customize split members
            </label>

            <p className="text-muted-foreground text-[11px]">
              Choose who should share this expense. By default, everyone is included.
            </p>
          </div>
        </div>

        {isUnequalSplit && (
          <Popover open={isSplitOpen} onOpenChange={setIsSplitOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  className="h-9 w-full justify-between text-xs font-normal"
                />
              }
            >
              <span className="flex items-center gap-2">
                <UsersIcon size={15} className="text-muted-foreground" />

                {selectedSplitMembers.length === members.length
                  ? 'All members selected'
                  : `${selectedSplitMembers.length} of ${members.length} selected`}
              </span>

              <CaretDownIcon size={14} className="text-muted-foreground" />
            </PopoverTrigger>

            <PopoverContent align="start" className="w-[var(--anchor-width)] p-3">
              <div className="mb-3">
                <p className="text-xs font-semibold">Split with</p>

                <p className="text-muted-foreground mt-0.5 text-[11px]">Select the members included in this expense.</p>
              </div>

              <div className="max-h-48 space-y-3 overflow-y-auto">
                {members.map((member) => {
                  const isSelected = selectedSplitMembers.includes(member.id);

                  return (
                    <div key={member.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`split-${member.id}`}
                        checked={isSelected}
                        disabled={isLoading || (isSelected && selectedSplitMembers.length === 1)}
                        onCheckedChange={(checked) => toggleSplitMember(member.id, checked === true)}
                      />

                      <label htmlFor={`split-${member.id}`} className="flex-1 cursor-pointer text-xs">
                        {member.display_name || 'Member'}
                        {member.id === activeUserId ? ' (You)' : ''}
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="border-border mt-3 border-t pt-3">
                <Button type="button" size="sm" className="h-8 w-full text-xs" onClick={() => setIsSplitOpen(false)}>
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={
          isLoading ||
          members.length === 0 ||
          !description.trim() ||
          !amount ||
          Number(amount) <= 0 ||
          !paidBy ||
          (isUnequalSplit && selectedSplitMembers.length === 0)
        }
        className="h-10 w-full gap-2 text-xs font-semibold"
      >
        <PlusIcon size={16} weight="bold" />
        {isLoading ? 'Adding expense...' : 'Add expense'}
      </Button>
    </form>
  );
}
