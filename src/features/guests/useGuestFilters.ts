import { useState, useMemo, useDeferredValue } from 'react';
import { Guest } from '../../types/guest';

export interface UseGuestFiltersResult {
  search: string;
  setSearch: (val: string) => void;
  rsvpFilter: string;
  setRsvpFilter: (val: string) => void;
  filteredGuests: Guest[];
}

export function useGuestFilters(guests: Guest[]): UseGuestFiltersResult {
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('all');
  const deferredSearch = useDeferredValue(search);

  const filteredGuests = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return guests.filter((g) => {
      const matchesSearch = !query || g.name.toLowerCase().includes(query);
      const matchesRsvp = rsvpFilter === 'all' || g.rsvp === rsvpFilter;
      return matchesSearch && matchesRsvp;
    });
  }, [guests, deferredSearch, rsvpFilter]);

  return {
    search,
    setSearch,
    rsvpFilter,
    setRsvpFilter,
    filteredGuests,
  };
}
