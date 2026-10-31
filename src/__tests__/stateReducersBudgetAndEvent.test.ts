import { describe, it, expect } from 'vitest';
import { eventReducer } from '../state/eventReducer';
import { budgetReducer } from '../state/budgetReducer';
import { vendorReducer, VendorSliceState } from '../state/vendorReducer';
import { weddingPreset } from '../data/weddingPreset';
import { BudgetItem } from '../types/budget';
import { Vendor } from '../types/vendor';

describe('Domain Reducer Slices: Event, Budget, & Vendors', () => {
  describe('eventReducer', () => {
    it('updates event fields cleanly', () => {
      const initial = weddingPreset.event;
      const updated = eventReducer(initial, {
        type: 'UPDATE_EVENT',
        payload: { guestCount: 300, city: 'Jaipur' },
      });
      expect(updated.guestCount).toBe(300);
      expect(updated.city).toBe('Jaipur');
      expect(updated.name).toBe(initial.name);
    });
  });

  describe('budgetReducer', () => {
    it('handles ADD, UPDATE, DELETE, and TAX actions', () => {
      let state = {
        budgetItems: [] as BudgetItem[],
        includeTaxInTotals: false,
        taxRatePercent: 18,
      };

      const newItem: BudgetItem = {
        id: 'bi-test-1',
        category: 'venue',
        name: 'Grand Lawn',
        allocated: 500000,
        vendorQuote: 500000,
        actualContracted: 0,
        amountPaid: 0,
        isLocked: false,
      };

      // ADD
      state = budgetReducer(state, { type: 'ADD_BUDGET_ITEM', payload: newItem });
      expect(state.budgetItems).toHaveLength(1);
      expect(state.budgetItems[0].name).toBe('Grand Lawn');

      // UPDATE
      state = budgetReducer(state, {
        type: 'UPDATE_BUDGET_ITEM',
        payload: { id: 'bi-test-1', partial: { allocated: 550000 } },
      });
      expect(state.budgetItems[0].allocated).toBe(550000);

      // TAX
      state = budgetReducer(state, { type: 'TOGGLE_TAX', payload: true });
      expect(state.includeTaxInTotals).toBe(true);

      state = budgetReducer(state, { type: 'SET_TAX_RATE', payload: 12 });
      expect(state.taxRatePercent).toBe(12);

      // DELETE
      state = budgetReducer(state, {
        type: 'DELETE_BUDGET_ITEM',
        payload: { id: 'bi-test-1' },
      });
      expect(state.budgetItems).toHaveLength(0);
    });
  });

  describe('vendorReducer', () => {
    it('handles ADD, UPDATE, DELETE and syncs contracted vendor price to budget', () => {
      let state: VendorSliceState = {
        vendors: [] as Vendor[],
        budgetItems: [
          {
            id: 'b-venue',
            category: 'venue',
            name: 'Venue allocation',
            allocated: 500000,
            vendorQuote: 500000,
            actualContracted: 0,
            amountPaid: 0,
            isLocked: false,
          },
        ],
      };

      const vendor: Vendor = {
        id: 'v-test-1',
        name: 'Palace Resort',
        category: 'venue',
        status: 'shortlisted',
        estimatedPrice: 480000,
        contractedPrice: 470000,
        paidAmount: 0,
        contactName: 'Manager',
        phone: '123',
        email: 'palace@test.com',
        rating: 4.9,
        ratingCount: 15,
        location: 'City',
        notes: '',
        deliverables: [],
      };

      // ADD
      state = vendorReducer(state, { type: 'ADD_VENDOR', payload: vendor });
      expect(state.vendors).toHaveLength(1);

      // UPDATE with contract signed -> syncs to budgetItems
      state = vendorReducer(state, {
        type: 'UPDATE_VENDOR',
        payload: { id: 'v-test-1', partial: { status: 'contract_signed', contractedPrice: 470000 } },
      });
      expect(state.vendors[0].status).toBe('contract_signed');
      expect(state.budgetItems[0].actualContracted).toBe(470000);

      // DELETE
      state = vendorReducer(state, { type: 'DELETE_VENDOR', payload: { id: 'v-test-1' } });
      expect(state.vendors).toHaveLength(0);
    });
  });
});
