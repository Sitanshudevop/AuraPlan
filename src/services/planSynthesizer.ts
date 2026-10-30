import { EventWorkspaceState } from '../types/state';
import { SponsorshipInflow } from '../types/budget';
import {
  NewEventFormInput,
  buildEventData,
  buildBudgetAndMilestones,
  buildVendors,
  buildTimelineTasks,
  buildRosterAndZones,
} from './planSynthesizerDefaults';

export type { NewEventFormInput };

export function synthesizePlanLocally(input: NewEventFormInput): EventWorkspaceState {
  const ts = Date.now();
  const event = buildEventData(input, ts);
  const { budgetItems, paymentMilestones } = buildBudgetAndMilestones(
    input.targetBudget,
    input.guestCount,
    input.date,
    input.city,
    ts
  );
  const vendors = buildVendors(input.targetBudget, input.city, ts);
  const { macroTasks, dayOfActivities } = buildTimelineTasks(input.date, ts);
  const { guests, zones } = buildRosterAndZones(input.guestCount, ts);

  const sponsorships: SponsorshipInflow[] = input.type === 'community' ? [
    {
      id: `sp-${ts}-1`,
      sponsorName: 'Lead Ecosystem Sponsor',
      tier: 'gold',
      amount: Math.round(input.targetBudget * 0.3),
      status: 'confirmed',
      contactPerson: 'Partnerships Team',
      deliverablesSummary: 'Premier stage recognition',
    },
  ] : [];

  return {
    event,
    budgetItems,
    paymentMilestones,
    sponsorships,
    vendors,
    macroTasks,
    dayOfActivities,
    guests,
    zones,
    taxRatePercent: 18,
    includeTaxInTotals: true,
  };
}
