import { RippleDiffResult } from '../types/ripple';
import { EventWorkspaceState } from '../types/state';

export function buildMonsoonScenario(
  state: EventWorkspaceState,
  currentTotal: number
): RippleDiffResult {
  const tentCost = Math.round(currentTotal * 0.08);
  const generatorCost = Math.round(currentTotal * 0.02);

  return {
    scenarioTitle: 'Monsoon Alert (Outdoor -> Covered Transition)',
    scenarioDescription: 'Heavy unseasonal monsoon forecast. Deploying waterproof German Hangers over lawns and requisitioning high-capacity diesel backup generators.',
    budgetAdjustments: [
      {
        category: 'venue',
        categoryLabel: 'Venue Weatherproofing & Canopies',
        oldAllocated: state.budgetItems.find((b) => b.category === 'venue')?.allocated || 200000,
        newAllocated: (state.budgetItems.find((b) => b.category === 'venue')?.allocated || 200000) + tentCost,
        diff: tentCost,
        reason: 'Waterproof German Hanger canopy structures with clear sidewalls and covered walkway connectors.',
      },
      {
        category: 'logistics',
        categoryLabel: 'Emergency Power & Drainage',
        oldAllocated: state.budgetItems.find((b) => b.category === 'logistics')?.allocated || 50000,
        newAllocated: (state.budgetItems.find((b) => b.category === 'logistics')?.allocated || 50000) + generatorCost,
        diff: generatorCost,
        reason: 'Dual 125 kVA silent diesel generators, rubber cable bridges, and water pump rigging.',
      },
    ],
    newVendors: [
      {
        id: 'rv-rain-1',
        name: 'Apex German Hanger Structures & Flooring',
        category: 'venue',
        estimatedCost: tentCost,
        justification: 'Waterproof pagoda marquee + wooden floor decking to prevent muddy lawn conditions.',
      },
      {
        id: 'rv-rain-2',
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

export function buildInflationScenario(
  state: EventWorkspaceState,
  cateringAllocated: number,
  customPrompt?: string
): RippleDiffResult {
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
