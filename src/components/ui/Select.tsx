import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  dotColor?: string;
  description?: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'input' | 'ghost' | 'compact';
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  variant = 'input',
  ariaLabel,
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const selectId = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

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

  const getTriggerStyles = () => {
    if (variant === 'compact') {
      return 'inline-flex items-center gap-1.5 py-1 px-2 text-xs font-normal text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.06] rounded-md transition-colors';
    }
    if (variant === 'ghost') {
      return 'w-full inline-flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs text-stone-700 dark:text-[#EDEDEF] hover:bg-stone-100 dark:hover:bg-white/[0.04] rounded-lg transition-colors border border-transparent';
    }
    // Default 'input' variant
    return 'w-full inline-flex items-center justify-between gap-2 px-3 py-2 text-xs text-stone-800 dark:text-[#EDEDEF] bg-white dark:bg-[#111113] border border-stone-200 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.14] rounded-lg transition-colors';
  };

  return (
    <div className={`relative inline-block ${variant === 'input' ? 'w-full' : ''} ${className}`} ref={containerRef}>
      <button
        type="button"
        id={selectId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`${getTriggerStyles()} focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E79F5] focus-visible:ring-offset-1`}
      >
        <span className="flex items-center gap-2 truncate text-left">
          {selectedOption?.dotColor && (
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedOption.dotColor}`} />
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 dark:text-zinc-500 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          aria-labelledby={selectId}
          className="absolute z-50 left-0 mt-1 min-w-[180px] max-w-[320px] max-h-60 overflow-y-auto bg-white dark:bg-[#161618] border border-stone-200 dark:border-white/[0.1] rounded-lg p-1 shadow-lg text-xs focus:outline-none animate-fade-in"
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isFocused = idx === focusedIndex;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setFocusedIndex(idx)}
                className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${isSelected
                    ? 'bg-[#6E79F5]/10 text-[#5D68E2] dark:text-[#6E79F5] font-medium'
                    : isFocused
                      ? 'bg-stone-100 dark:bg-white/[0.06] text-stone-900 dark:text-[#EDEDEF]'
                      : 'text-stone-700 dark:text-[#8B8B93]'
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {option.dotColor && (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${option.dotColor}`} />
                  )}
                  <span className="truncate">{option.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#6E79F5]" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
