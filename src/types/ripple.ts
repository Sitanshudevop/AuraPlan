import { BudgetCategory } from './budget';

export type RipplePresetId =
  | 'guest_surge_25'
  | 'cut_budget_15'
  | 'monsoon_warning'
  | 'inflation_spike_20'
  | 'custom';

export interface BudgetAdjustment {
  category: BudgetCategory;
  categoryLabel: string;
  oldAllocated: number;
  newAllocated: number;
  diff: number;
  reason: string;
}

export interface NewVendorItem {
  id: string;
  name: string;
  category: BudgetCategory;
  estimatedCost: number;
  justification: string;
}

export interface TimelineModItem {
  id: string;
  title: string;
  action: 'add' | 'shift' | 'modify';
  detail: string;
  horizonOrDayOf: string;
}

export interface RippleDiffResult {
  scenarioTitle: string;
  scenarioDescription: string;
  budgetAdjustments: BudgetAdjustment[];
  newVendors: NewVendorItem[];
  timelineModifications: TimelineModItem[];
  netBudgetImpact: number;
  guestCountImpact: number;
  summaryRationale: string;
}
