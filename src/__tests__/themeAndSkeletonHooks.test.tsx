import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, renderHook, act } from '@testing-library/react';
import { Skeleton, TabSkeleton } from '../components/ui/Skeleton';
import { useTheme, useKeyboardShortcuts, useDebounce, useFocusTrap } from '../hooks';

describe('Theme Management, Skeleton Loaders and Hooks Re-exports', () => {
  beforeEach(() => {
    cleanup();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove('dark');
  });

  it('useTheme initializes with default value and toggles dark mode correctly', () => {
    const { result } = renderHook(() => useTheme(false));
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => {
      result.current.toggleDarkMode();
    });
    expect(result.current.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      result.current.setDarkMode(false);
    });
    expect(result.current.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('Skeleton and TabSkeleton render accessible placeholders and skeletons', () => {
    const { container } = render(<Skeleton className="h-6 w-32" />);
    expect(container.firstChild).toHaveClass('animate-pulse');
    expect(container.firstChild).toHaveClass('h-6');

    render(<TabSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByLabelText(/Loading workspace module/i)).toBeInTheDocument();
  });

  it('verifies hooks re-exports from src/hooks/index.ts', () => {
    expect(useTheme).toBeDefined();
    expect(useKeyboardShortcuts).toBeDefined();
    expect(useDebounce).toBeDefined();
    expect(useFocusTrap).toBeDefined();
  });
});
