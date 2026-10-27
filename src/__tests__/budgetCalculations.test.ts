import { describe, it, expect } from 'vitest';
import {
  calculateAllocationPercentage,
  calculateGstTax,
  calculateTotalWithTax,
  calculatePerPlateTotal,
  calculatePerHeadBudget,
} from '../features/budget/budgetMath';
import { formatCurrency, convertCurrency } from '../utils/formatters';
import { workspaceReducer } from '../context/workspaceReducer';
import { EventWorkspaceState } from '../types/state';
import { weddingPreset } from '../data/weddingPreset';

describe('Budget Calculations & Financial Math', () => {
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

  describe('Locked-Category Auto-Rebalancing', () => {
    it('preserves locked category allocations while distributing remaining target to unlocked categories', () => {
      const state: EventWorkspaceState = {
        ...weddingPreset,
        event: { ...weddingPreset.event, targetBudget: 1000000 },
        budgetItems: [
          {
            id: 'b-venue',
            category: 'venue',
            name: 'Palace Venue',
            allocated: 400000,
            vendorQuote: 400000,
            actualContracted: 400000,
            amountPaid: 200000,
            isLocked: true, // LOCKED: should not change
          },
          {
            id: 'b-catering',
            category: 'catering',
            name: 'Royal Catering',
            allocated: 200000,
            vendorQuote: 200000,
            actualContracted: 0,
            amountPaid: 0,
            isLocked: false,
          },
          {
            id: 'b-decor',
            category: 'decor',
            name: 'Mandap Florals',
            allocated: 100000,
            vendorQuote: 100000,
            actualContracted: 0,
            amountPaid: 0,
            isLocked: false,
          },
        ],
      };

      const balancedState = workspaceReducer(state, { type: 'AUTO_BALANCE_BUDGET' });

      // 1. Locked item must be completely intact
      const lockedVenue = balancedState.budgetItems.find((b) => b.id === 'b-venue');
      expect(lockedVenue?.allocated).toBe(400000);

      // 2. Unlocked items (catering:decor 200k:100k = 2:1 ratio) should split remaining 600k (400k & 200k)
      const rebalancedCatering = balancedState.budgetItems.find((b) => b.id === 'b-catering');
      const rebalancedDecor = balancedState.budgetItems.find((b) => b.id === 'b-decor');
      expect(rebalancedCatering?.allocated).toBe(400000);
      expect(rebalancedDecor?.allocated).toBe(200000);

      // 3. Sum of all items must equal targetBudget exactly
      const totalAllocated = balancedState.budgetItems.reduce((sum, b) => sum + b.allocated, 0);
      expect(totalAllocated).toBe(1000000);
    });

    it('does not mutate allocations when all categories are locked', () => {
      const state: EventWorkspaceState = {
        ...weddingPreset,
        event: { ...weddingPreset.event, targetBudget: 500000 },
        budgetItems: [
          { id: '1', category: 'venue', name: 'Venue', allocated: 300000, vendorQuote: 300000, actualContracted: 0, amountPaid: 0, isLocked: true },
          { id: '2', category: 'catering', name: 'Food', allocated: 200000, vendorQuote: 200000, actualContracted: 0, amountPaid: 0, isLocked: true },
        ],
      };

      const result = workspaceReducer(state, { type: 'AUTO_BALANCE_BUDGET' });
      expect(result.budgetItems[0].allocated).toBe(300000);
      expect(result.budgetItems[1].allocated).toBe(200000);
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

  describe('Per-Plate Guest Scaling', () => {
    it('scales per-plate dining costs proportionally with guest count', () => {
      const perPlateRate = 1800; // ₹1,800 per cover
      const guestCount = 250;

      const totalCatering = calculatePerPlateTotal(perPlateRate, guestCount);
      expect(totalCatering).toBe(450000);

      // Scaling guest count to 300
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
      expect(formatCurrency(25000, 'USD')).toBe('$25,000');
      expect(convertCurrency(83500, 'INR', 'USD')).toBe(1000);
      expect(convertCurrency(1000, 'USD', 'INR')).toBe(83500);
    });
  });

  describe('Vendor Actual-Cost Sync', () => {
    it('synchronizes contracted vendor price to corresponding budget category actualContracted when contract is signed', () => {
      const state: EventWorkspaceState = {
        ...weddingPreset,
        budgetItems: [
          { id: 'bi-decor', category: 'decor', name: 'Decor', allocated: 280000, vendorQuote: 280000, actualContracted: 0, amountPaid: 0, isLocked: false },
        ],
        vendors: [
          {
            id: 'v-decor-1', name: 'Royal Flora', category: 'decor', status: 'quote_received',
            estimatedPrice: 300000, contractedPrice: 275000, paidAmount: 50000,
            contactName: 'Ananya', phone: '123', email: 'a@flora.in', rating: 4.9, ratingCount: 18,
            location: 'Udaipur', notes: '', deliverables: [],
          },
        ],
      };

      // Vendor signs contract
      const nextState = workspaceReducer(state, {
        type: 'UPDATE_VENDOR',
        payload: { id: 'v-decor-1', partial: { status: 'contract_signed' } },
      });

      const updatedDecorBudget = nextState.budgetItems.find((b) => b.category === 'decor');
      expect(updatedDecorBudget?.actualContracted).toBe(275000);
    });

    it('aggregates multiple signed vendor contracts in the same category', () => {
      const state: EventWorkspaceState = {
        ...weddingPreset,
        budgetItems: [
          { id: 'bi-av', category: 'av_photo', name: 'AV & Photo', allocated: 300000, vendorQuote: 300000, actualContracted: 0, amountPaid: 0, isLocked: false },
        ],
        vendors: [
          {
            id: 'v-photo', name: 'Royal Lens', category: 'av_photo', status: 'contract_signed',
            estimatedPrice: 180000, contractedPrice: 175000, paidAmount: 50000,
            contactName: 'Sunil', phone: '123', email: 's@lens.com', rating: 5, ratingCount: 10,
            location: 'City', notes: '', deliverables: [],
          },
          {
            id: 'v-sound', name: 'Acoustic Sound', category: 'av_photo', status: 'contract_signed',
            estimatedPrice: 100000, contractedPrice: 95000, paidAmount: 20000,
            contactName: 'Kunal', phone: '456', email: 'k@sound.com', rating: 4.8, ratingCount: 8,
            location: 'City', notes: '', deliverables: [],
          },
        ],
      };

      // Updating sound vendor price
      const nextState = workspaceReducer(state, {
        type: 'UPDATE_VENDOR',
        payload: {
          id: 'v-sound',
          partial: { contractedPrice: 100000 },
        },
      });

      const updatedAvBudget = nextState.budgetItems.find((b) => b.category === 'av_photo');
      // Total contracted: 175000 + 100000 = 275000
      expect(updatedAvBudget?.actualContracted).toBe(275000);
    });
  });
});
