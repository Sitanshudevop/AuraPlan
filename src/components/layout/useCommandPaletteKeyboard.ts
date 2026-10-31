import { useEffect, useRef } from 'react';
import { PaletteItem } from './commandPaletteItems';

export function useCommandPaletteKeyboard(
  isOpen: boolean,
  filtered: PaletteItem[],
  selectedIndex: number,
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>,
  onClose: () => void
) {
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = filtered.length > 0 ? (prev + 1) % filtered.length : 0;
          selectedIndexRef.current = next;
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => {
          const next = filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0;
          selectedIndexRef.current = next;
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[selectedIndexRef.current];
        if (item) {
          item.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, onClose, setSelectedIndex]);
}
