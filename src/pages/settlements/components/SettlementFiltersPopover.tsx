import { useMemo, useState } from 'react';

import { FunnelSimpleIcon, XIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { SettlementQueryParams, WorkspaceMember } from '@/api/types';

type AdvancedFilters = Pick<SettlementQueryParams, 'status' | 'from_user_id' | 'to_user_id'>;

interface SettlementFiltersPopoverProps {
  filters: SettlementQueryParams;
  members: WorkspaceMember[];
  onApply: (filters: AdvancedFilters) => void;
}

const getAdvancedFilters = (filters: SettlementQueryParams): AdvancedFilters => ({
  status: filters.status,
  from_user_id: filters.from_user_id,
  to_user_id: filters.to_user_id,
});

export function SettlementFiltersPopover({ filters, members, onApply }: SettlementFiltersPopoverProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdvancedFilters>(() => getAdvancedFilters(filters));

  const activeFilterCount = useMemo(
    () => [filters.status, filters.from_user_id, filters.to_user_id].filter(Boolean).length,
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
      <PopoverTrigger>
        <Button type="button" variant="outline" className="h-9 gap-2 text-xs">
          <FunnelSimpleIcon size={15} />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Settlement filters</h3>
            <p className="text-muted-foreground mt-0.5 text-xs">Narrow down your recorded settlements.</p>
          </div>

          {activeFilterCount > 0 && (
            <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={handleClear}>
              <XIcon size={13} />
              Clear
            </Button>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Status</label>

          <Select
            value={draft.status ?? ''}
            onValueChange={(value) => updateDraft('status', value ? (value as AdvancedFilters['status']) : undefined)}
          >
            <SelectTrigger className="h-9 w-full text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* From member */}
        <div className="space-y-2">
          <label className="text-xs font-medium">From</label>

          <Select
            value={draft.from_user_id ?? ''}
            onValueChange={(value) => updateDraft('from_user_id', value || undefined)}
          >
            <SelectTrigger className="h-9 w-full text-xs">
              <SelectValue placeholder="All members" />
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

        {/* To member */}
        <div className="space-y-2">
          <label className="text-xs font-medium">To</label>

          <Select
            value={draft.to_user_id ?? ''}
            onValueChange={(value) => updateDraft('to_user_id', value || undefined)}
          >
            <SelectTrigger className="h-9 w-full text-xs">
              <SelectValue placeholder="All members" />
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

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t pt-3">
          <Button type="button" variant="outline" size="sm" className="h-9 text-xs" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button type="button" size="sm" className="h-9 text-xs" onClick={handleApply}>
            Apply filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
