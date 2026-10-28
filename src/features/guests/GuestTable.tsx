import React, { useState, useMemo } from 'react';
import { Guest, RsvpStatus, GuestGroup, DietaryTag, ZoneCapacity } from '../../types/guest';
import { Badge } from '../../components/ui/Badge';
import { Trash2, Search } from 'lucide-react';

interface GuestTableProps {
  guests: Guest[];
  zones: ZoneCapacity[];
  onUpdateGuest: (id: string, partial: Partial<Guest>) => void;
  onDeleteGuest: (id: string) => void;
}

export const GuestTable: React.FC<GuestTableProps> = ({
  guests,
  zones,
  onUpdateGuest,
  onDeleteGuest,
}) => {
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return guests.filter((g) => {
      const matchesSearch = !query || g.name.toLowerCase().includes(query);
      const matchesRsvp = rsvpFilter === 'all' || g.rsvp === rsvpFilter;
      return matchesSearch && matchesRsvp;
    });
  }, [guests, search, rsvpFilter]);

  const getGroupVariant = (group: GuestGroup) => {
    if (group === 'vip' || group === 'speaker_sponsor') return 'indigo';
    if (group === 'bride') return 'amber';
    if (group === 'groom') return 'stone';
    return 'stone';
  };

  return (
    <div className="bg-white dark:bg-[#121215] border border-stone-200 dark:border-zinc-800 rounded-xl overflow-hidden space-y-2">
      {/* Search & Filter Bar */}
      <div className="p-3 border-b border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendees..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md focus:outline-none dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'confirmed', 'pending', 'declined'].map((status) => (
            <button
              key={status}
              onClick={() => setRsvpFilter(status)}
              className={`text-[11px] px-2.5 py-1 rounded font-medium uppercase tracking-wider ${
                rsvpFilter === status
                  ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                  : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-stone-200'
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
          <thead className="bg-stone-50 dark:bg-zinc-900/60 border-b border-stone-200 dark:border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
            <tr>
              <th className="py-2.5 px-3">Guest Name</th>
              <th className="py-2.5 px-3">Group / Affiliation</th>
              <th className="py-2.5 px-3">RSVP Status</th>
              <th className="py-2.5 px-3">Dietary Tag</th>
              <th className="py-2.5 px-3">Zone / Table Assignment</th>
              <th className="py-2.5 px-3 text-right">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-stone-600 dark:text-zinc-400">
                  No attendees matching this filter.
                </td>
              </tr>
            ) : (
              filtered.map((guest) => (
              <tr key={guest.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-900/30">
                <td className="py-3 px-3">
                  <div className="font-semibold text-stone-900 dark:text-white">
                    {guest.name}
                  </div>
                  {guest.plusOnes > 0 && (
                    <div className="text-[10px] text-stone-600 dark:text-zinc-400 font-mono tabular-nums">
                      +{guest.plusOnes} guest cover
                    </div>
                  )}
                </td>

                <td className="py-3 px-3">
                  <Badge variant={getGroupVariant(guest.group)} size="sm">
                    {guest.group.replace('_', ' ').toUpperCase()}
                  </Badge>
                </td>

                <td className="py-3 px-3">
                  <select
                    value={guest.rsvp}
                    onChange={(e) => onUpdateGuest(guest.id, { rsvp: e.target.value as RsvpStatus })}
                    className="text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded px-2 py-0.5"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="declined">Declined</option>
                  </select>
                </td>

                <td className="py-3 px-3">
                  <select
                    value={guest.dietary}
                    onChange={(e) => onUpdateGuest(guest.id, { dietary: e.target.value as DietaryTag })}
                    className="text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded px-2 py-0.5"
                  >
                    <option value="regular">Regular</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="jain">Jain</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten_free">Gluten-Free</option>
                    <option value="nut_free">Nut-Free</option>
                  </select>
                </td>

                <td className="py-3 px-3">
                  <select
                    value={guest.tableOrZoneId || ''}
                    onChange={(e) => onUpdateGuest(guest.id, { tableOrZoneId: e.target.value || undefined })}
                    className="text-xs bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded px-2 py-0.5 max-w-[180px] truncate"
                  >
                    <option value="">-- Unassigned --</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => onDeleteGuest(guest.id)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Remove guest from roster"
                    aria-label={`Remove ${guest.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
