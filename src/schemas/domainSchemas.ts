import { z } from 'zod';
import { sanitizeText } from '../utils/security';

export const sanitizedString = z.string().transform((val) => sanitizeText(val));

export const isoDateString = z.string().refine(
  (val) => /^\d{4}-\d{2}-\d{2}$/.test(val) && !isNaN(Date.parse(val)),
  { message: 'Invalid date format (must be valid YYYY-MM-DD)' }
);

export const subEventSchema = z.object({
  id: z.string(),
  name: sanitizedString,
  date: isoDateString,
  startTime: z.string(),
  endTime: z.string(),
  venueName: sanitizedString,
  guestCount: z.number().nonnegative(),
  notes: sanitizedString.optional(),
});

export const budgetItemSchema = z.object({
  id: z.string(),
  category: z.enum(['venue', 'catering', 'decor', 'av_photo', 'entertainment', 'logistics', 'buffer']),
  name: sanitizedString,
  allocated: z.number().nonnegative(),
  vendorQuote: z.number().nonnegative(),
  actualContracted: z.number().nonnegative(),
  amountPaid: z.number().nonnegative(),
  isLocked: z.boolean(),
  notes: sanitizedString.optional(),
  vendorId: z.string().optional(),
});

export const paymentMilestoneSchema = z.object({
  id: z.string(),
  title: sanitizedString,
  amount: z.number().nonnegative(),
  dueDate: isoDateString,
  status: z.enum(['paid', 'partial', 'overdue', 'pending']),
  vendorId: z.string().optional(),
  vendorName: sanitizedString,
  category: z.enum(['venue', 'catering', 'decor', 'av_photo', 'entertainment', 'logistics', 'buffer']),
});

export const sponsorshipInflowSchema = z.object({
  id: z.string(),
  sponsorName: sanitizedString,
  tier: z.enum(['platinum', 'gold', 'silver', 'community']),
  amount: z.number().nonnegative(),
  status: z.enum(['pledged', 'confirmed', 'received']),
  contactPerson: sanitizedString,
  deliverablesSummary: sanitizedString,
});

export const vendorSchema = z.object({
  id: z.string(),
  name: sanitizedString,
  category: z.enum(['venue', 'catering', 'decor', 'av_photo', 'entertainment', 'logistics', 'buffer']),
  status: z.enum(['shortlisted', 'contacted', 'quote_received', 'contract_signed', 'paid']),
  estimatedPrice: z.number().nonnegative(),
  contractedPrice: z.number().nonnegative(),
  paidAmount: z.number().nonnegative(),
  contactName: sanitizedString,
  phone: sanitizedString,
  email: z.string().email().or(z.string()),
  rating: z.number().min(0).max(5),
  ratingCount: z.number().nonnegative(),
  location: sanitizedString,
  notes: sanitizedString,
  deliverables: z.array(sanitizedString),
  quoteItems: z.array(z.object({
    title: sanitizedString,
    cost: z.number().nonnegative(),
  })).optional(),
});

export const macroTaskSchema = z.object({
  id: z.string(),
  horizon: z.enum(['6_months', '3_months', '1_month', '1_week', 'day_before']),
  title: sanitizedString,
  category: sanitizedString,
  priority: z.enum(['critical', 'high', 'normal']),
  assignee: sanitizedString,
  dueDate: isoDateString,
  completed: z.boolean(),
  notes: sanitizedString.optional(),
});

export const dayOfActivitySchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  durationMinutes: z.number().positive(),
  title: sanitizedString,
  locationZone: sanitizedString,
  poc: sanitizedString,
  notes: sanitizedString.optional(),
  completed: z.boolean().optional(),
  subEventId: z.string().optional(),
});

export const guestSchema = z.object({
  id: z.string(),
  name: sanitizedString,
  email: sanitizedString.optional(),
  phone: sanitizedString.optional(),
  group: z.enum(['bride', 'groom', 'vip', 'general', 'speaker_sponsor']),
  rsvp: z.enum(['confirmed', 'pending', 'declined']),
  plusOnes: z.number().nonnegative(),
  dietary: z.enum(['regular', 'vegetarian', 'jain', 'vegan', 'gluten_free', 'nut_free']),
  tableOrZoneId: z.string().optional(),
  notes: sanitizedString.optional(),
});

export const zoneCapacitySchema = z.object({
  id: z.string(),
  name: sanitizedString,
  maxCapacity: z.number().positive(),
  assignedCount: z.number().nonnegative(),
  type: z.enum(['table', 'zone', 'lounge']),
});

