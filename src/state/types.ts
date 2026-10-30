import { EventWorkspaceState } from '../types/state';
import { BudgetItem } from '../types/budget';
import { Vendor } from '../types/vendor';
import { MacroTask, DayOfActivity } from '../types/timeline';
import { Guest } from '../types/guest';
import { RippleDiffResult } from '../types/ripple';
import { EventData } from '../types/event';

export type EventAction =
  | { type: 'UPDATE_EVENT'; payload: Partial<EventData> };

export type BudgetAction =
  | { type: 'UPDATE_BUDGET_ITEM'; payload: { id: string; partial: Partial<BudgetItem> } }
  | { type: 'AUTO_BALANCE_BUDGET' }
  | { type: 'ADD_BUDGET_ITEM'; payload: BudgetItem }
  | { type: 'DELETE_BUDGET_ITEM'; payload: { id: string } }
  | { type: 'TOGGLE_TAX'; payload: boolean }
  | { type: 'SET_TAX_RATE'; payload: number };

export type VendorAction =
  | { type: 'UPDATE_VENDOR'; payload: { id: string; partial: Partial<Vendor> } }
  | { type: 'ADD_VENDOR'; payload: Vendor }
  | { type: 'DELETE_VENDOR'; payload: { id: string } };

export type TimelineAction =
  | { type: 'UPDATE_TASK'; payload: { id: string; partial: Partial<MacroTask> } }
  | { type: 'ADD_TASK'; payload: MacroTask }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'UPDATE_ACTIVITY'; payload: { id: string; partial: Partial<DayOfActivity> } }
  | { type: 'ADD_ACTIVITY'; payload: DayOfActivity }
  | { type: 'DELETE_ACTIVITY'; payload: { id: string } }
  | { type: 'SHIFT_ACTIVITY_30M'; payload: { id: string } };

export type GuestAction =
  | { type: 'UPDATE_GUEST'; payload: { id: string; partial: Partial<Guest> } }
  | { type: 'ADD_GUEST'; payload: Guest }
  | { type: 'DELETE_GUEST'; payload: { id: string } };

export type RippleAction =
  | { type: 'APPLY_RIPPLE'; payload: RippleDiffResult };

export type RootAction =
  | { type: 'LOAD_STATE'; payload: EventWorkspaceState }
  | EventAction
  | BudgetAction
  | VendorAction
  | TimelineAction
  | GuestAction
  | RippleAction;

export type WorkspaceAction = RootAction;

/**
 * Compile-time exhaustiveness check helper.
 */
export function assertNever(x: never): never {
  throw new Error(`Unexpected object in exhaustive check: ${JSON.stringify(x)}`);
}

