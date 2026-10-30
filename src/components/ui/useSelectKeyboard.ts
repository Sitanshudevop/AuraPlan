import { useState } from 'react';
import { SelectOption } from './Select';

interface UseSelectKeyboardProps {
  options: SelectOption[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function useSelectKeyboard({
  options,
  isOpen,
  setIsOpen,
  onChange,
  disabled,
}: UseSelectKeyboardProps) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(0);
      } else {
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setFocusedIndex(options.length - 1);
      } else {
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen && focusedIndex >= 0 && options[focusedIndex]) {
        onChange(options[focusedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen(!isOpen);
      }
    }
  };

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}
