/**
 * Pure calculation utilities for the Smart Budget Engine.
 */

export function calculateAllocationPercentage(allocated: number, totalBudget: number): number {
  if (totalBudget <= 0) return 0;
  return Number(((allocated / totalBudget) * 100).toFixed(1));
}

export function calculateGstTax(baseAmount: number, taxRatePercent: number): number {
  if (baseAmount <= 0 || taxRatePercent <= 0) return 0;
  return Math.round(baseAmount * (taxRatePercent / 100));
}

export function calculateTotalWithTax(baseAmount: number, taxRatePercent: number): number {
  return baseAmount + calculateGstTax(baseAmount, taxRatePercent);
}

export function calculatePerPlateTotal(perPlateRate: number, guestCount: number): number {
  return Math.max(0, Math.round(perPlateRate * Math.max(0, guestCount)));
}

export function calculatePerHeadBudget(totalBudget: number, guestCount: number): number {
  if (guestCount <= 0) return 0;
  return Math.round(totalBudget / guestCount);
}

