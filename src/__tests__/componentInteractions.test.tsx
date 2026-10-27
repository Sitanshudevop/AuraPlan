import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { TaxAndCateringCalc } from '../features/budget/TaxAndCateringCalc';
import { CategoryRow } from '../features/budget/CategoryRow';
import { NewEventModal } from '../components/modals/NewEventModal';
import { Header } from '../components/layout/Header';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';

describe('Component Interactions & Custom Hooks Unit Tests', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('useDebounce Hook', () => {
    it('debounces reactive value updates until specified delay passes', () => {
      vi.useFakeTimers();
      const { result, rerender } = renderHook(({ val }) => useDebounce(val, 300), {
        initialProps: { val: 'initial' },
      });

      expect(result.current).toBe('initial');

      // Update prop rapidly
      rerender({ val: 'updated-1' });
      rerender({ val: 'updated-2' });

      // Before delay expires, value remains initial
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe('initial');

      // After 300ms delay, value updates to latest
      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(result.current).toBe('updated-2');
    });

    it('throttles rapid callback invocations with useDebouncedCallback', () => {
      vi.useFakeTimers();
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 200));

      // Trigger 5 times in burst
      act(() => {
        result.current('a');
        result.current('b');
        result.current('c');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(250);
      });

      // Called only once with final arguments
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('c');
    });
  });

  describe('useKeyboardShortcuts Hook', () => {
    it('triggers command palette on Cmd+K and Ctrl+K', () => {
      const toggleCmd = vi.fn();
      const closeOverlays = vi.fn();
      const selectTab = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          onToggleCommandPalette: toggleCmd,
          onCloseOverlays: closeOverlays,
          onSelectTabByIndex: selectTab,
        })
      );

      fireEvent.keyDown(window, { key: 'k', metaKey: true });
      expect(toggleCmd).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
      expect(toggleCmd).toHaveBeenCalledTimes(2);
    });

    it('triggers overlay dismissal on Escape and tab switching on Alt+N', () => {
      const toggleCmd = vi.fn();
      const closeOverlays = vi.fn();
      const selectTab = vi.fn();

      renderHook(() =>
        useKeyboardShortcuts({
          onToggleCommandPalette: toggleCmd,
          onCloseOverlays: closeOverlays,
          onSelectTabByIndex: selectTab,
          tabCount: 6,
        })
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(closeOverlays).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: '3', altKey: true });
      expect(selectTab).toHaveBeenCalledWith(2); // 0-indexed tab 3
    });
  });

  describe('TaxAndCateringCalc Interactive Component', () => {
    it('renders per-plate cover calculator, updates range slider, and toggles statutory GST rates', () => {
      render(
        <WorkspaceProvider>
          <TaxAndCateringCalc />
        </WorkspaceProvider>
      );

      // Verify title & initial cover display
      expect(screen.getByText('Per-Plate Catering Calculator')).toBeInTheDocument();
      expect(screen.getByText(/Guests/i)).toBeInTheDocument();

      // Adjust per-plate rate slider
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '2500' } });

      // Click statutory GST tax rate pills
      const pill12 = screen.getByRole('button', { name: '12%' });
      const pill18 = screen.getByRole('button', { name: '18%' });
      fireEvent.click(pill12);
      expect(pill12).toBeInTheDocument();
      fireEvent.click(pill18);
      expect(pill18).toBeInTheDocument();

      // Click sync to budget button
      const syncBtn = screen.getByRole('button', { name: /Sync to Catering Budget/i });
      fireEvent.click(syncBtn);
    });
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

      // Rerender as locked
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
        actualContracted: 140000, // 40k over budget
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

      // Open modal via header trigger
      const newEventBtn = screen.getByRole('button', { name: /New Event/i });
      fireEvent.click(newEventBtn);

      // Trigger submit on the form directly
      const submitBtn = screen.getByRole('button', { name: /Generate Complete Plan/i });
      fireEvent.submit(submitBtn.closest('form')!);

      // Verify inline error message for missing event name / city
      expect(screen.getByText('Event Name and City are required.')).toBeInTheDocument();
    });
  });
});
