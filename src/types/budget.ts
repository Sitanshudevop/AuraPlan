import type { CategoryKey } from '../constants';

export type BudgetCategory = CategoryKey;

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  allocated: number;
  vendorQuote: number;
  actualContracted: number;
  amountPaid: number;
  isLocked: boolean;
  notes?: string;
  vendorId?: string;
}

export type MilestoneStatus = 'paid' | 'partial' | 'overdue' | 'pending';

export interface PaymentMilestone {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
  vendorId?: string;
  vendorName: string;
  category: BudgetCategory;
}

export type SponsorshipTier = 'platinum' | 'gold' | 'silver' | 'community';
export type SponsorshipStatus = 'pledged' | 'confirmed' | 'received';

export interface SponsorshipInflow {
  id: string;
  sponsorName: string;
  tier: SponsorshipTier;
  amount: number;
  status: SponsorshipStatus;
  contactPerson: string;
  deliverablesSummary: string;
}
