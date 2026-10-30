import { RippleDiffResult, RipplePresetId } from '../types/ripple';
import { EventWorkspaceState } from '../types/state';
import { buildMonsoonScenario, buildInflationScenario } from './rippleScenarios';
import { buildGuestSurgeScenario, buildCutBudgetScenario } from './rippleSurgeAndCut';

export function calculateDeterministicRipple(
  presetId: RipplePresetId,
  state: EventWorkspaceState,
  customPrompt?: string
): RippleDiffResult {
  const currentTotal = state.budgetItems.reduce((acc, item) => acc + item.allocated, 0);
  const cateringItem = state.budgetItems.find((b) => b.category === 'catering');
  const cateringAllocated = cateringItem ? cateringItem.allocated : currentTotal * 0.3;

  switch (presetId) {
    case 'guest_surge_25':
      return buildGuestSurgeScenario(state, currentTotal, cateringAllocated);

    case 'cut_budget_15':
      return buildCutBudgetScenario(state, currentTotal);

    case 'monsoon_warning':
      return buildMonsoonScenario(state, currentTotal);

    case 'inflation_spike_20':
    default:
      return buildInflationScenario(state, cateringAllocated, customPrompt);
  }
}
