import { describe, it, expect } from 'vitest';
import { getDaysRemaining, parseDateComponents, formatDate } from '../utils/formatters';

describe('Date Calculations & Timezone/DST Resilience (F5)', () => {
  describe('parseDateComponents', () => {
    it('parses valid YYYY-MM-DD date strings', () => {
      expect(parseDateComponents('2026-11-14')).toEqual({ year: 2026, month: 11, day: 14 });
      expect(parseDateComponents('2028-02-29')).toEqual({ year: 2028, month: 2, day: 29 });
    });

    it('parses ISO date-time strings by extracting calendar date components', () => {
      expect(parseDateComponents('2026-11-14T23:59:59.999Z')).toEqual({ year: 2026, month: 11, day: 14 });
      expect(parseDateComponents('2026-05-01T00:00:00.000Z')).toEqual({ year: 2026, month: 5, day: 1 });
    });

    it('rejects invalid calendar dates and malformed strings by returning null', () => {
      expect(parseDateComponents('')).toBeNull();
      expect(parseDateComponents('invalid-date')).toBeNull();
      expect(parseDateComponents('2026-02-29')).toBeNull(); // Non-leap year
      expect(parseDateComponents('2026-04-31')).toBeNull(); // April has 30 days
      expect(parseDateComponents('2026-13-01')).toBeNull(); // Invalid month
    });
  });

  describe('getDaysRemaining (Calendar Component Arithmetic)', () => {
    it('returns 0 when target is today', () => {
      const nowMidnight = new Date(2026, 9, 31, 0, 0, 0); // Oct 31, 2026 00:00:00
      const nowNight = new Date(2026, 9, 31, 23, 59, 59); // Oct 31, 2026 23:59:59

      expect(getDaysRemaining('2026-10-31', nowMidnight)).toBe(0);
      expect(getDaysRemaining('2026-10-31', nowNight)).toBe(0);
    });

    it('returns 1 when target is tomorrow, identical at 00:00 and 23:59 local', () => {
      const nowMidnight = new Date(2026, 9, 31, 0, 0, 0);
      const nowNight = new Date(2026, 9, 31, 23, 59, 59);

      expect(getDaysRemaining('2026-11-01', nowMidnight)).toBe(1);
      expect(getDaysRemaining('2026-11-01', nowNight)).toBe(1);
    });

    it('returns 0 when target is yesterday or in the past', () => {
      const now = new Date(2026, 9, 31, 12, 0, 0);

      expect(getDaysRemaining('2026-10-30', now)).toBe(0);
      expect(getDaysRemaining('2020-01-01', now)).toBe(0);
    });

    it('handles month boundaries correctly (October 31 to November 1)', () => {
      const now = new Date(2026, 9, 31, 15, 30, 0);
      expect(getDaysRemaining('2026-11-01', now)).toBe(1);
      expect(getDaysRemaining('2026-11-14', now)).toBe(14);
    });

    it('handles year boundaries correctly (December 31 to January 1)', () => {
      const now = new Date(2026, 11, 31, 12, 0, 0);
      expect(getDaysRemaining('2027-01-01', now)).toBe(1);
      expect(getDaysRemaining('2027-01-10', now)).toBe(10);
    });

    it('handles leap day transitions accurately in leap years', () => {
      const nowFeb28 = new Date(2028, 1, 28, 12, 0, 0);
      expect(getDaysRemaining('2028-02-29', nowFeb28)).toBe(1);
      expect(getDaysRemaining('2028-03-01', nowFeb28)).toBe(2);
    });

    it('is completely immune to 23-hour and 25-hour Daylight Saving Time transitions', () => {
      // US Spring Forward 2026: Sunday, March 8, 2026 (23-hour day)
      const beforeSpringForward = new Date(2026, 2, 7, 12, 0, 0); // March 7
      expect(getDaysRemaining('2026-03-09', beforeSpringForward)).toBe(2);

      // US Fall Back 2026: Sunday, November 1, 2026 (25-hour day)
      const beforeFallBack = new Date(2026, 9, 31, 12, 0, 0); // October 31
      expect(getDaysRemaining('2026-11-02', beforeFallBack)).toBe(2);

      // EU Spring Forward 2026: Sunday, March 29, 2026
      const beforeEuSpring = new Date(2026, 2, 28, 12, 0, 0);
      expect(getDaysRemaining('2026-03-30', beforeEuSpring)).toBe(2);
    });

    it('accepts ISO strings with full time components without off-by-one shifts', () => {
      const now = new Date(2026, 9, 31, 12, 0, 0);
      expect(getDaysRemaining('2026-11-14T00:00:00.000Z', now)).toBe(14);
      expect(getDaysRemaining('2026-11-14T23:59:59.999Z', now)).toBe(14);
    });

    it('returns 0 for invalid or unparseable input strings', () => {
      expect(getDaysRemaining('')).toBe(0);
      expect(getDaysRemaining('invalid-date')).toBe(0);
      expect(getDaysRemaining('not-a-date-at-all')).toBe(0);
    });
  });

  describe('formatDate (Timezone Safe Formatting)', () => {
    it('formats calendar dates consistently without off-by-one date shifts', () => {
      expect(formatDate('2026-11-14')).toBe('Nov 14, 2026');
      expect(formatDate('2026-11-14T00:00:00.000Z')).toBe('Nov 14, 2026');
    });

    it('supports custom locales such as en-GB', () => {
      const formatted = formatDate('2026-11-14', 'en-GB');
      expect(formatted).toBe('14 Nov 2026');
    });

    it('returns raw string for unparseable input', () => {
      expect(formatDate('invalid-string')).toBe('invalid-string');
    });
  });
});

