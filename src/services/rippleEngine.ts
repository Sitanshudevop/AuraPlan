import { RippleDiffResult, RipplePresetId } from '../types/ripple';
import { EventWorkspaceState } from '../types/state';

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
            reason: `Additional shuttle vans, welcome kits, and badge print run.`,
          },
        ],
        newVendors: [
          {
            id: `rv-surge-1`,
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
        scenarioTitle: 'Austerity Calibration (-15% Budget Cut)',
        scenarioDescription: `Systematically trim ₹${targetCut.toLocaleString('en-IN')} across discretionary lines without degrading guest hospitality or core vendor commitments.`,
        budgetAdjustments: [
          {
            category: 'decor',
            categoryLabel: 'Decor & Floral Architecture',
            oldAllocated: decorItem?.allocated || 150000,
            newAllocated: Math.max(0, (decorItem?.allocated || 150000) - decorCut),
            diff: -decorCut,
            reason: 'Consolidate imported florals to local seasonal botanicals and repurpose ceremony backdrop for reception.',
          },
          {
            category: 'entertainment',
            categoryLabel: 'Entertainment & Audio Rigging',
            oldAllocated: entItem?.allocated || 100000,
            newAllocated: Math.max(0, (entItem?.allocated || 100000) - entCut),
            diff: -entCut,
            reason: 'Package DJ audio rig with local acoustic set; eliminate duplicate lighting truss.',
          },
          {
            category: 'buffer',
            categoryLabel: 'Contingency Reserve',
            oldAllocated: bufferItem?.allocated || 80000,
            newAllocated: Math.max(0, (bufferItem?.allocated || 80000) - bufferCut),
            diff: -bufferCut,
            reason: 'Tighten contingency reserve from 10% to 5.5% as core contracts are now signed.',
          },
        ],
        newVendors: [],
        timelineModifications: [
          {
            id: 'rtm-cut-1',
            title: 'Repurpose Ceremony Stage Arches for Reception Photo Booth',
            action: 'modify',
            detail: 'Decor crew relocates arch during the 45-minute cocktail gap.',
            horizonOrDayOf: 'Day-Of (20:00)',
          },
        ],
        netBudgetImpact: -targetCut,
        guestCountImpact: 0,
        summaryRationale: `Budget optimization successfully saved ₹${targetCut.toLocaleString('en-IN')} (15%) by targeting non-experiential redundancies while retaining all primary food, photography, and venue contracts.`,
      };
    }

    case 'monsoon_warning': {
      const tentCost = Math.round(currentTotal * 0.08);
      const generatorCost = Math.round(currentTotal * 0.03);

      return {
        scenarioTitle: 'Monsoon Alert: Weather-Proof Indoor/Tent Backup',
        scenarioDescription: 'Impending rain radar triggers immediate outdoor perimeter hardening with waterproof German hanger structures and waterproof cable covers.',
        budgetAdjustments: [
          {
            category: 'venue',
            categoryLabel: 'Venue Structures & Weather Shielding',
            oldAllocated: state.budgetItems.find((b) => b.category === 'venue')?.allocated || 400000,
            newAllocated: (state.budgetItems.find((b) => b.category === 'venue')?.allocated || 400000) + tentCost,
            diff: tentCost,
            reason: 'High-tension German Hanger waterproof marquee canopy with wooden elevated sub-flooring.',
          },
          {
            category: 'logistics',
            categoryLabel: 'Power & Electrical Safeguards',
            oldAllocated: state.budgetItems.find((b) => b.category === 'logistics')?.allocated || 50000,
            newAllocated: (state.budgetItems.find((b) => b.category === 'logistics')?.allocated || 50000) + generatorCost,
            diff: generatorCost,
            reason: 'IP65 waterproof cable channels and backup diesel generator on standby.',
          },
        ],
        newVendors: [
          {
            id: `rv-rain-1`,
            name: 'Apex German Hanger Structures & Flooring',
            category: 'venue',
            estimatedCost: tentCost,
            justification: 'Waterproof pagoda marquee + wooden floor decking to prevent muddy lawn conditions.',
          },
          {
            id: `rv-rain-2`,
            name: 'SilentPower 125kVA Backup Generator (GenSet)',
            category: 'logistics',
            estimatedCost: generatorCost,
            justification: 'Dual redundant power feed to guarantee audio/lights during thunderstorm grid trips.',
          },
        ],
        timelineModifications: [
          {
            id: 'rtm-rain-1',
            title: 'Waterproof Structure Handover & Rain Leak Inspection',
            action: 'add',
            detail: 'Inspect seams, drainage slope, and electrical ground pins 5h prior to guest arrival.',
            horizonOrDayOf: 'Day-Of (11:00)',
          },
          {
            id: 'rtm-rain-2',
            title: 'Relocate Cocktail Reception to Covered Veranda',
            action: 'shift',
            detail: 'Shift welcome drinks from open lawn to covered arcade zone.',
            horizonOrDayOf: 'Day-Of (18:00)',
          },
        ],
        netBudgetImpact: tentCost + generatorCost,
        guestCountImpact: 0,
        summaryRationale: 'Zero-disruption guarantee: Shields event from heavy downpours with reinforced German Hanger tenting and silent generator backup while preserving guest comfort.',
      };
    }

    case 'inflation_spike_20':
    default: {
      const cateringIncrease = Math.round(cateringAllocated * 0.20);
      const bufferItem = state.budgetItems.find((b) => b.category === 'buffer');
      const bufferAbsorption = Math.min(bufferItem?.allocated || cateringIncrease, cateringIncrease);
      const remainingDeficit = cateringIncrease - bufferAbsorption;

      return {
        scenarioTitle: 'Inflation Spike: Food & Beverage (+20%)',
        scenarioDescription: 'Raw ingredient commodity surge increases caterer procurement quotes by 20%. Reallocating internal contingency reserves.',
        budgetAdjustments: [
          {
            category: 'catering',
            categoryLabel: 'Catering Procurement Surcharge',
            oldAllocated: cateringAllocated,
            newAllocated: cateringAllocated + cateringIncrease,
            diff: cateringIncrease,
            reason: '20% wholesale dairy, meat, and fresh floral surge passed down from food suppliers.',
          },
          {
            category: 'buffer',
            categoryLabel: 'Buffer Offset Absorption',
            oldAllocated: bufferItem?.allocated || cateringIncrease,
            newAllocated: Math.max(0, (bufferItem?.allocated || cateringIncrease) - bufferAbsorption),
            diff: -bufferAbsorption,
            reason: 'Deploy emergency buffer reserve to cover ₹' + bufferAbsorption.toLocaleString('en-IN') + ' of catering cost hike.',
          },
        ],
        newVendors: [],
        timelineModifications: [
          {
            id: 'rtm-inf-1',
            title: 'Conduct Caterer Menu Optimization Audit',
            action: 'add',
            detail: 'Substitute 3 off-season imported desserts with artisanal local seasonal sweets to temper cost spike.',
            horizonOrDayOf: '1_week_out',
          },
        ],
        netBudgetImpact: remainingDeficit,
        guestCountImpact: 0,
        summaryRationale: customPrompt
          ? `Custom scenario simulated: Handled prompt '${customPrompt}' by rebalancing emergency reserves and capping culinary variances.`
          : `Absorbed ₹${bufferAbsorption.toLocaleString('en-IN')} of inflation hike from buffer reserves, limiting net budget variance to ₹${remainingDeficit.toLocaleString('en-IN')}.`,
      };
    }
  }
}
