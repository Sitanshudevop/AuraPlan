import { Vendor } from '../types/vendor';
import { BudgetItem } from '../types/budget';
import { VendorAction } from './types';

export interface VendorSliceState {
  vendors: Vendor[];
  budgetItems: BudgetItem[];
}

/**
 * Pure domain reducer for Vendor CRM slice.
 * Automatically synchronizes contracted vendor prices with budget lines in real-time.
 */
export function vendorReducer(
  state: VendorSliceState,
  action: VendorAction
): VendorSliceState {
  switch (action.type) {
    case 'UPDATE_VENDOR': {
      const updatedVendors = state.vendors.map((v) =>
        v.id === action.payload.id ? { ...v, ...action.payload.partial } : v
      );
      const changedVendor = updatedVendors.find((v) => v.id === action.payload.id);

      let budgetItems = state.budgetItems;
      if (
        changedVendor &&
        (action.payload.partial.contractedPrice !== undefined ||
          action.payload.partial.status !== undefined)
      ) {
        budgetItems = state.budgetItems.map((bi) => {
          if (bi.category === changedVendor.category) {
            const categoryContracted = updatedVendors
              .filter((v) => v.category === bi.category && v.status === 'contract_signed')
              .reduce((sum, v) => sum + v.contractedPrice, 0);
            return categoryContracted > 0 ? { ...bi, actualContracted: categoryContracted } : bi;
          }
          return bi;
        });
      }

      return { ...state, vendors: updatedVendors, budgetItems };
    }

    case 'ADD_VENDOR':
      return { ...state, vendors: [...state.vendors, action.payload] };

    case 'DELETE_VENDOR':
      return {
        ...state,
        vendors: state.vendors.filter((v) => v.id !== action.payload.id),
      };

    default:
      return state;
  }
}

