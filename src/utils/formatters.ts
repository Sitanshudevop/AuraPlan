import { Currency } from '../types/event';
import { CATEGORY_LABELS } from '../constants';

export const USD_TO_INR_RATE = 83.5;

/**
 * Formats a numeric currency value in either INR (Lakhs/Crores style) or USD.
 * When converting from INR to USD, applies the accurate market exchange rate (1 USD = ₹83.50).
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'INR',
  fromCurrency: Currency = 'INR'
): string {
  let val = amount;
  if (fromCurrency === 'INR' && currency === 'USD') {
    val = amount / USD_TO_INR_RATE;
  } else if (fromCurrency === 'USD' && currency === 'INR') {
    val = amount * USD_TO_INR_RATE;
  }

  if (currency === 'INR') {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  if (val > 0 && val < 10 && val % 1 !== 0) {
    return '$' + val.toFixed(2);
  }
  return '$' + Math.round(val).toLocaleString('en-US');
}

/**
 * Converts an amount from one currency to another for dynamic display.
 */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  if (from === 'INR' && to === 'USD') {
    return Math.round(amount / USD_TO_INR_RATE);
  }
  return Math.round(amount * USD_TO_INR_RATE);
}

/**
 * Formats percentages to 1 decimal place with tabular-friendly display.
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/**
 * Safely parses calendar components (year, month, day) from YYYY-MM-DD or ISO date-time strings.
 */
export function parseDateComponents(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (!isValidCalendarDate(year, month, day)) return null;
  return { year, month, day };
}

/**
 * Calculates days remaining until target event date as an integer.
 * - Identical result at any hour of the day (00:00 to 23:59)
 * - Immune to timezone offsets and 23/25-hour Daylight Saving Time transitions
 * - Returns 0 if target is today or in the past
 * - Returns 0 for invalid inputs
 *
 * @param targetDateStr - Target calendar date string (YYYY-MM-DD or ISO string)
 * @param now - Reference date for calculation (defaults to current Date)
 */
export function getDaysRemaining(targetDateStr: string, now: Date = new Date()): number {
  const target = parseDateComponents(targetDateStr);
  if (!target) return 0;

  const targetUtc = Date.UTC(target.year, target.month - 1, target.day);
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round((targetUtc - nowUtc) / 86400000);
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Formats a calendar date string (YYYY-MM-DD or ISO string) to human-readable format.
 * Prevents UTC midnight off-by-one shifts in negative timezone offsets.
 */
export function formatDate(dateStr: string, locale = 'en-US'): string {
  try {
    const comp = parseDateComponents(dateStr);
    if (!comp) return dateStr;
    const d = new Date(comp.year, comp.month - 1, comp.day);
    return d.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  ...CATEGORY_LABELS,
};

export function formatCategory(cat: string): string {
  const key = cat.toLowerCase().trim();
  if (CATEGORY_DISPLAY_MAP[key]) return CATEGORY_DISPLAY_MAP[key];
  return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ');
}
