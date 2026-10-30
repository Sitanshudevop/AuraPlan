import { z } from 'zod';
import {
  sanitizedString,
  isoDateString,
  subEventSchema,
  budgetItemSchema,
  paymentMilestoneSchema,
  sponsorshipInflowSchema,
  vendorSchema,
  macroTaskSchema,
  dayOfActivitySchema,
  guestSchema,
  zoneCapacitySchema,
} from './domainSchemas';

export {
  sanitizedString,
  isoDateString,
  subEventSchema,
  budgetItemSchema,
  paymentMilestoneSchema,
  sponsorshipInflowSchema,
  vendorSchema,
  macroTaskSchema,
  dayOfActivitySchema,
  guestSchema,
  zoneCapacitySchema,
};

export const eventDataSchema = z.object({
  id: z.string(),
  name: sanitizedString,
  type: z.enum(['wedding', 'birthday', 'community']),
  date: isoDateString,
  city: sanitizedString,
  setting: z.enum(['indoor', 'outdoor', 'hybrid']),
  guestCount: z.number().positive(),
  targetBudget: z.number().positive(),
  currency: z.enum(['INR', 'USD']),
  culturalPreferences: sanitizedString,
  subEvents: z.array(subEventSchema),
  notes: sanitizedString.optional(),
  cakeTier: sanitizedString.optional(),
  vibePlaylist: sanitizedString.optional(),
  favorBudget: z.number().nonnegative().optional(),
  speakerTracks: z.array(sanitizedString).optional(),
  volunteerRoles: z.array(sanitizedString).optional(),
});

export const eventWorkspaceStateSchema = z.object({
  event: eventDataSchema,
  budgetItems: z.array(budgetItemSchema),
  paymentMilestones: z.array(paymentMilestoneSchema),
  sponsorships: z.array(sponsorshipInflowSchema),
  vendors: z.array(vendorSchema),
  macroTasks: z.array(macroTaskSchema),
  dayOfActivities: z.array(dayOfActivitySchema),
  guests: z.array(guestSchema),
  zones: z.array(zoneCapacitySchema),
  taxRatePercent: z.number().nonnegative(),
  includeTaxInTotals: z.boolean(),
});

export const persistedStateSchema = z.object({
  version: z.literal(1),
  activePresetId: z.string(),
  states: z.record(eventWorkspaceStateSchema),
  theme: z.enum(['light', 'dark']),
});
