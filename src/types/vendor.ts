import { BudgetCategory } from './budget';

export type VendorStatus =
  | 'shortlisted'
  | 'contacted'
  | 'quote_received'
  | 'contract_signed'
  | 'paid';

export interface QuoteItem {
  title: string;
  cost: number;
}

export interface Vendor {
  id: string;
  name: string;
  category: BudgetCategory;
  status: VendorStatus;
  estimatedPrice: number;
  contractedPrice: number;
  paidAmount: number;
  contactName: string;
  phone: string;
  email: string;
  rating: number;
  ratingCount: number;
  location: string;
  notes: string;
  deliverables: string[];
  quoteItems?: QuoteItem[];
}

export interface VendorVetQuestions {
  whatsappOutreachScript: string;
  emailOutreachScript: string;
  vettingQuestions: string[];
  hiddenCostRedFlags: string[];
}
