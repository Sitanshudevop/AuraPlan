import { BudgetItem } from '../types/budget';
import { BudgetAction } from './types';

export interface BudgetSliceState {
  budgetItems: BudgetItem[];
  includeTaxInTotals: boolean;
  taxRatePercent: number;
}

/**
 * Auto-balances unlocked budget items proportionally to meet the target budget.
 */
export function autoBalanceBudgetItems(
  items: BudgetItem[],
  targetBudget: number
): BudgetItem[] {
  const lockedSum = items
    .filter((b) => b.isLocked)
    .reduce((sum, b) => sum + b.allocated, 0);
  const unlocked = items.filter((b) => !b.isLocked);
  const remainingTarget = Math.max(0, targetBudget - lockedSum);
  const unlockedCurrentTotal = unlocked.reduce((sum, b) => sum + b.allocated, 0) || 1;

  return items.map((item) => {
    if (item.isLocked) return item;
    const ratio = item.allocated / unlockedCurrentTotal;
    return { ...item, allocated: Math.round(remainingTarget * ratio) };
  });
}

/**
 * Pure domain reducer for Smart Budget slice.
 */
export function budgetReducer(
  state: BudgetSliceState,
  action: BudgetAction,
  targetBudget?: number
): BudgetSliceState {
  switch (action.type) {
    case 'UPDATE_BUDGET_ITEM':
      return {
        ...state,
        budgetItems: state.budgetItems.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload.partial } : item
        ),
      };

    case 'AUTO_BALANCE_BUDGET':
      return {
        ...state,
        budgetItems: autoBalanceBudgetItems(state.budgetItems, targetBudget || 0),
      };

    case 'ADD_BUDGET_ITEM':
      return {
        ...state,
        budgetItems: [...state.budgetItems, action.payload],
      };

    case 'DELETE_BUDGET_ITEM':
      return {
        ...state,
        budgetItems: state.budgetItems.filter((b) => b.id !== action.payload.id),
      };

    case 'TOGGLE_TAX':
      return {
        ...state,
        includeTaxInTotals: action.payload,
      };

    case 'SET_TAX_RATE':
      return {
        ...state,
        taxRatePercent: action.payload,
      };

    default:
      return state;
  }
}

