import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { TaxAndCateringCalc } from '../features/budget/TaxAndCateringCalc';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { clearPersistedState } from '../utils/storage';

describe('Component Interactions: Custom Hooks & Tax Calculator', () => {
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

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(result.current).toBe('updated-2');
    });

    it('throttles rapid callback invocations with useDebouncedCallback', () => {
      vi.useFakeTimers();
      const callback = vi.fn();
      const { result } = renderHook(() => useDebouncedCallback(callback, 200));

      act(() => {
        result.current('a');
        result.current('b');
        result.current('c');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(250);
      });

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
      expect(selectTab).toHaveBeenCalledWith(2);
    });
  });

  describe('TaxAndCateringCalc Interactive Component', () => {
    it('renders per-plate cover calculator, updates range slider, and toggles statutory GST rates', () => {
      render(
        <WorkspaceProvider>
          <TaxAndCateringCalc />
        </WorkspaceProvider>
      );

      expect(screen.getByText('Per-Plate Catering Calculator')).toBeInTheDocument();
      expect(screen.getByText(/Guests/i)).toBeInTheDocument();

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '2500' } });

      const pill12 = screen.getByRole('button', { name: '12%' });
      const pill18 = screen.getByRole('button', { name: '18%' });
      fireEvent.click(pill12);
      expect(pill12).toBeInTheDocument();
      fireEvent.click(pill18);
      expect(pill18).toBeInTheDocument();

      const syncBtn = screen.getByRole('button', { name: /Sync to Catering Budget/i });
      fireEvent.click(syncBtn);
    });
  });
});
