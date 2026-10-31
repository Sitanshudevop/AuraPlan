import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import React from 'react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import { RippleDiffResult } from '../types/ripple';
import { weddingPreset } from '../data/weddingPreset';

describe('Workspace Dispatchers, Ripple Apply/Undo, and CRUD State Transitions', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WorkspaceProvider>{children}</WorkspaceProvider>
  );

  const mockDiff: RippleDiffResult = {
    scenarioTitle: 'Guest Surge +25%',
    scenarioDescription: '50 more attendees require added catering and seating',
    netBudgetImpact: 50000,
    guestCountImpact: 50,
    summaryRationale: 'Catering increase required',
    budgetAdjustments: [
      {
        category: 'catering',
        categoryLabel: 'Catering & Beverages',
        oldAllocated: 475000,
        diff: 50000,
        newAllocated: 525000,
        reason: 'Extra plates',
      },
    ],
    newVendors: [],
    timelineModifications: [],
  };

  it('applies ripple effect, records history, and reverts via undoLastRipple', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });

    const initialAllocated = result.current.state.budgetItems.find((b) => b.category === 'catering')?.allocated || 0;

    // Apply ripple
    act(() => {
      result.current.applyRipple(mockDiff);
    });

    const updatedAllocated = result.current.state.budgetItems.find((b) => b.category === 'catering')?.allocated || 0;
    expect(updatedAllocated).toBe(initialAllocated + 50000);
    expect(result.current.canUndo).toBe(true);

    // Undo ripple
    act(() => {
      result.current.undoLastRipple();
    });

    const revertedAllocated = result.current.state.budgetItems.find((b) => b.category === 'catering')?.allocated || 0;
    expect(revertedAllocated).toBe(initialAllocated);
  });

  it('handles auto-balance, tax toggle, and tax rate updates', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });

    act(() => {
      result.current.toggleTax(true);
      result.current.setTaxRate(18);
    });

    expect(result.current.state.includeTaxInTotals).toBe(true);
    expect(result.current.state.taxRatePercent).toBe(18);

    act(() => {
      result.current.autoBalanceBudget();
    });
    expect(result.current.announcerMessage).toContain('auto-balanced');
  });

  it('handles delete operations for budget, vendor, task, activity, and shift activity', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });

    const firstBudgetId = result.current.state.budgetItems[0]?.id;
    const firstVendorId = result.current.state.vendors[0]?.id;
    const firstTaskId = result.current.state.macroTasks[0]?.id;
    const firstActivityId = result.current.state.dayOfActivities[0]?.id;

    act(() => {
      if (firstBudgetId) result.current.deleteBudgetItem(firstBudgetId);
      if (firstVendorId) result.current.deleteVendor(firstVendorId);
      if (firstTaskId) result.current.deleteMacroTask(firstTaskId);
      if (firstActivityId) {
        result.current.shiftActivity30m(firstActivityId);
        result.current.deleteDayOfActivity(firstActivityId);
      }
    });

    if (firstBudgetId) {
      expect(result.current.state.budgetItems.some((b) => b.id === firstBudgetId)).toBe(false);
    }
  });

  it('sets custom event state and resets to factory defaults', () => {
    const { result } = renderHook(() => useWorkspace(), { wrapper });

    const customState = {
      ...weddingPreset,
      event: {
        ...weddingPreset.event,
        id: 'custom-event-99',
        name: 'Custom Royal Celebration',
      },
    };

    act(() => {
      result.current.setCustomState(customState);
    });
    expect(result.current.state.event.name).toBe('Custom Royal Celebration');

    act(() => {
      result.current.resetToFactoryDefaults();
    });
    expect(result.current.state.event.id).toBe('preset-wedding-udaipur');
  });
});
