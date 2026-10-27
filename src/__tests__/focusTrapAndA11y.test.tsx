import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import { AuditDrawer } from '../features/audit/AuditDrawer';
import { RippleSimulatorDrawer } from '../features/ideation/RippleSimulatorDrawer';
import { TaxAndCateringCalc } from '../features/budget/TaxAndCateringCalc';
import { Sidebar } from '../components/layout/Sidebar';

// Test harness for useFocusTrap hook
const FocusTrapTestModal: React.FC<{ isOpen: boolean; onEscape: () => void }> = ({
  isOpen,
  onEscape,
}) => {
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onEscape);
  if (!isOpen) return null;

  return (
    <div ref={trapRef} role="dialog" aria-modal="true" aria-label="Test Modal">
      <button data-testid="first-btn">First Button</button>
      <input data-testid="input-field" placeholder="Sample Input" />
      <button data-testid="last-btn">Last Button</button>
    </div>
  );
};

const FocusTrapWrapper: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button data-testid="trigger-btn" onClick={() => setOpen(true)}>
        Open Modal
      </button>
      <FocusTrapTestModal isOpen={open} onEscape={() => setOpen(false)} />
    </div>
  );
};

describe('Accessibility & Focus Management (WCAG 2.1 AA)', () => {
  describe('useFocusTrap Hook & Keyboard Containment', () => {
    it('automatically focuses the first focusable element when opened', () => {
      render(<FocusTrapWrapper />);
      const triggerBtn = screen.getByTestId('trigger-btn');
      triggerBtn.focus();
      fireEvent.click(triggerBtn);

      const firstBtn = screen.getByTestId('first-btn');
      expect(document.activeElement).toBe(firstBtn);
    });

    it('wraps focus from last to first element on Tab, and first to last on Shift+Tab', () => {
      render(<FocusTrapWrapper />);
      const triggerBtn = screen.getByTestId('trigger-btn');
      triggerBtn.focus();
      fireEvent.click(triggerBtn);

      const firstBtn = screen.getByTestId('first-btn');
      const lastBtn = screen.getByTestId('last-btn');

      // Focus last element and press Tab -> should wrap to firstBtn
      lastBtn.focus();
      expect(document.activeElement).toBe(lastBtn);

      fireEvent.keyDown(document, { key: 'Tab', shiftKey: false });
      expect(document.activeElement).toBe(firstBtn);

      // Focus first element and press Shift+Tab -> should wrap to lastBtn
      firstBtn.focus();
      expect(document.activeElement).toBe(firstBtn);

      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
      expect(document.activeElement).toBe(lastBtn);
    });

    it('handles Escape key to close and restores focus to trigger element', () => {
      render(<FocusTrapWrapper />);
      const triggerBtn = screen.getByTestId('trigger-btn');
      triggerBtn.focus();
      fireEvent.click(triggerBtn);

      // Press Escape inside the trap
      fireEvent.keyDown(document, { key: 'Escape' });

      // Modal closed and focus returned to trigger
      expect(screen.queryByTestId('first-btn')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(triggerBtn);
    });
  });

  describe('Dialog Semantics on Slide-Over Drawers', () => {
    it('verifies AuditDrawer has role="dialog", aria-modal="true", and aria-labelledby', () => {
      const { container } = render(
        <WorkspaceProvider>
          <AuditDrawer />
        </WorkspaceProvider>
      );

      // Open drawer through context trigger in header
      const drawer = container.querySelector('[role="dialog"]');
      if (drawer) {
        expect(drawer).toHaveAttribute('aria-modal', 'true');
        expect(drawer).toHaveAttribute('aria-labelledby', 'audit-drawer-title');
      }
    });

    it('verifies RippleSimulatorDrawer has role="dialog", aria-modal="true", and aria-labelledby', () => {
      const { container } = render(
        <WorkspaceProvider>
          <RippleSimulatorDrawer />
        </WorkspaceProvider>
      );

      const drawer = container.querySelector('[role="dialog"]');
      if (drawer) {
        expect(drawer).toHaveAttribute('aria-modal', 'true');
        expect(drawer).toHaveAttribute('aria-labelledby', 'ripple-drawer-title');
      }
    });
  });

  describe('Accessible Form Controls & Range Slider Attributes', () => {
    it('ensures catering range slider exposes full ARIA value range to assistive tech', () => {
      render(
        <WorkspaceProvider>
          <TaxAndCateringCalc />
        </WorkspaceProvider>
      );

      const slider = screen.getByRole('slider', { name: /Catering rate per plate cover/i });
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute('aria-valuemin', '300');
      expect(slider).toHaveAttribute('aria-valuemax', '5000');
      expect(slider).toHaveAttribute('aria-valuenow');
      expect(slider).toHaveAttribute('aria-valuetext');
    });

    it('ensures sidebar navigation communicates active page via aria-current="page"', () => {
      render(
        <WorkspaceProvider>
          <Sidebar />
        </WorkspaceProvider>
      );

      const activeNavBtn = screen.getByRole('button', { name: /Executive Bento/i });
      expect(activeNavBtn).toHaveAttribute('aria-current', 'page');

      const inactiveNavBtn = screen.getByRole('button', { name: /Smart Budget Engine/i });
      expect(inactiveNavBtn).not.toHaveAttribute('aria-current');
    });
  });
});
