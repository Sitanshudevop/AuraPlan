import { useEffect, useRef } from 'react';

/**
 * Custom hook to trap keyboard focus within a modal or drawer container.
 * Enforces WCAG 2.1 AA focus containment (Tab / Shift+Tab) and restores focus
 * to the triggering element upon closure.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
  onEscape?: () => void
) {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Cache currently active element to restore focus on exit
    previousActiveElement.current = document.activeElement as HTMLElement;
    const container = containerRef.current;
    if (!container) return;

    // Query all natively focusable elements
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));

    // Focus the first interactive element or the container itself
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
    } else {
      container.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.stopPropagation();
        onEscape();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: loop from first to last element
          if (document.activeElement === firstElement || document.activeElement === container) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: loop from last to first element
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to original triggering element
      if (
        previousActiveElement.current &&
        typeof previousActiveElement.current.focus === 'function'
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, onEscape]);

  return containerRef;
}

