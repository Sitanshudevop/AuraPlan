import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { WorkspaceProvider } from '../context/WorkspaceContext';
import {
  useBudget,
  useVendors,
  useTimeline,
  useGuests,
  useUI,
} from '../state/sliceHooks';
import { logger } from '../utils/logger';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <WorkspaceProvider>{children}</WorkspaceProvider>
);

describe('Domain Slice Hooks & Selectors', () => {
  it('useBudget provides slice state and action dispatchers', () => {
    const { result } = renderHook(() => useBudget(), { wrapper });

    expect(result.current.budgetItems.length).toBeGreaterThan(0);
    expect(result.current.targetBudget).toBeGreaterThan(0);
    expect(result.current.taxRatePercent).toBeDefined();

    act(() => {
      result.current.toggleTax(false);
    });
    expect(result.current.includeTaxInTotals).toBe(false);

    act(() => {
      result.current.setTaxRate(12);
    });
    expect(result.current.taxRatePercent).toBe(12);
  });

  it('useVendors provides vendor list and dispatchers', () => {
    const { result } = renderHook(() => useVendors(), { wrapper });

    expect(result.current.vendors.length).toBeGreaterThan(0);
    const initialCount = result.current.vendors.length;

    act(() => {
      result.current.addVendor({
        name: 'Test Vendor Co',
        category: 'catering',
        status: 'shortlisted',
        estimatedPrice: 25000,
        contractedPrice: 25000,
        paidAmount: 0,
        contactName: 'Rohit',
        phone: '1234567890',
        email: 'rohit@test.com',
        rating: 4.5,
        ratingCount: 10,
        location: 'Mumbai',
        notes: 'Test',
        deliverables: ['Dinner'],
      });
    });

    expect(result.current.vendors.length).toBe(initialCount + 1);
  });

  it('useTimeline provides timeline tasks and run-of-show', () => {
    const { result } = renderHook(() => useTimeline(), { wrapper });

    expect(result.current.macroTasks.length).toBeGreaterThan(0);
    expect(result.current.dayOfActivities.length).toBeGreaterThan(0);

    const firstActivity = result.current.dayOfActivities[0];
    act(() => {
      result.current.updateDayOfActivity(firstActivity.id, { completed: true });
    });

    const updated = result.current.dayOfActivities.find((a) => a.id === firstActivity.id);
    expect(updated?.completed).toBe(true);
  });

  it('useGuests provides guest roster and seating zone actions', () => {
    const { result } = renderHook(() => useGuests(), { wrapper });

    expect(result.current.guests.length).toBeGreaterThan(0);
    expect(result.current.zones.length).toBeGreaterThan(0);

    const initialGuestCount = result.current.guests.length;
    act(() => {
      result.current.addGuest({
        name: 'Pooja Sharma',
        group: 'vip',
        rsvp: 'confirmed',
        plusOnes: 1,
        dietary: 'vegetarian',
      });
    });

    expect(result.current.guests.length).toBe(initialGuestCount + 1);
  });

  it('useUI provides modal and navigation controls', () => {
    const { result } = renderHook(() => useUI(), { wrapper });

    expect(result.current.activeTab).toBe('dashboard');

    act(() => {
      result.current.setActiveTab('budget');
    });
    expect(result.current.activeTab).toBe('budget');

    act(() => {
      result.current.setCopilotOpen(true);
    });
    expect(result.current.isCopilotOpen).toBe(true);

    act(() => {
      result.current.announce('Budget recalculated');
    });
    expect(result.current.announcerMessage).toBe('Budget recalculated');
  });
});

describe('Production Logger Utility', () => {
  it('safely handles logging without crashing in all modes', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    logger.info('Test Info Message');
    logger.warn('Test Warning Message');
    logger.error('Test Error Message');
    logger.debug('Test Debug Message');

    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    debugSpy.mockRestore();
  });
});
