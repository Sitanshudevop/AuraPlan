import { describe, it, expect } from 'vitest';
import { eventReducer } from '../state/eventReducer';
import { budgetReducer } from '../state/budgetReducer';
import { vendorReducer, VendorSliceState } from '../state/vendorReducer';
import { timelineReducer } from '../state/timelineReducer';
import { guestReducer } from '../state/guestReducer';
import { rippleReducer } from '../state/rippleReducer';
import { rootWorkspaceReducer } from '../state/rootReducer';
import { weddingPreset } from '../data/weddingPreset';
import { BudgetItem } from '../types/budget';
import { Vendor } from '../types/vendor';
import { MacroTask, DayOfActivity } from '../types/timeline';
import { Guest } from '../types/guest';
import { RippleDiffResult } from '../types/ripple';

describe('Domain Reducer Slices Unit Tests', () => {
  describe('eventReducer', () => {
    it('updates event fields cleanly', () => {
      const initial = weddingPreset.event;
      const updated = eventReducer(initial, {
        type: 'UPDATE_EVENT',
        payload: { guestCount: 300, city: 'Jaipur' },
      });
      expect(updated.guestCount).toBe(300);
      expect(updated.city).toBe('Jaipur');
      expect(updated.name).toBe(initial.name);
    });
  });

  describe('budgetReducer', () => {
    it('handles ADD, UPDATE, DELETE, and TAX actions', () => {
      let state = {
        budgetItems: [] as BudgetItem[],
        includeTaxInTotals: false,
        taxRatePercent: 18,
      };

      const newItem: BudgetItem = {
        id: 'bi-test-1',
        category: 'venue',
        name: 'Grand Lawn',
        allocated: 500000,
        vendorQuote: 500000,
        actualContracted: 0,
        amountPaid: 0,
        isLocked: false,
      };

      // ADD
      state = budgetReducer(state, { type: 'ADD_BUDGET_ITEM', payload: newItem });
      expect(state.budgetItems).toHaveLength(1);
      expect(state.budgetItems[0].name).toBe('Grand Lawn');

      // UPDATE
      state = budgetReducer(state, {
        type: 'UPDATE_BUDGET_ITEM',
        payload: { id: 'bi-test-1', partial: { allocated: 550000 } },
      });
      expect(state.budgetItems[0].allocated).toBe(550000);

      // TAX
      state = budgetReducer(state, { type: 'TOGGLE_TAX', payload: true });
      expect(state.includeTaxInTotals).toBe(true);

      state = budgetReducer(state, { type: 'SET_TAX_RATE', payload: 12 });
      expect(state.taxRatePercent).toBe(12);

      // DELETE
      state = budgetReducer(state, {
        type: 'DELETE_BUDGET_ITEM',
        payload: { id: 'bi-test-1' },
      });
      expect(state.budgetItems).toHaveLength(0);
    });
  });

  describe('vendorReducer', () => {
    it('handles ADD, UPDATE, DELETE and syncs contracted vendor price to budget', () => {
      let state: VendorSliceState = {
        vendors: [] as Vendor[],
        budgetItems: [
          {
            id: 'b-venue',
            category: 'venue',
            name: 'Venue allocation',
            allocated: 500000,
            vendorQuote: 500000,
            actualContracted: 0,
            amountPaid: 0,
            isLocked: false,
          },
        ],
      };

      const vendor: Vendor = {
        id: 'v-test-1',
        name: 'Palace Resort',
        category: 'venue',
        status: 'shortlisted',
        estimatedPrice: 480000,
        contractedPrice: 470000,
        paidAmount: 0,
        contactName: 'Manager',
        phone: '123',
        email: 'palace@test.com',
        rating: 4.9,
        ratingCount: 15,
        location: 'City',
        notes: '',
        deliverables: [],
      };

      // ADD
      state = vendorReducer(state, { type: 'ADD_VENDOR', payload: vendor });
      expect(state.vendors).toHaveLength(1);

      // UPDATE with contract signed -> syncs to budgetItems
      state = vendorReducer(state, {
        type: 'UPDATE_VENDOR',
        payload: { id: 'v-test-1', partial: { status: 'contract_signed', contractedPrice: 470000 } },
      });
      expect(state.vendors[0].status).toBe('contract_signed');
      expect(state.budgetItems[0].actualContracted).toBe(470000);

      // DELETE
      state = vendorReducer(state, { type: 'DELETE_VENDOR', payload: { id: 'v-test-1' } });
      expect(state.vendors).toHaveLength(0);
    });
  });

  describe('timelineReducer', () => {
    it('handles tasks, activities, and 30m conflict shift', () => {
      let state = {
        macroTasks: [] as MacroTask[],
        dayOfActivities: [] as DayOfActivity[],
      };

      const task: MacroTask = {
        id: 't-1',
        horizon: '1_month',
        title: 'Book DJ',
        category: 'entertainment',
        priority: 'high',
        assignee: 'Planner',
        dueDate: '2026-11-20',
        completed: false,
      };

      const activity: DayOfActivity = {
        id: 'a-1',
        startTime: '18:00',
        endTime: '19:00',
        durationMinutes: 60,
        title: 'Cocktail Hour',
        locationZone: 'Terrace',
        poc: 'Host',
      };

      // ADD task & activity
      state = timelineReducer(state, { type: 'ADD_TASK', payload: task });
      state = timelineReducer(state, { type: 'ADD_ACTIVITY', payload: activity });
      expect(state.macroTasks).toHaveLength(1);
      expect(state.dayOfActivities).toHaveLength(1);

      // SHIFT activity by 30 mins
      state = timelineReducer(state, { type: 'SHIFT_ACTIVITY_30M', payload: { id: 'a-1' } });
      expect(state.dayOfActivities[0].startTime).toBe('18:30');
      expect(state.dayOfActivities[0].endTime).toBe('19:30');

      // DELETE
      state = timelineReducer(state, { type: 'DELETE_TASK', payload: { id: 't-1' } });
      state = timelineReducer(state, { type: 'DELETE_ACTIVITY', payload: { id: 'a-1' } });
      expect(state.macroTasks).toHaveLength(0);
      expect(state.dayOfActivities).toHaveLength(0);
    });
  });

  describe('guestReducer', () => {
    it('handles guest ADD, UPDATE, and DELETE', () => {
      let state = { guests: [] as Guest[] };
      const guest: Guest = {
        id: 'g-1',
        name: 'Aarav Sharma',
        group: 'vip',
        rsvp: 'confirmed',
        dietary: 'vegetarian',
        plusOnes: 1,
      };

      state = guestReducer(state, { type: 'ADD_GUEST', payload: guest });
      expect(state.guests).toHaveLength(1);

      state = guestReducer(state, {
        type: 'UPDATE_GUEST',
        payload: { id: 'g-1', partial: { plusOnes: 2 } },
      });
      expect(state.guests[0].plusOnes).toBe(2);

      state = guestReducer(state, { type: 'DELETE_GUEST', payload: { id: 'g-1' } });
      expect(state.guests).toHaveLength(0);
    });
  });

  describe('rippleReducer', () => {
    it('applies ripple adjustments directly to state', () => {
      const mockRipple: RippleDiffResult = {
        scenarioTitle: 'Guest Surge',
        scenarioDescription: 'Testing ripple effect',
        guestCountImpact: 25,
        netBudgetImpact: 50000,
        budgetAdjustments: [],
        newVendors: [],
        timelineModifications: [],
        summaryRationale: 'Manageable surge',
      };

      const result = rippleReducer(weddingPreset, { type: 'APPLY_RIPPLE', payload: mockRipple });
      expect(result.event.guestCount).toBe(weddingPreset.event.guestCount + 25);
      expect(result.event.targetBudget).toBe(weddingPreset.event.targetBudget + 50000);
    });
  });

  describe('rootWorkspaceReducer', () => {
    it('loads full state cleanly via LOAD_STATE', () => {
      const state = rootWorkspaceReducer(weddingPreset, {
        type: 'LOAD_STATE',
        payload: weddingPreset,
      });
      expect(state.event.name).toBe(weddingPreset.event.name);
    });

    it('delegates ripple simulation diff application correctly', () => {
      const mockRipple: RippleDiffResult = {
        scenarioTitle: 'Guest Surge',
        scenarioDescription: 'Surge simulation',
        guestCountImpact: 25,
        netBudgetImpact: 50000,
        budgetAdjustments: [
          {
            category: 'catering',
            categoryLabel: 'Catering',
            oldAllocated: 250000,
            newAllocated: 300000,
            diff: 50000,
            reason: 'Extra headcount',
          },
        ],
        newVendors: [],
        timelineModifications: [],
        summaryRationale: 'Manageable surge',
      };

      const result = rootWorkspaceReducer(weddingPreset, {
        type: 'APPLY_RIPPLE',
        payload: mockRipple,
      });

      expect(result.event.guestCount).toBe(weddingPreset.event.guestCount + 25);
      expect(result.event.targetBudget).toBe(weddingPreset.event.targetBudget + 50000);
    });
  });
});
