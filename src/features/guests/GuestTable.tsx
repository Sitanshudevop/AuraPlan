import React, { useState, useMemo } from 'react';
import { Guest, RsvpStatus, GuestGroup, DietaryTag, ZoneCapacity } from '../../types/guest';
import { Badge } from '../../components/ui/Badge';
import { Select, SelectOption } from '../../components/ui/Select';
import { Trash2, Search, X } from 'lucide-react';

interface GuestTableProps {
  guests: Guest[];
  zones: ZoneCapacity[];
  onUpdateGuest: (id: string, partial: Partial<Guest>) => void;
  onDeleteGuest: (id: string) => void;
}

const rsvpOptions: SelectOption[] = [
  { value: 'confirmed', label: 'Confirmed', dotColor: 'bg-emerald-500' },
  { value: 'pending', label: 'Pending', dotColor: 'bg-amber-500' },
  { value: 'declined', label: 'Declined', dotColor: 'bg-rose-500' },
];

const dietaryOptions: SelectOption[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'vegetarian', label: 'Vegetarian', dotColor: 'bg-emerald-500' },
  { value: 'jain', label: 'Jain', dotColor: 'bg-amber-500' },
  { value: 'vegan', label: 'Vegan', dotColor: 'bg-teal-500' },
  { value: 'gluten_free', label: 'Gluten-free', dotColor: 'bg-indigo-500' },
  { value: 'nut_free', label: 'Nut-free', dotColor: 'bg-rose-500' },
];

const getGroupBadge = (group: GuestGroup) => {
  if (group === 'vip' || group === 'speaker_sponsor') return 'indigo';
  if (group === 'bride') return 'amber';
  return 'stone';
};

const formatGroupName = (group: GuestGroup): string => {
  switch (group) {
    case 'bride': return 'Bride side';
    case 'groom': return 'Groom side';
    case 'vip': return 'VIP guest';
    case 'speaker_sponsor': return 'Speaker / sponsor';
    default: return 'General attendee';
  }
};

export const GuestTable: React.FC<GuestTableProps> = ({
  guests,
  zones,
  onUpdateGuest,
  onDeleteGuest,
}) => {
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const zoneOptions: SelectOption[] = useMemo(() => [
    { value: '', label: 'Unassigned' },
    ...zones.map((z) => ({ value: z.id, label: z.name })),
  ], [zones]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return guests.filter((g) => {
      const matchesSearch = !query || g.name.toLowerCase().includes(query);
      const matchesRsvp = rsvpFilter === 'all' || g.rsvp === rsvpFilter;
      return matchesSearch && matchesRsvp;
    });
  }, [guests, search, rsvpFilter]);

  return (
    <div className="bg-surface border border-hairline rounded-xl overflow-hidden">
      {/* Search & Filter Toolbar */}
      <div className="p-3 sm:px-4 border-b border-hairline flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendees..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-surface-raised border border-hairline rounded-md text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {['all', 'confirmed', 'pending', 'declined'].map((status) => (
            <button
              key={status}
              onClick={() => setRsvpFilter(status)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors capitalize ${
                rsvpFilter === status
                  ? 'bg-foreground text-background'
                  : 'text-muted hover:text-foreground hover:bg-stone-100 dark:hover:bg-white/[0.04]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-surface-raised border-b border-hairline text-xs font-medium text-muted sticky top-0">
            <tr>
              <th className="py-2.5 px-4 font-medium">Guest name</th>
              <th className="py-2.5 px-3 font-medium">Group</th>
              <th className="py-2.5 px-3 font-medium">RSVP status</th>
              <th className="py-2.5 px-3 font-medium">Dietary tag</th>
              <th className="py-2.5 px-3 font-medium min-w-[220px]">Zone / table assignment</th>
              <th className="py-2.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-muted">
                  No guests matching this filter.
                </td>
              </tr>
            ) : (
              filtered.map((guest) => (
                <tr key={guest.id} className="h-14 hover:bg-stone-50/50 dark:hover:bg-white/[0.02] transition-colors">
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
                      options={rsvpOptions}
                      variant="compact"
                      ariaLabel={`RSVP status for ${guest.name}`}
                    />
                  </td>

                  <td className="py-2 px-3">
                    <Select
                      value={guest.dietary}
                      onChange={(val) => onUpdateGuest(guest.id, { dietary: val as DietaryTag })}
                      options={dietaryOptions}
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
                    {confirmDeleteId === guest.id ? (
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteGuest(guest.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 text-xs bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-md font-medium transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="p-1 text-muted hover:text-foreground rounded-md transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(guest.id)}
                        className="p-1.5 text-muted hover:text-rose-500 rounded-md transition-colors"
                        title="Remove guest"
                        aria-label={`Remove ${guest.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
