import { EventWorkspaceState } from '../types/state';
import { BudgetItem } from '../types/budget';
import { Vendor } from '../types/vendor';
import { MacroTask, DayOfActivity } from '../types/timeline';
import { Guest } from '../types/guest';
import { RippleDiffResult } from '../types/ripple';
import { EventData } from '../types/event';

export type WorkspaceAction =
  | { type: 'LOAD_STATE'; payload: EventWorkspaceState }
  | { type: 'UPDATE_EVENT'; payload: Partial<EventData> }
  | { type: 'UPDATE_BUDGET_ITEM'; payload: { id: string; partial: Partial<BudgetItem> } }
  | { type: 'AUTO_BALANCE_BUDGET' }
  | { type: 'ADD_BUDGET_ITEM'; payload: BudgetItem }
  | { type: 'DELETE_BUDGET_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_VENDOR'; payload: { id: string; partial: Partial<Vendor> } }
  | { type: 'ADD_VENDOR'; payload: Vendor }
  | { type: 'DELETE_VENDOR'; payload: { id: string } }
  | { type: 'UPDATE_TASK'; payload: { id: string; partial: Partial<MacroTask> } }
  | { type: 'ADD_TASK'; payload: MacroTask }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'UPDATE_ACTIVITY'; payload: { id: string; partial: Partial<DayOfActivity> } }
  | { type: 'ADD_ACTIVITY'; payload: DayOfActivity }
  | { type: 'DELETE_ACTIVITY'; payload: { id: string } }
  | { type: 'SHIFT_ACTIVITY_30M'; payload: { id: string } }
  | { type: 'UPDATE_GUEST'; payload: { id: string; partial: Partial<Guest> } }
  | { type: 'ADD_GUEST'; payload: Guest }
  | { type: 'DELETE_GUEST'; payload: { id: string } }
  | { type: 'APPLY_RIPPLE'; payload: RippleDiffResult }
  | { type: 'TOGGLE_TAX'; payload: boolean }
  | { type: 'SET_TAX_RATE'; payload: number };

export function workspaceReducer(state: EventWorkspaceState, action: WorkspaceAction): EventWorkspaceState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;

    case 'UPDATE_EVENT':
      return { ...state, event: { ...state.event, ...action.payload } };

    case 'UPDATE_BUDGET_ITEM': {
      const budgetItems = state.budgetItems.map((item) =>
        item.id === action.payload.id ? { ...item, ...action.payload.partial } : item
      );
      return { ...state, budgetItems };
    }

    case 'AUTO_BALANCE_BUDGET': {
      const target = state.event.targetBudget;
      const lockedSum = state.budgetItems
        .filter((b) => b.isLocked)
        .reduce((sum, b) => sum + b.allocated, 0);
      const unlocked = state.budgetItems.filter((b) => !b.isLocked);
      const remainingTarget = Math.max(0, target - lockedSum);
      const unlockedCurrentTotal = unlocked.reduce((sum, b) => sum + b.allocated, 0) || 1;

      const budgetItems = state.budgetItems.map((item) => {
        if (item.isLocked) return item;
        const ratio = item.allocated / unlockedCurrentTotal;
        return { ...item, allocated: Math.round(remainingTarget * ratio) };
      });
      return { ...state, budgetItems };
    }

    case 'ADD_BUDGET_ITEM':
      return { ...state, budgetItems: [...state.budgetItems, action.payload] };

    case 'DELETE_BUDGET_ITEM':
      return { ...state, budgetItems: state.budgetItems.filter((b) => b.id !== action.payload.id) };

    case 'UPDATE_VENDOR': {
      const updatedVendors = state.vendors.map((v) =>
        v.id === action.payload.id ? { ...v, ...action.payload.partial } : v
      );
      const changedVendor = updatedVendors.find((v) => v.id === action.payload.id);

      // Real-time sync to Smart Budget Engine if contract price or status changed
      let budgetItems = state.budgetItems;
      if (changedVendor && (action.payload.partial.contractedPrice !== undefined || action.payload.partial.status !== undefined)) {
        budgetItems = state.budgetItems.map((bi) => {
          if (bi.category === changedVendor.category) {
            // Aggregate all contracted prices in this category
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

    case 'DELETE_VENDOR': {
      const remainingVendors = state.vendors.filter((v) => v.id !== action.payload.id);
      return { ...state, vendors: remainingVendors };
    }

    case 'UPDATE_TASK': {
      const macroTasks = state.macroTasks.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload.partial } : t
      );
      return { ...state, macroTasks };
    }

    case 'ADD_TASK':
      return { ...state, macroTasks: [...state.macroTasks, action.payload] };

    case 'DELETE_TASK':
      return { ...state, macroTasks: state.macroTasks.filter((t) => t.id !== action.payload.id) };

    case 'UPDATE_ACTIVITY': {
      const dayOfActivities = state.dayOfActivities.map((a) =>
        a.id === action.payload.id ? { ...a, ...action.payload.partial } : a
      );
      return { ...state, dayOfActivities };
    }

    case 'ADD_ACTIVITY':
      return { ...state, dayOfActivities: [...state.dayOfActivities, action.payload] };

    case 'DELETE_ACTIVITY':
      return { ...state, dayOfActivities: state.dayOfActivities.filter((a) => a.id !== action.payload.id) };

    case 'SHIFT_ACTIVITY_30M': {
      const dayOfActivities = state.dayOfActivities.map((a) => {
        if (a.id !== action.payload.id) return a;
        const [h, m] = a.startTime.split(':').map(Number);
        const [eh, em] = a.endTime.split(':').map(Number);
        const startMins = h * 60 + m + 30;
        const endMins = eh * 60 + em + 30;
        const formatTime = (mins: number) => {
          const hh = Math.floor(mins / 60) % 24;
          const mm = mins % 60;
          return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
        };
        return { ...a, startTime: formatTime(startMins), endTime: formatTime(endMins) };
      });
      return { ...state, dayOfActivities };
    }

    case 'UPDATE_GUEST': {
      const guests = state.guests.map((g) =>
        g.id === action.payload.id ? { ...g, ...action.payload.partial } : g
      );
      return { ...state, guests };
    }

    case 'ADD_GUEST':
      return { ...state, guests: [...state.guests, action.payload] };

    case 'DELETE_GUEST':
      return { ...state, guests: state.guests.filter((g) => g.id !== action.payload.id) };

    case 'APPLY_RIPPLE': {
      const diff = action.payload;
      const budgetItems = [...state.budgetItems];

      // Mutate budget allocations based on ripple
      diff.budgetAdjustments.forEach((adj) => {
        const idx = budgetItems.findIndex((b) => b.category === adj.category);
        if (idx >= 0) {
          budgetItems[idx] = { ...budgetItems[idx], allocated: adj.newAllocated };
        } else {
          budgetItems.push({
            id: `b-ripple-${Date.now()}-${adj.category}`,
            category: adj.category,
            name: adj.categoryLabel,
            allocated: adj.newAllocated,
            vendorQuote: adj.newAllocated,
            actualContracted: 0,
            amountPaid: 0,
            isLocked: false,
          });
        }
      });

      // Inject new required vendors
      const newVendorsList = diff.newVendors.map((nv) => ({
        id: nv.id,
        name: nv.name,
        category: nv.category,
        status: 'quote_received' as const,
        estimatedPrice: nv.estimatedCost,
        contractedPrice: 0,
        paidAmount: 0,
        contactName: 'Pending Assignment',
        phone: '+91 90000 00000',
        email: 'ops@auraplan.internal',
        rating: 4.8,
        ratingCount: 1,
        location: state.event.city,
        notes: nv.justification,
        deliverables: [nv.justification],
      }));

      // Inject timeline tasks
      const newTasks: MacroTask[] = diff.timelineModifications.map((tm) => ({
        id: tm.id,
        horizon: '1_week',
        title: tm.title,
        category: 'Ripple Action',
        priority: 'high',
        assignee: 'Operations',
        dueDate: state.event.date,
        completed: false,
        notes: tm.detail,
      }));

      const newGuestCount = state.event.guestCount + diff.guestCountImpact;
      const newBudget = state.event.targetBudget + diff.netBudgetImpact;

      return {
        ...state,
        event: { ...state.event, guestCount: newGuestCount, targetBudget: newBudget },
        budgetItems,
        vendors: [...state.vendors, ...newVendorsList],
        macroTasks: [...state.macroTasks, ...newTasks],
      };
    }

    case 'TOGGLE_TAX':
      return { ...state, includeTaxInTotals: action.payload };

    case 'SET_TAX_RATE':
      return { ...state, taxRatePercent: action.payload };

    default:
      return state;
  }
}
