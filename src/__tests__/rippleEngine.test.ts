import { describe, it, expect } from 'vitest';
import { calculateDeterministicRipple } from '../services/rippleEngine';
import { workspaceReducer } from '../context/workspaceReducer';
import { weddingPreset } from '../data/weddingPreset';
import { EventWorkspaceState } from '../types/state';

describe('What-If Ripple Simulator Engine & State Mutations', () => {
  describe('+25% Guest Count Scenario', () => {
    it('accurately calculates ripple diff for +25% guest headcount surge', () => {
      const diff = calculateDeterministicRipple('guest_surge_25', weddingPreset);

      expect(diff.scenarioTitle).toContain('+25% Headcount');
      expect(diff.guestCountImpact).toBe(Math.round(weddingPreset.event.guestCount * 0.25));
      expect(diff.netBudgetImpact).toBeGreaterThan(0);

      // Mutates catering and logistics budget items
      const cateringAdj = diff.budgetAdjustments.find((b) => b.category === 'catering');
      const logisticsAdj = diff.budgetAdjustments.find((b) => b.category === 'logistics');
      expect(cateringAdj).toBeDefined();
      expect(cateringAdj!.diff).toBeGreaterThan(0);
      expect(logisticsAdj).toBeDefined();
      expect(logisticsAdj!.diff).toBeGreaterThan(0);

      // Injects extra hospitality & crockery vendor
      expect(diff.newVendors.length).toBeGreaterThan(0);
      expect(diff.newVendors.some((v) => v.name.toLowerCase().includes('crockery') || v.name.toLowerCase().includes('staffing'))).toBe(true);

      // Timeline additions (2nd buffet line, extended dinner window)
      expect(diff.timelineModifications.length).toBeGreaterThan(0);
    });

    it('applies +25% guest surge ripple mutations cleanly to workspace state', () => {
      const diff = calculateDeterministicRipple('guest_surge_25', weddingPreset);
      const mutatedState = workspaceReducer(weddingPreset, {
        type: 'APPLY_RIPPLE',
        payload: diff,
      });

      expect(mutatedState.event.guestCount).toBe(weddingPreset.event.guestCount + diff.guestCountImpact);
      expect(mutatedState.event.targetBudget).toBe(weddingPreset.event.targetBudget + diff.netBudgetImpact);
      expect(mutatedState.vendors.length).toBe(weddingPreset.vendors.length + diff.newVendors.length);
      expect(mutatedState.macroTasks.length).toBe(weddingPreset.macroTasks.length + diff.timelineModifications.length);

      const updatedCatering = mutatedState.budgetItems.find((b) => b.category === 'catering');
      const expectedAllocated = diff.budgetAdjustments.find((b) => b.category === 'catering')!.newAllocated;
      expect(updatedCatering?.allocated).toBe(expectedAllocated);
    });
  });

  describe('-15% Budget Cut Scenario', () => {
    it('accurately calculates ripple diff for austerity calibration', () => {
      const diff = calculateDeterministicRipple('cut_budget_15', weddingPreset);

      expect(diff.scenarioTitle).toContain('-15% Budget Cut');
      expect(diff.guestCountImpact).toBe(0);
      expect(diff.netBudgetImpact).toBeLessThan(0);

      // Decor, entertainment, and buffer are systematically trimmed
      const decorAdj = diff.budgetAdjustments.find((b) => b.category === 'decor');
      const entAdj = diff.budgetAdjustments.find((b) => b.category === 'entertainment');
      const bufferAdj = diff.budgetAdjustments.find((b) => b.category === 'buffer');

      expect(decorAdj!.diff).toBeLessThan(0);
      expect(entAdj!.diff).toBeLessThan(0);
      expect(bufferAdj!.diff).toBeLessThan(0);
    });

    it('applies -15% budget cut to state without modifying core headcount', () => {
      const diff = calculateDeterministicRipple('cut_budget_15', weddingPreset);
      const mutatedState = workspaceReducer(weddingPreset, {
        type: 'APPLY_RIPPLE',
        payload: diff,
      });

      expect(mutatedState.event.guestCount).toBe(weddingPreset.event.guestCount);
      expect(mutatedState.event.targetBudget).toBe(weddingPreset.event.targetBudget + diff.netBudgetImpact);
      const decorItem = mutatedState.budgetItems.find((b) => b.category === 'decor');
      expect(decorItem?.allocated).toBeLessThan(weddingPreset.budgetItems.find((b) => b.category === 'decor')!.allocated);
    });
  });

  describe('Rain/Monsoon Backup Scenario', () => {
    it('injects waterproof German Hanger tent structure and generator vendors', () => {
      const diff = calculateDeterministicRipple('monsoon_warning', weddingPreset);

      expect(diff.scenarioTitle).toContain('Monsoon Alert');
      expect(diff.newVendors.some((v) => v.name.toLowerCase().includes('hanger'))).toBe(true);
      expect(diff.newVendors.some((v) => v.name.toLowerCase().includes('generator'))).toBe(true);

      const venueAdj = diff.budgetAdjustments.find((b) => b.category === 'venue');
      const logisticsAdj = diff.budgetAdjustments.find((b) => b.category === 'logistics');
      expect(venueAdj!.diff).toBeGreaterThan(0);
      expect(logisticsAdj!.diff).toBeGreaterThan(0);
    });

    it('applies monsoon weather emergency to workspace state', () => {
      const diff = calculateDeterministicRipple('monsoon_warning', weddingPreset);
      const mutatedState = workspaceReducer(weddingPreset, {
        type: 'APPLY_RIPPLE',
        payload: diff,
      });

      expect(mutatedState.vendors.length).toBe(weddingPreset.vendors.length + diff.newVendors.length);
      expect(mutatedState.macroTasks.length).toBe(weddingPreset.macroTasks.length + diff.timelineModifications.length);
    });
  });

  describe('Undo Ripple State Restoration', () => {
    it('restores the exact prior state after applying and rolling back a ripple', () => {
      const initialState: EventWorkspaceState = { ...weddingPreset };

      // 1. Maintain history snapshot stack
      const historyStack: EventWorkspaceState[] = [];
      historyStack.push(initialState);

      // 2. Apply ripple simulation
      const diff = calculateDeterministicRipple('guest_surge_25', initialState);
      const mutatedState = workspaceReducer(initialState, {
        type: 'APPLY_RIPPLE',
        payload: diff,
      });

      // Verify that state actually changed
      expect(mutatedState.event.guestCount).not.toBe(initialState.event.guestCount);
      expect(mutatedState.vendors.length).not.toBe(initialState.vendors.length);
      expect(mutatedState.macroTasks.length).not.toBe(initialState.macroTasks.length);

      // 3. Trigger Undo Ripple by popping snapshot from history
      const priorState = historyStack.pop()!;
      const restoredState = workspaceReducer(mutatedState, {
        type: 'LOAD_STATE',
        payload: priorState,
      });

      // 4. Verify exact restoration of original state
      expect(restoredState.event.guestCount).toBe(initialState.event.guestCount);
      expect(restoredState.event.targetBudget).toBe(initialState.event.targetBudget);
      expect(restoredState.vendors.length).toBe(initialState.vendors.length);
      expect(restoredState.macroTasks.length).toBe(initialState.macroTasks.length);
      expect(restoredState.budgetItems).toEqual(initialState.budgetItems);
    });

    it('supports chained ripple simulations and multi-step rollbacks', () => {
      const initialState: EventWorkspaceState = { ...weddingPreset };
      const historyStack: EventWorkspaceState[] = [];

      // Step 1: Apply Guest Surge
      historyStack.push(initialState);
      const diff1 = calculateDeterministicRipple('guest_surge_25', initialState);
      const state1 = workspaceReducer(initialState, { type: 'APPLY_RIPPLE', payload: diff1 });

      // Step 2: Apply Monsoon Alert
      historyStack.push(state1);
      const diff2 = calculateDeterministicRipple('monsoon_warning', state1);
      const state2 = workspaceReducer(state1, { type: 'APPLY_RIPPLE', payload: diff2 });

      // Undo Monsoon Alert
      const prevMonsoon = historyStack.pop()!;
      const restoredToState1 = workspaceReducer(state2, { type: 'LOAD_STATE', payload: prevMonsoon });
      expect(restoredToState1.event.guestCount).toBe(state1.event.guestCount);
      expect(restoredToState1.vendors.length).toBe(state1.vendors.length);

      // Undo Guest Surge back to origin
      const prevOrigin = historyStack.pop()!;
      const restoredToOrigin = workspaceReducer(restoredToState1, { type: 'LOAD_STATE', payload: prevOrigin });
      expect(restoredToOrigin.event.guestCount).toBe(initialState.event.guestCount);
      expect(restoredToOrigin.vendors.length).toBe(initialState.vendors.length);
    });
  });
});

