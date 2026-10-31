import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryRow } from '../features/budget/CategoryRow';
import { NewEventModal } from '../components/modals/NewEventModal';
import { Header } from '../components/layout/Header';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';

describe('Component Interactions: Category Row & New Event Modal', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  describe('CategoryRow Interactive Component', () => {
    it('handles lock and unlock toggle button interaction', () => {
      const onUpdate = vi.fn();
      const item = {
        id: 'bi-test-1',
        category: 'venue' as const,
        name: 'Grand Ballroom',
        allocated: 500000,
        vendorQuote: 520000,
        actualContracted: 510000,
        amountPaid: 200000,
        isLocked: false,
      };

      const { rerender } = render(
        <table>
          <tbody>
            <CategoryRow item={item} totalBudget={1000000} currency="INR" onUpdate={onUpdate} />
          </tbody>
        </table>
      );

      const lockBtn = screen.getByRole('button', { name: /Lock category/i });
      fireEvent.click(lockBtn);
      expect(onUpdate).toHaveBeenCalledWith({ isLocked: true });

      rerender(
        <table>
          <tbody>
            <CategoryRow item={{ ...item, isLocked: true }} totalBudget={1000000} currency="INR" onUpdate={onUpdate} />
          </tbody>
        </table>
      );
      expect(screen.getByRole('button', { name: /Unlock category/i })).toBeInTheDocument();
    });

    it('displays over-budget warning banner when contracted commitments exceed allocation', () => {
      const item = {
        id: 'bi-over',
        category: 'decor' as const,
        name: 'Mandap Florals',
        allocated: 100000,
        vendorQuote: 150000,
        actualContracted: 140000,
        amountPaid: 50000,
        isLocked: false,
      };

      render(
        <table>
          <tbody>
            <CategoryRow item={item} totalBudget={1000000} currency="INR" onUpdate={vi.fn()} />
          </tbody>
        </table>
      );

      expect(screen.getByTitle('Actual cost exceeds allocation')).toBeInTheDocument();
    });
  });

  describe('NewEventModal Form Validation', () => {
    it('displays inline validation errors when required fields are missing on submit', () => {
      render(
        <WorkspaceProvider>
          <Header />
          <NewEventModal />
        </WorkspaceProvider>
      );

      const newEventBtn = screen.getByRole('button', { name: /New Event/i });
      fireEvent.click(newEventBtn);

      const submitBtn = screen.getByRole('button', { name: /Generate Complete Plan/i });
      fireEvent.submit(submitBtn.closest('form')!);

      expect(screen.getByText('Event Name and City are required.')).toBeInTheDocument();
    });
  });
});

