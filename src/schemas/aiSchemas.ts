import { z } from 'zod';
import { sanitizeText } from '../utils/security';

const sanitizedString = z.string().transform((val) => sanitizeText(val));

export const colorSwatchSchema = z.object({
  name: sanitizedString,
  hex: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  role: sanitizedString,
});

export const decorConceptSchema = z.object({
  id: z.string(),
  title: sanitizedString,
  description: sanitizedString,
  estimatedCost: z.number().nonnegative(),
  timelineTask: sanitizedString,
  category: z.enum(['decor', 'av_photo', 'venue']),
});

export const menuItemConceptSchema = z.object({
  id: z.string(),
  name: sanitizedString,
  category: sanitizedString,
  description: sanitizedString,
  estimatedCostPerHead: z.number().nonnegative(),
});

export const engagementActivitySchema = z.object({
  id: z.string(),
  title: sanitizedString,
  description: sanitizedString,
  estimatedCost: z.number().nonnegative(),
  timelineTask: sanitizedString,
  durationMinutes: z.number().positive(),
});

export const themeIdeaSchema = z.object({
  id: z.string(),
  title: sanitizedString,
  vibe: sanitizedString,
  description: sanitizedString,
  colors: z.array(colorSwatchSchema),
  decorConcepts: z.array(decorConceptSchema),
  menuItems: z.array(menuItemConceptSchema),
  activities: z.array(engagementActivitySchema),
});

export const budgetAdjustmentSchema = z.object({
  category: z.enum(['venue', 'catering', 'decor', 'av_photo', 'entertainment', 'logistics', 'buffer']),
  categoryLabel: sanitizedString,
  oldAllocated: z.number().nonnegative(),
  newAllocated: z.number().nonnegative(),
  diff: z.number(),
  reason: sanitizedString,
});

export const newVendorItemSchema = z.object({
  id: z.string(),
  name: sanitizedString,
  category: z.enum(['venue', 'catering', 'decor', 'av_photo', 'entertainment', 'logistics', 'buffer']),
  estimatedCost: z.number().nonnegative(),
  justification: sanitizedString,
});

export const timelineModItemSchema = z.object({
  id: z.string(),
  title: sanitizedString,
  action: z.enum(['add', 'shift', 'modify']),
  detail: sanitizedString,
  horizonOrDayOf: sanitizedString,
});

export const rippleDiffResultSchema = z.object({
  scenarioTitle: sanitizedString,
  scenarioDescription: sanitizedString,
  budgetAdjustments: z.array(budgetAdjustmentSchema),
  newVendors: z.array(newVendorItemSchema),
  timelineModifications: z.array(timelineModItemSchema),
  netBudgetImpact: z.number(),
  guestCountImpact: z.number(),
  summaryRationale: sanitizedString,
});

export const vendorVetSchema = z.object({
  whatsappOutreachScript: sanitizedString,
  emailOutreachScript: sanitizedString,
  vettingQuestions: z.array(sanitizedString),
  hiddenCostRedFlags: z.array(sanitizedString),
});
