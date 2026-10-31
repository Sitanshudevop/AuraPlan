import { describe, it, expect } from 'vitest';
import {
  calculateAllocationPercentage,
  calculateGstTax,
  calculateTotalWithTax,
  calculatePerPlateTotal,
  calculatePerHeadBudget,
} from '../features/budget/budgetMath';
import { formatCurrency, convertCurrency } from '../utils/formatters';

describe('Budget Math & Formatting Calculations', () => {
  describe('Category Allocation Percentages', () => {
    it('calculates exact category allocation percentage of target budget', () => {
      const targetBudget = 1000000;
      const venueAllocated = 400000;
      const cateringAllocated = 250000;
      const bufferAllocated = 80000;

      expect(calculateAllocationPercentage(venueAllocated, targetBudget)).toBe(40.0);
      expect(calculateAllocationPercentage(cateringAllocated, targetBudget)).toBe(25.0);
      expect(calculateAllocationPercentage(bufferAllocated, targetBudget)).toBe(8.0);
    });

    it('handles zero budget and edge cases gracefully without NaN', () => {
      expect(calculateAllocationPercentage(50000, 0)).toBe(0);
      expect(calculateAllocationPercentage(0, 500000)).toBe(0);
      // Handles repeating fractions to 1 decimal place
      expect(calculateAllocationPercentage(33333, 100000)).toBe(33.3);
    });
  });

  describe('GST Tax Calculation', () => {
    it('calculates statutory GST amounts for 5%, 12%, 18%, and 28% brackets', () => {
      const baseCost = 100000;

      expect(calculateGstTax(baseCost, 5)).toBe(5000);
      expect(calculateGstTax(baseCost, 12)).toBe(12000);
      expect(calculateGstTax(baseCost, 18)).toBe(18000);
      expect(calculateGstTax(baseCost, 28)).toBe(28000);
    });

    it('computes gross total including statutory tax correctly', () => {
      const baseCost = 250000;
      const rate = 18;
      const expectedTax = 45000;

      expect(calculateGstTax(baseCost, rate)).toBe(expectedTax);
      expect(calculateTotalWithTax(baseCost, rate)).toBe(295000);
    });

    it('returns zero tax for non-positive amounts or rates', () => {
      expect(calculateGstTax(0, 18)).toBe(0);
      expect(calculateGstTax(100000, 0)).toBe(0);
      expect(calculateGstTax(-50000, 18)).toBe(0);
    });
  });

  describe('Per-Plate Guest Scaling & Currency Formatters', () => {
    it('scales per-plate dining costs proportionally with guest count', () => {
      const perPlateRate = 1800;
      const guestCount = 250;

      const totalCatering = calculatePerPlateTotal(perPlateRate, guestCount);
      expect(totalCatering).toBe(450000);

      const scaledTotal = calculatePerPlateTotal(perPlateRate, 300);
      expect(scaledTotal).toBe(540000);
    });

    it('calculates per-head budget metric across all event domains', () => {
      const totalBudget = 1850000;
      const guests = 250;
      expect(calculatePerHeadBudget(totalBudget, guests)).toBe(7400);
      expect(calculatePerHeadBudget(totalBudget, 0)).toBe(0);
    });

    it('formats currency with tabular figures in both INR and USD', () => {
      expect(formatCurrency(1850000, 'INR')).toBe('₹18,50,000');
      expect(formatCurrency(25000, 'USD', 'USD')).toBe('$25,000');
      expect(formatCurrency(83500, 'USD')).toBe('$1,000');
      expect(convertCurrency(83500, 'INR', 'USD')).toBe(1000);
      expect(convertCurrency(1000, 'USD', 'INR')).toBe(83500);
    });
  });
});
