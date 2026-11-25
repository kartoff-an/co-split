import { useMemo, useState } from 'react';

import { FunnelSimpleIcon, XIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { ExpenseFilters, WorkspaceMember } from '@/api/types';

type AdvancedFilters = Pick<
  ExpenseFilters,
  'category' | 'paid_by' | 'from_date' | 'to_date' | 'min_amount' | 'max_amount'
>;

interface ExpenseFiltersPopoverProps {
  filters: ExpenseFilters;
  categories: string[];
  members: WorkspaceMember[];
  onApply: (filters: AdvancedFilters) => void;
}

const getAdvancedFilters = (filters: ExpenseFilters): AdvancedFilters => ({
  category: filters.category,
  paid_by: filters.paid_by,
  from_date: filters.from_date,
  to_date: filters.to_date,
  min_amount: filters.min_amount,
  max_amount: filters.max_amount,
});

export function ExpenseFiltersPopover({ filters, categories, members, onApply }: ExpenseFiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdvancedFilters>(() => getAdvancedFilters(filters));

  const selectedMember = members.find((member) => member.id === draft.paid_by);

  const activeFilterCount = useMemo(
    () =>
      [
        filters.category,
        filters.paid_by,
        filters.from_date,
        filters.to_date,
        filters.min_amount !== undefined,
        filters.max_amount !== undefined,
      ].filter(Boolean).length,
    [filters]
  );

  const updateDraft = <K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(getAdvancedFilters(filters));
    }

    setOpen(nextOpen);
  };

  const handleApply = () => {
    const min = draft.min_amount;
    const max = draft.max_amount;

    if (
      (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
      (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
      (min !== undefined && max !== undefined && min > max)
    ) {
      return;
    }

    onApply(draft);
    setOpen(false);
  };

  const handleClear = () => {
    const cleared: AdvancedFilters = {};

    setDraft(cleared);
    onApply(cleared);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger render={<Button type="button" variant="outline" className="h-9 gap-2 text-xs" />}>
        <FunnelSimpleIcon size={15} />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFilterCount}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Transaction filters</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">Narrow down your transactions.</p>
          </div>

          {activeFilterCount > 0 && (
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={handleClear}>
              <XIcon size={13} />
              Clear
            </Button>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Category</label>

          <Select value={draft.category ?? ''} onValueChange={(value) => updateDraft('category', value || undefined)}>
            <SelectTrigger className="h-9 w-full text-xs">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>

            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payer */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Paid by</label>

          <Select value={draft.paid_by ?? ''} onValueChange={(value) => updateDraft('paid_by', value || undefined)}>
            <SelectTrigger className="h-9 w-full text-xs">
              <span className="truncate">{selectedMember?.display_name || 'All members'}</span>
            </SelectTrigger>

            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.display_name || 'Unnamed member'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date range */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Date range</label>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px]">From</label>

              <Input
                type="date"
                value={draft.from_date?.slice(0, 10) ?? ''}
                onChange={(event) => {
                  const value = event.target.value;

                  updateDraft('from_date', value ? `${value}T00:00:00` : undefined);
                }}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px]">To</label>

              <Input
                type="date"
                value={draft.to_date?.slice(0, 10) ?? ''}
                onChange={(event) => {
                  const value = event.target.value;

                  updateDraft('to_date', value ? `${value}T23:59:59.999999` : undefined);
                }}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Amount range */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Amount range</label>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px]">Minimum</label>

              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={draft.min_amount?.toString() ?? ''}
                onChange={(event) => {
                  const value = event.target.value;

                  updateDraft('min_amount', value === '' ? undefined : Number(value));
                }}
                className="h-9 text-xs tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px]">Maximum</label>

              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={draft.max_amount?.toString() ?? ''}
                onChange={(event) => {
                  const value = event.target.value;

                  updateDraft('max_amount', value === '' ? undefined : Number(value));
                }}
                className="h-9 text-xs tabular-nums"
              />
            </div>
          </div>

          {draft.min_amount !== undefined && draft.max_amount !== undefined && draft.min_amount > draft.max_amount && (
            <p className="text-destructive text-xs">Minimum amount cannot exceed maximum amount.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-3">
          <Button type="button" variant="outline" size="sm" className="h-9 text-xs" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            className="h-9 text-xs"
            onClick={handleApply}
            disabled={
              (draft.min_amount !== undefined &&
                draft.max_amount !== undefined &&
                draft.min_amount > draft.max_amount) ||
              (draft.min_amount !== undefined && draft.min_amount < 0) ||
              (draft.max_amount !== undefined && draft.max_amount < 0)
            }
          >
            Apply filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
