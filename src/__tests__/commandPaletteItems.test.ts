import { describe, it, expect, vi } from 'vitest';
import {
  buildBasePaletteItems,
  buildDynamicPaletteItems,
  BuildBaseItemsParams,
} from '../components/layout/commandPaletteItems';
import { INITIAL_PRESETS } from '../data/presets';
import { Vendor } from '../types/vendor';
import { MacroTask } from '../types/timeline';

describe('commandPaletteItems: Base and Dynamic Palette Items Execution', () => {
  it('executes all base actions in commandPaletteItems', () => {
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];
    const setActiveTab = vi.fn();
    const switchPreset = vi.fn();
    const setCurrency = vi.fn();
    const toggleDarkMode = vi.fn();
    const setAuditDrawerOpen = vi.fn();
    const setCopilotOpen = vi.fn();
    const setAssistantOpen = vi.fn();
    const setNewEventModalOpen = vi.fn();
    const autoBalanceBudget = vi.fn();
    const resetToFactoryDefaults = vi.fn();
    const announce = vi.fn();

    const params: BuildBaseItemsParams = {
      state,
      currency: 'INR',
      isDark: false,
      setActiveTab,
      switchPreset,
      setCurrency,
      toggleDarkMode,
      setAuditDrawerOpen,
      setCopilotOpen,
      setAssistantOpen,
      setNewEventModalOpen,
      autoBalanceBudget,
      resetToFactoryDefaults,
      announce,
    };

    const baseItems = buildBasePaletteItems(params);
    expect(baseItems.length).toBeGreaterThan(10);

    // Execute each action
    baseItems.forEach((item) => {
      item.action();
    });

    expect(setActiveTab).toHaveBeenCalledWith('dashboard');
    expect(setActiveTab).toHaveBeenCalledWith('budget');
    expect(setActiveTab).toHaveBeenCalledWith('timeline');
    expect(setActiveTab).toHaveBeenCalledWith('vendors');
    expect(setActiveTab).toHaveBeenCalledWith('ideation');
    expect(setActiveTab).toHaveBeenCalledWith('guests');
    expect(switchPreset).toHaveBeenCalledWith('preset-wedding-udaipur');
    expect(setAssistantOpen).toHaveBeenCalledWith(true);
    expect(setCopilotOpen).toHaveBeenCalledWith(true);
    expect(setAuditDrawerOpen).toHaveBeenCalledWith(true);
    expect(setNewEventModalOpen).toHaveBeenCalledWith(true);
    expect(autoBalanceBudget).toHaveBeenCalled();
    expect(setCurrency).toHaveBeenCalledWith('USD');
    expect(toggleDarkMode).toHaveBeenCalled();
    expect(resetToFactoryDefaults).toHaveBeenCalled();
    expect(announce).toHaveBeenCalled();
  });

  it('builds and executes dynamic palette items for vendors and tasks', () => {
    const setActiveTab = vi.fn();
    const mockVendors: Vendor[] = [
      {
        id: 'v-dyn-1',
        name: 'Dyn Vendor',
        category: 'catering',
        status: 'contacted',
        estimatedPrice: 100000,
        contractedPrice: 95000,
        paidAmount: 20000,
        contactName: 'Chef Roy',
        phone: '1234567890',
        email: 'roy@test.com',
        rating: 4.9,
        ratingCount: 10,
        location: 'Delhi',
        notes: '',
        deliverables: ['Dinner'],
      },
    ];
    const mockTasks: MacroTask[] = [
      {
        id: 't-dyn-1',
        title: 'Finalize Menu Tasting',
        category: 'Catering',
        horizon: '1_month',
        priority: 'high',
        completed: false,
        dueDate: '2026-11-01',
        assignee: 'Chef Roy',
      },
    ];

    const dynamicItems = buildDynamicPaletteItems(mockVendors, mockTasks, setActiveTab);
    expect(dynamicItems.length).toBe(2);

    dynamicItems[0].action();
    expect(setActiveTab).toHaveBeenCalledWith('vendors');

    dynamicItems[1].action();
    expect(setActiveTab).toHaveBeenCalledWith('timeline');
  });
});

