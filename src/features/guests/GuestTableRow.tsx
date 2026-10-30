import React, { useState } from 'react';
import { Guest, RsvpStatus, GuestGroup, DietaryTag } from '../../types/guest';
import { Badge } from '../../components/ui/Badge';
import { Select, SelectOption } from '../../components/ui/Select';
import { Trash2, X } from 'lucide-react';

export const RSVP_OPTIONS: SelectOption[] = [
  { value: 'confirmed', label: 'Confirmed', dotColor: 'bg-emerald-500' },
  { value: 'pending', label: 'Pending', dotColor: 'bg-amber-500' },
  { value: 'declined', label: 'Declined', dotColor: 'bg-rose-500' },
];

export const DIETARY_OPTIONS: SelectOption[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'vegetarian', label: 'Vegetarian', dotColor: 'bg-emerald-500' },
  { value: 'jain', label: 'Jain', dotColor: 'bg-amber-500' },
  { value: 'vegan', label: 'Vegan', dotColor: 'bg-teal-500' },
  { value: 'gluten_free', label: 'Gluten-free', dotColor: 'bg-indigo-500' },
  { value: 'nut_free', label: 'Nut-free', dotColor: 'bg-rose-500' },
];

export const getGroupBadge = (group: GuestGroup): 'indigo' | 'amber' | 'stone' => {
  if (group === 'vip' || group === 'speaker_sponsor') return 'indigo';
  if (group === 'bride') return 'amber';
  return 'stone';
};

export const formatGroupName = (group: GuestGroup): string => {
  switch (group) {
    case 'bride': return 'Bride side';
    case 'groom': return 'Groom side';
    case 'vip': return 'VIP guest';
    case 'speaker_sponsor': return 'Speaker / sponsor';
    default: return 'General attendee';
  }
};

interface GuestTableRowProps {
  guest: Guest;
  zoneOptions: SelectOption[];
  onUpdateGuest: (id: string, partial: Partial<Guest>) => void;
  onDeleteGuest: (id: string) => void;
}

export const GuestTableRow: React.FC<GuestTableRowProps> = ({
  guest,
  zoneOptions,
  onUpdateGuest,
  onDeleteGuest,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <tr className="h-14 hover:bg-stone-50/50 dark:hover:bg-white/[0.02] transition-colors">
      <td className="py-2 px-4">
        <div className="font-medium text-foreground">{guest.name}</div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted mt-0.5">
          <span>Plus-ones:</span>
          <input
            type="number"
            min="0"
            max="10"
            value={guest.plusOnes}
            onChange={(e) => onUpdateGuest(guest.id, { plusOnes: Math.max(0, Number(e.target.value)) })}
            className="w-10 px-1 py-0.5 bg-surface-raised border border-hairline rounded text-xs tabular-nums text-foreground focus:outline-none"
            aria-label={`Plus-ones for ${guest.name}`}
          />
        </div>
      </td>

      <td className="py-2 px-3">
        <Badge variant={getGroupBadge(guest.group)} size="sm">
          {formatGroupName(guest.group)}
        </Badge>
      </td>

      <td className="py-2 px-3">
        <Select
          value={guest.rsvp}
          onChange={(val) => onUpdateGuest(guest.id, { rsvp: val as RsvpStatus })}
          options={RSVP_OPTIONS}
          variant="compact"
          ariaLabel={`RSVP status for ${guest.name}`}
        />
      </td>

      <td className="py-2 px-3">
        <Select
          value={guest.dietary}
          onChange={(val) => onUpdateGuest(guest.id, { dietary: val as DietaryTag })}
          options={DIETARY_OPTIONS}
          variant="compact"
          ariaLabel={`Dietary preference for ${guest.name}`}
        />
      </td>

      <td className="py-2 px-3 min-w-[220px]">
        <Select
          value={guest.tableOrZoneId || ''}
          onChange={(val) => onUpdateGuest(guest.id, { tableOrZoneId: val || undefined })}
          options={zoneOptions}
          variant="ghost"
          ariaLabel={`Zone assignment for ${guest.name}`}
          className="w-full max-w-[260px]"
        />
      </td>

      <td className="py-2 px-4 text-right">
        {confirmDelete ? (
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => {
                onDeleteGuest(guest.id);
                setConfirmDelete(false);
              }}
              className="px-2 py-1 text-xs bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-md font-medium transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="p-1 text-muted hover:text-foreground rounded-md transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 text-muted hover:text-rose-500 rounded-md transition-colors"
            title="Remove guest"
            aria-label={`Remove ${guest.name}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
};

