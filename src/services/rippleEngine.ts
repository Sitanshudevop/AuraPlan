import { RippleDiffResult, RipplePresetId } from '../types/ripple';
import { EventWorkspaceState } from '../types/state';
import { buildMonsoonScenario, buildInflationScenario } from './rippleScenarios';

export function calculateDeterministicRipple(
  presetId: RipplePresetId,
  state: EventWorkspaceState,
  customPrompt?: string
): RippleDiffResult {
  const currentTotal = state.budgetItems.reduce((acc, item) => acc + item.allocated, 0);
  const cateringItem = state.budgetItems.find((b) => b.category === 'catering');
  const cateringAllocated = cateringItem ? cateringItem.allocated : currentTotal * 0.3;

  switch (presetId) {
    case 'guest_surge_25': {
      const additionalGuests = Math.round(state.event.guestCount * 0.25);
      const cateringIncrease = Math.round(cateringAllocated * 0.25);
      const logisticsIncrease = Math.round((currentTotal * 0.05) * 0.25);
      const netImpact = cateringIncrease + logisticsIncrease;

      return {
        scenarioTitle: 'Guest Surge (+25% Headcount)',
        scenarioDescription: `Guest count projected to increase from ${state.event.guestCount} to ${state.event.guestCount + additionalGuests}. Recalculating dining covers, service staff, and seating zones.`,
        budgetAdjustments: [
          {
            category: 'catering',
            categoryLabel: 'Catering & Dining Covers',
            oldAllocated: cateringAllocated,
            newAllocated: cateringAllocated + cateringIncrease,
            diff: cateringIncrease,
            reason: `Scales per-plate food prep, dinnerware rentals & bar supplies for ${additionalGuests} new guests.`,
          },
          {
            category: 'logistics',
            categoryLabel: 'Logistics & Guest Transit',
            oldAllocated: state.budgetItems.find((b) => b.category === 'logistics')?.allocated || 50000,
            newAllocated: (state.budgetItems.find((b) => b.category === 'logistics')?.allocated || 50000) + logisticsIncrease,
            diff: logisticsIncrease,
            reason: 'Additional shuttle vans, welcome kits, and badge print run.',
          },
        ],
        newVendors: [
          {
            id: 'rv-surge-1',
            name: 'Imperial Hospitality Staffing & Extra Crockery',
            category: 'catering',
            estimatedCost: Math.round(cateringIncrease * 0.4),
            justification: 'Deploy 6 additional floor stewards and 60 sets of fine ceramic dinnerware.',
          },
        ],
        timelineModifications: [
          {
            id: 'rtm-surge-1',
            title: 'Add 2nd Buffet Line & Expand Registration Counter',
            action: 'add',
            detail: 'Eliminates mealtime queues during peak 8:00 PM rush.',
            horizonOrDayOf: 'Day-Of (17:30)',
          },
          {
            id: 'rtm-surge-2',
            title: 'Shift Banquet Service Window (+30m extension)',
            action: 'shift',
            detail: 'Extend catering window from 90 mins to 120 mins to accommodate higher volume.',
            horizonOrDayOf: 'Day-Of Schedule',
          },
        ],
        netBudgetImpact: netImpact,
        guestCountImpact: additionalGuests,
        summaryRationale: `Absorption strategy: Accommodates ${additionalGuests} additional guests (+25%) while safeguarding dining flow and avoiding bottlenecking at reception and bars.`,
      };
    }

    case 'cut_budget_15': {
      const targetCut = Math.round(currentTotal * 0.15);
      const decorItem = state.budgetItems.find((b) => b.category === 'decor');
      const entItem = state.budgetItems.find((b) => b.category === 'entertainment');
      const bufferItem = state.budgetItems.find((b) => b.category === 'buffer');

      const decorCut = decorItem ? Math.round(decorItem.allocated * 0.3) : Math.round(targetCut * 0.4);
      const entCut = entItem ? Math.round(entItem.allocated * 0.25) : Math.round(targetCut * 0.3);
      const bufferCut = targetCut - (decorCut + entCut);

      return {
        scenarioTitle: '-15% Budget Cut (Austerity Calibration)',
        scenarioDescription: `Consolidating non-essential decor flourishes, transitioning to high-impact focal floral installations, and streamlining entertainment staging to save ${targetCut.toLocaleString('en-IN')}.`,
        budgetAdjustments: [
          {
            category: 'decor',
            categoryLabel: 'Decor & Production Design',
            oldAllocated: decorItem?.allocated || 150000,
            newAllocated: (decorItem?.allocated || 150000) - decorCut,
            diff: -decorCut,
            reason: 'Consolidate perimeter draping and replace imported floral arches with local marigolds.',
          },
          {
            category: 'entertainment',
            categoryLabel: 'Entertainment & Live Sound',
            oldAllocated: entItem?.allocated || 100000,
            newAllocated: (entItem?.allocated || 100000) - entCut,
            diff: -entCut,
            reason: 'Consolidate secondary lounge acoustic act; focus sound gear on main dance stage.',
          },
          {
            category: 'buffer',
            categoryLabel: 'Contingency Buffer Reserve',
            oldAllocated: bufferItem?.allocated || 50000,
            newAllocated: Math.max(0, (bufferItem?.allocated || 50000) - bufferCut),
            diff: -bufferCut,
            reason: 'Release discretionary buffer allocation to lock in immediate target savings.',
          },
        ],
        newVendors: [],
        timelineModifications: [
          {
            id: 'rtm-cut-1',
            title: 'Consolidate Stage Lighting Tech Briefing',
            action: 'modify',
            detail: 'Merge lighting and sound pre-production checks into single 45-min master briefing.',
            horizonOrDayOf: 'Day-Of (14:00)',
          },
        ],
        netBudgetImpact: -targetCut,
        guestCountImpact: 0,
        summaryRationale: `Precision austerity: Captured 15% net reduction (-${targetCut.toLocaleString('en-IN')}) across decor, auxiliary entertainment, and contingency buffer while keeping core guest dining and ceremonies completely intact.`,
      };
    }

    case 'monsoon_warning': {
      return buildMonsoonScenario(state, currentTotal);
    }

    case 'inflation_spike_20':
    default: {
      return buildInflationScenario(state, cateringAllocated, customPrompt);
    }
  }
}
