import { describe, it, expect } from 'vitest';
import { timelineReducer } from '../state/timelineReducer';
import { guestReducer } from '../state/guestReducer';
import { rippleReducer } from '../state/rippleReducer';
import { rootWorkspaceReducer } from '../state/rootReducer';
import { weddingPreset } from '../data/weddingPreset';
import { MacroTask, DayOfActivity } from '../types/timeline';
import { Guest } from '../types/guest';
import { RippleDiffResult } from '../types/ripple';

describe('Domain Reducer Slices: Timeline, Guests, Ripple, & Root', () => {
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

