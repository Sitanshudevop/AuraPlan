import { z } from 'zod';
import { sanitizeText } from '../utils/security';

const sanitizedString = z.string().transform((val) => sanitizeText(val));

const budgetCategoryEnum = z.enum([
  'venue',
  'catering',
  'decor',
  'av_photo',
  'entertainment',
  'logistics',
  'buffer',
]);

const colorSwatchSchema = z.object({
  name: sanitizedString,
  hex: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  role: sanitizedString,
});

const decorConceptSchema = z.object({
  id: z.string(),
  title: sanitizedString,
  description: sanitizedString,
  estimatedCost: z.number().nonnegative(),
  timelineTask: sanitizedString,
  category: z.enum(['decor', 'av_photo', 'venue']),
});

const menuItemConceptSchema = z.object({
  id: z.string(),
  name: sanitizedString,
  category: sanitizedString,
  description: sanitizedString,
  estimatedCostPerHead: z.number().nonnegative(),
});

const engagementActivitySchema = z.object({
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

const budgetAdjustmentSchema = z.object({
  category: budgetCategoryEnum,
  categoryLabel: sanitizedString,
  oldAllocated: z.number().nonnegative(),
  newAllocated: z.number().nonnegative(),
  diff: z.number(),
  reason: sanitizedString,
});

const newVendorItemSchema = z.object({
  id: z.string(),
  name: sanitizedString,
  category: budgetCategoryEnum,
  estimatedCost: z.number().nonnegative(),
  justification: sanitizedString,
});

const timelineModItemSchema = z.object({
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

const assistantTaskActionPayloadSchema = z.object({
  title: sanitizedString,
  horizon: z.enum(['6_months', '3_months', '1_month', '1_week', 'day_before']),
  category: sanitizedString,
  priority: z.enum(['critical', 'high', 'normal']),
});

const assistantBudgetActionPayloadSchema = z.object({
  name: sanitizedString,
  category: budgetCategoryEnum,
  allocated: z.number().nonnegative(),
});

const assistantVendorActionPayloadSchema = z.object({
  name: sanitizedString,
  category: budgetCategoryEnum,
  estimatedPrice: z.number().nonnegative(),
  deliverables: z.array(sanitizedString),
});

const assistantActionSchema = z.object({
  type: z.enum(['add_task', 'add_budget', 'add_vendor']),
  label: sanitizedString,
  payload: z.object({
    task: assistantTaskActionPayloadSchema.optional(),
    budget: assistantBudgetActionPayloadSchema.optional(),
    vendor: assistantVendorActionPayloadSchema.optional(),
  }),
});

export const rawAssistantResponseSchema = z.object({
  content: sanitizedString,
  suggestedActions: z.array(assistantActionSchema).optional(),
});
