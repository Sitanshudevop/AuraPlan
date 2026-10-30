import { useState, useMemo } from 'react';
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

  const filteredGuests = useMemo(() => {
    const query = search.toLowerCase();
    return guests.filter((g) => {
      const matchesSearch = !query || g.name.toLowerCase().includes(query);
      const matchesRsvp = rsvpFilter === 'all' || g.rsvp === rsvpFilter;
      return matchesSearch && matchesRsvp;
    });
  }, [guests, search, rsvpFilter]);

  return {
    search,
    setSearch,
    rsvpFilter,
    setRsvpFilter,
    filteredGuests,
  };
}

