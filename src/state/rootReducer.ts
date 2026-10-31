import { EventWorkspaceState } from '../types/state';
import { WorkspaceAction } from './types';
import { eventReducer } from './eventReducer';
import { budgetReducer } from './budgetReducer';
import { vendorReducer } from './vendorReducer';
import { timelineReducer } from './timelineReducer';
import { guestReducer } from './guestReducer';
import { rippleReducer } from './rippleReducer';

function handleBudgetDomain(state: EventWorkspaceState, action: WorkspaceAction): EventWorkspaceState | null {
  switch (action.type) {
    case 'UPDATE_BUDGET_ITEM':
    case 'AUTO_BALANCE_BUDGET':
    case 'ADD_BUDGET_ITEM':
    case 'DELETE_BUDGET_ITEM':
    case 'TOGGLE_TAX':
    case 'SET_TAX_RATE': {
      const budgetSlice = budgetReducer(
        {
          budgetItems: state.budgetItems,
          includeTaxInTotals: state.includeTaxInTotals,
          taxRatePercent: state.taxRatePercent,
        },
        action,
        state.event.targetBudget
      );
      return {
        ...state,
        budgetItems: budgetSlice.budgetItems,
        includeTaxInTotals: budgetSlice.includeTaxInTotals,
        taxRatePercent: budgetSlice.taxRatePercent,
      };
    }
    default:
      return null;
  }
}

function handleVendorDomain(state: EventWorkspaceState, action: WorkspaceAction): EventWorkspaceState | null {
  switch (action.type) {
    case 'UPDATE_VENDOR':
    case 'ADD_VENDOR':
    case 'DELETE_VENDOR': {
      const vendorSlice = vendorReducer(
        {
          vendors: state.vendors,
          budgetItems: state.budgetItems,
        },
        action
      );
      return {
        ...state,
        vendors: vendorSlice.vendors,
        budgetItems: vendorSlice.budgetItems,
      };
    }
    default:
      return null;
  }
}

function handleTimelineDomain(state: EventWorkspaceState, action: WorkspaceAction): EventWorkspaceState | null {
  switch (action.type) {
    case 'UPDATE_TASK':
    case 'ADD_TASK':
    case 'DELETE_TASK':
    case 'UPDATE_ACTIVITY':
    case 'ADD_ACTIVITY':
    case 'DELETE_ACTIVITY':
    case 'SHIFT_ACTIVITY_30M': {
      const timelineSlice = timelineReducer(
        {
          macroTasks: state.macroTasks,
          dayOfActivities: state.dayOfActivities,
        },
        action
      );
      return {
        ...state,
        macroTasks: timelineSlice.macroTasks,
        dayOfActivities: timelineSlice.dayOfActivities,
      };
    }
    default:
      return null;
  }
}

function handleGuestDomain(state: EventWorkspaceState, action: WorkspaceAction): EventWorkspaceState | null {
  switch (action.type) {
    case 'UPDATE_GUEST':
    case 'ADD_GUEST':
    case 'DELETE_GUEST': {
      const guestSlice = guestReducer(
        {
          guests: state.guests,
        },
        action
      );
      return {
        ...state,
        guests: guestSlice.guests,
      };
    }
    default:
      return null;
  }
}

/**
 * Root reducer composing all domain slices with 100% backward compatibility.
 */
export function rootWorkspaceReducer(
  state: EventWorkspaceState,
  action: WorkspaceAction
): EventWorkspaceState {
  if (action.type === 'LOAD_STATE') {
    return action.payload;
  }

  if (action.type === 'APPLY_RIPPLE') {
    return rippleReducer(state, action);
  }

  if (action.type === 'UPDATE_EVENT') {
    return { ...state, event: eventReducer(state.event, action) };
  }

  const handled =
    handleBudgetDomain(state, action) ??
    handleVendorDomain(state, action) ??
    handleTimelineDomain(state, action) ??
    handleGuestDomain(state, action);

  return handled ?? state;
}
