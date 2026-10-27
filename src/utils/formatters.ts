import { Currency } from '../types/event';

export const USD_TO_INR_RATE = 83.5;

/**
 * Formats a numeric currency value in either INR (Lakhs/Crores style) or USD.
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const rounded = Math.round(amount);
  if (currency === 'INR') {
    return '₹' + rounded.toLocaleString('en-IN');
  }
  return '$' + rounded.toLocaleString('en-US');
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

/**
 * Calculates days remaining until target event date.
 */
export function getDaysRemaining(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Formats ISO date string to a human readable format e.g. "Nov 14, 2026"
 */
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
