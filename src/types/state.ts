import { EventData } from './event';
import { BudgetItem, PaymentMilestone, SponsorshipInflow } from './budget';
import { Vendor } from './vendor';
import { MacroTask, DayOfActivity } from './timeline';
import { Guest, ZoneCapacity } from './guest';

export interface EventWorkspaceState {
  event: EventData;
  budgetItems: BudgetItem[];
  paymentMilestones: PaymentMilestone[];
  sponsorships: SponsorshipInflow[];
  vendors: Vendor[];
  macroTasks: MacroTask[];
  dayOfActivities: DayOfActivity[];
  guests: Guest[];
  zones: ZoneCapacity[];
  taxRatePercent: number;
  includeTaxInTotals: boolean;
}

export type ActiveTab = 
  | 'dashboard'
  | 'budget'
  | 'timeline'
  | 'vendors'
  | 'ideation'
  | 'guests';
