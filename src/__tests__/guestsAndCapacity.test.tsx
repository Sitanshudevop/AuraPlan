import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GuestsTab } from '../features/guests/GuestsTab';
import { GuestTable } from '../features/guests/GuestTable';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';
import { Guest, ZoneCapacity } from '../types/guest';

describe('GuestsTab, Dietary Matrix & Zone Capacity', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  it('renders GuestsTab header, dietary summary bar, and zone meters', () => {
    render(
      <WorkspaceProvider>
        <GuestsTab />
      </WorkspaceProvider>
    );

    expect(screen.getByText(/Guest RSVP, Dietary Matrix & Capacity Planner/i)).toBeInTheDocument();
    expect(screen.getByText(/Automatic Catering Sync: Live Dietary Breakdown/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Zone & Table Capacity Matrix/i)).toBeInTheDocument();
  });

  it('filters guests using search input and RSVP category filter pills', () => {
    render(
      <WorkspaceProvider>
        <GuestsTab />
      </WorkspaceProvider>
    );

    const searchInput = screen.getByPlaceholderText(/Search attendees/i);
    expect(searchInput).toBeInTheDocument();

    // Type query to filter
    fireEvent.change(searchInput, { target: { value: 'Siddharth' } });

    // Click 'confirmed' filter pill
    const confirmedPill = screen.getByRole('button', { name: /^confirmed$/i });
    fireEvent.click(confirmedPill);
  });

  it('opens Add Guest modal and adds a new guest to the roster', () => {
    render(
      <WorkspaceProvider>
        <GuestsTab />
      </WorkspaceProvider>
    );

    const addBtn = screen.getByRole('button', { name: /Add Guest/i });
    fireEvent.click(addBtn);

    expect(screen.getByText(/Add Attendee to Guest Roster/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'Aarav Singhania' } });

    const submitBtn = screen.getByRole('button', { name: /Save Guest/i });
    act(() => {
      fireEvent.click(submitBtn);
    });

    expect(screen.queryByText(/Add Attendee to Guest Roster/i)).not.toBeInTheDocument();
    expect(screen.getByText('Aarav Singhania')).toBeInTheDocument();
  });

  it('progressively displays large guest rosters (>50) with pagination controls', () => {
    const mockGuests: Guest[] = Array.from({ length: 65 }, (_, i) => ({
      id: `g-${i + 1}`,
      name: `Guest Number ${i + 1}`,
      group: 'general',
      rsvp: 'confirmed',
      plusOnes: 0,
      dietary: 'regular',
    }));

    const mockZones: ZoneCapacity[] = [
      { id: 'z-1', name: 'Main Ballroom', maxCapacity: 100, assignedCount: 65, type: 'zone' },
    ];

    render(
      <GuestTable
        guests={mockGuests}
        zones={mockZones}
        onUpdateGuest={() => {}}
        onDeleteGuest={() => {}}
      />
    );

    // Initial window should show first 50 guests
    expect(screen.getByText('Guest Number 1')).toBeInTheDocument();
    expect(screen.getByText('Guest Number 50')).toBeInTheDocument();
    expect(screen.queryByText('Guest Number 51')).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 50 of 65 attendees/i)).toBeInTheDocument();

    // Click show more
    const showMoreBtn = screen.getByRole('button', { name: /Show more attendees/i });
    fireEvent.click(showMoreBtn);

    // After click, guest 51 and 65 should be visible
    expect(screen.getByText('Guest Number 51')).toBeInTheDocument();
    expect(screen.getByText('Guest Number 65')).toBeInTheDocument();
  });

  it('handles 1,000+ guest rosters with deferred filtering and accessible rowcount semantics', () => {
    const largeRoster: Guest[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `roster-${i + 1}`,
      name: `Attendee ${i + 1}`,
      group: i % 10 === 0 ? 'vip' : 'general',
      rsvp: i % 2 === 0 ? 'confirmed' : 'pending',
      plusOnes: 1,
      dietary: 'vegetarian',
    }));

    const mockZones: ZoneCapacity[] = [
      { id: 'z-hall', name: 'Grand Hall', maxCapacity: 1200, assignedCount: 1000, type: 'zone' },
    ];

    const { container } = render(
      <GuestTable
        guests={largeRoster}
        zones={mockZones}
        onUpdateGuest={() => {}}
        onDeleteGuest={() => {}}
      />
    );

    const table = container.querySelector('table');
    expect(table).toHaveAttribute('aria-rowcount', '1000');

    const firstRow = container.querySelector('tbody tr');
    expect(firstRow).toHaveAttribute('aria-rowindex', '1');
  });
});
