import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { TabSkeleton } from '../components/ui/Skeleton';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import * as storage from '../utils/storage';
import { VendorsTab } from '../features/vendors/VendorsTab';
import { GuestTable } from '../features/guests/GuestTable';

describe('Efficiency, Memoization & Debounced Storage Persistence', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('TabSkeleton Component & Suspense Loading', () => {
    it('renders with role="status", aria-busy="true", and screen-reader announcement', () => {
      render(<TabSkeleton />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveAttribute('aria-busy', 'true');
      expect(statusRegion).toHaveAttribute('aria-label', 'Loading workspace module...');
      expect(screen.getByText('Loading workspace module...')).toBeInTheDocument();
    });
  });

  describe('Debounced LocalStorage State Persistence', () => {
    it('debounces rapid state updates to prevent synchronous I/O thrashing', () => {
      vi.useFakeTimers();
      const saveSpy = vi.spyOn(storage, 'savePersistedState');

      const RapidUpdateComponent: React.FC = () => {
        const { updateEvent } = useWorkspace();
        return (
          <button
            data-testid="rapid-btn"
            onClick={() => {
              updateEvent({ name: 'Update 1' });
              updateEvent({ name: 'Update 2' });
              updateEvent({ name: 'Final Name' });
            }}
          >
            Trigger Updates
          </button>
        );
      };

      render(
        <WorkspaceProvider>
          <RapidUpdateComponent />
        </WorkspaceProvider>
      );

      // Initial mount debounce
      act(() => {
        vi.advanceTimersByTime(350);
      });
      const initialCalls = saveSpy.mock.calls.length;

      // Trigger 3 rapid updates synchronously
      const btn = screen.getByTestId('rapid-btn');
      fireEvent.click(btn);

      // Before timer expires, no new save calls should have fired
      expect(saveSpy.mock.calls.length).toBe(initialCalls);

      // Advance by 300ms
      act(() => {
        vi.advanceTimersByTime(350);
      });

      // Exactly 1 batched persist call should occur for the settled state
      expect(saveSpy.mock.calls.length).toBe(initialCalls + 1);

      vi.useRealTimers();
    });
  });

  describe('Calculation & Filter Memoization', () => {
    it('renders VendorsTab with memoized category filtering', () => {
      render(
        <WorkspaceProvider>
          <VendorsTab />
        </WorkspaceProvider>
      );

      expect(screen.getByRole('heading', { level: 2, name: /Vendor CRM/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Kanban Pipeline/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Side-by-Side Table/i })).toBeInTheDocument();
    });

    it('renders GuestTable with memoized search query filtering', () => {
      const mockGuests = [
        {
          id: 'g-1',
          name: 'Ananya Roy',
          group: 'vip' as const,
          rsvp: 'confirmed' as const,
          plusOnes: 1,
          dietary: 'vegetarian' as const,
        },
        {
          id: 'g-2',
          name: 'Kabir Mehta',
          group: 'general' as const,
          rsvp: 'pending' as const,
          plusOnes: 0,
          dietary: 'regular' as const,
        },
      ];

      render(
        <GuestTable
          guests={mockGuests}
          zones={[]}
          onUpdateGuest={vi.fn()}
          onDeleteGuest={vi.fn()}
        />
      );

      expect(screen.getByText('Ananya Roy')).toBeInTheDocument();
      expect(screen.getByText('Kabir Mehta')).toBeInTheDocument();

      // Search filtering
      const searchInput = screen.getByPlaceholderText('Search attendees...');
      fireEvent.change(searchInput, { target: { value: 'Ananya' } });

      expect(screen.getByText('Ananya Roy')).toBeInTheDocument();
      expect(screen.queryByText('Kabir Mehta')).not.toBeInTheDocument();
    });
  });
});
