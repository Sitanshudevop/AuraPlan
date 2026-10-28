import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GuestsTab } from '../features/guests/GuestsTab';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';

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
});
