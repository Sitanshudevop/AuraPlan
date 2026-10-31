import { describe, it, expect } from 'vitest';
import { workspaceReducer } from '../context/workspaceReducer';
import { EventWorkspaceState } from '../types/state';
import { weddingPreset } from '../data/weddingPreset';

describe('Budget Rebalancing & Contract Synchronization', () => {
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
            isLocked: true,
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

      // 2. Unlocked items split remaining 600k proportionally (400k & 200k)
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

      const nextState = workspaceReducer(state, {
        type: 'UPDATE_VENDOR',
        payload: {
          id: 'v-sound',
          partial: { contractedPrice: 100000 },
        },
      });

      const updatedAvBudget = nextState.budgetItems.find((b) => b.category === 'av_photo');
      expect(updatedAvBudget?.actualContracted).toBe(275000);
    });
  });
});
