import React, { useMemo, useState, useEffect } from 'react';
import { Guest, ZoneCapacity } from '../../types/guest';
import { SelectOption } from '../../components/ui/Select';
import { Search, ChevronDown } from 'lucide-react';
import { useGuestFilters } from './useGuestFilters';
import { GuestTableRow } from './GuestTableRow';

interface GuestTableProps {
  guests: Guest[];
  zones: ZoneCapacity[];
  onUpdateGuest: (id: string, partial: Partial<Guest>) => void;
  onDeleteGuest: (id: string) => void;
}

const PAGE_SIZE = 50;

export const GuestTable: React.FC<GuestTableProps> = ({
  guests,
  zones,
  onUpdateGuest,
  onDeleteGuest,
}) => {
  const { search, setSearch, rsvpFilter, setRsvpFilter, filteredGuests } = useGuestFilters(guests);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when search or status filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, rsvpFilter]);

  const zoneOptions: SelectOption[] = useMemo(() => [
    { value: '', label: 'Unassigned' },
    ...zones.map((z) => ({ value: z.id, label: z.name })),
  ], [zones]);

  const displayedGuests = useMemo(() => {
    return filteredGuests.slice(0, visibleCount);
  }, [filteredGuests, visibleCount]);

  const hasMore = filteredGuests.length > visibleCount;

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
            {displayedGuests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-xs text-muted">
                  No guests matching this filter.
                </td>
              </tr>
            ) : (
              displayedGuests.map((guest) => (
                <GuestTableRow
                  key={guest.id}
                  guest={guest}
                  zoneOptions={zoneOptions}
                  onUpdateGuest={onUpdateGuest}
                  onDeleteGuest={onDeleteGuest}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Progressive Loading Footer */}
      {hasMore && (
        <div className="p-3 border-t border-hairline bg-surface-raised flex items-center justify-between text-xs text-muted">
          <span aria-live="polite">
            Showing {displayedGuests.length} of {filteredGuests.length} attendees
          </span>
          <button
            onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-surface text-foreground hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors font-medium text-xs"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Show more attendees</span>
          </button>
        </div>
      )}
    </div>
  );
};
