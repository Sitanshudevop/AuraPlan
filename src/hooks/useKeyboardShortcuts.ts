import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  onToggleCommandPalette: () => void;
  onCloseOverlays: () => void;
  onSelectTabByIndex?: (index: number) => void;
  tabCount?: number;
}

/**
 * Global keyboard shortcuts hook
 * Manages Cmd/Ctrl+K (Command Palette), Escape (close modals/drawers), and Alt+1..N (tab switching).
 */
export function useKeyboardShortcuts({
  onToggleCommandPalette,
  onCloseOverlays,
  onSelectTabByIndex,
  tabCount = 6,
}: KeyboardShortcutOptions): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Open/close Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onToggleCommandPalette();
        return;
      }

      // Escape: Dismiss active modals and drawers
      if (e.key === 'Escape') {
        onCloseOverlays();
        return;
      }

      // Alt + 1..N: Fast tab switching
      if (e.altKey && !isNaN(Number(e.key)) && onSelectTabByIndex) {
        const num = Number(e.key);
        if (num >= 1 && num <= tabCount) {
          e.preventDefault();
          onSelectTabByIndex(num - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCommandPalette, onCloseOverlays, onSelectTabByIndex, tabCount]);
}
