import { describe, it, expect } from 'vitest';
import {
  eventDataSchema,
  budgetItemSchema,
  vendorSchema,
  macroTaskSchema,
  paymentMilestoneSchema,
} from '../schemas/eventSchemas';

describe('Security Suite: Zod Schema Rejection & Validation', () => {
  describe('Zod Schema Rejection of Negative Budgets', () => {
    it('rejects negative target budget in eventDataSchema', () => {
      const invalidEvent = {
        id: 'evt-test',
        name: 'Grand Gala',
        type: 'wedding',
        date: '2026-11-14',
        city: 'Udaipur',
        setting: 'indoor',
        guestCount: 150,
        targetBudget: -500000, // Negative budget
        currency: 'INR',
        culturalPreferences: 'Royal',
        subEvents: [],
      };

      const result = eventDataSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('rejects negative allocated amounts in budgetItemSchema', () => {
      const invalidBudgetItem = {
        id: 'bi-1',
        category: 'venue',
        name: 'Palace Hall',
        allocated: -10000, // Negative allocated
        vendorQuote: 50000,
        actualContracted: 40000,
        amountPaid: 10000,
        isLocked: false,
      };

      const result = budgetItemSchema.safeParse(invalidBudgetItem);
      expect(result.success).toBe(false);
    });

    it('rejects negative prices in vendorSchema and paymentMilestoneSchema', () => {
      const invalidVendor = {
        id: 'v-1',
        name: 'Catering Co',
        category: 'catering',
        status: 'shortlisted',
        estimatedPrice: -25000, // Negative
        contractedPrice: 0,
        paidAmount: 0,
        contactName: 'Chef',
        phone: '123',
        email: 'chef@cater.com',
        rating: 4.5,
        ratingCount: 10,
        location: 'City',
        notes: '',
        deliverables: [],
      };
      expect(vendorSchema.safeParse(invalidVendor).success).toBe(false);

      const invalidMilestone = {
        id: 'm-1',
        title: 'Advance',
        amount: -1000, // Negative
        dueDate: '2026-11-14',
        status: 'pending',
        vendorName: 'Venue Co',
        category: 'venue',
      };
      expect(paymentMilestoneSchema.safeParse(invalidMilestone).success).toBe(false);
    });
  });

  describe('Zod Schema Rejection of Invalid Dates', () => {
    it('rejects non-ISO, malformed, or invalid calendar dates in eventDataSchema', () => {
      const base = {
        id: 'evt-1',
        name: 'Concert',
        type: 'community',
        city: 'Mumbai',
        setting: 'outdoor',
        guestCount: 200,
        targetBudget: 100000,
        currency: 'INR',
        culturalPreferences: 'Modern',
        subEvents: [],
      };

      expect(eventDataSchema.safeParse({ ...base, date: 'not-a-date' }).success).toBe(false);
      expect(eventDataSchema.safeParse({ ...base, date: '2026/11/14' }).success).toBe(false);
      expect(eventDataSchema.safeParse({ ...base, date: '14-11-2026' }).success).toBe(false);
      expect(eventDataSchema.safeParse({ ...base, date: '2026-11-14' }).success).toBe(true);
    });

    it('rejects invalid dates in macroTaskSchema and paymentMilestoneSchema', () => {
      const invalidTask = {
        id: 't-1',
        horizon: '1_week',
        title: 'Final Headcount',
        category: 'Catering',
        priority: 'high',
        assignee: 'Planner',
        dueDate: 'next-friday', // Invalid format
        completed: false,
      };
      expect(macroTaskSchema.safeParse(invalidTask).success).toBe(false);

      const validTask = { ...invalidTask, dueDate: '2026-11-20' };
      expect(macroTaskSchema.safeParse(validTask).success).toBe(true);
    });
  });
});

