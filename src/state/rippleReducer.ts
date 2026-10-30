import { EventWorkspaceState } from '../types/state';
import { RippleAction } from './types';
import { MacroTask } from '../types/timeline';

/**
 * Pure domain reducer for What-If Ripple Scenario Application.
 */
export function rippleReducer(
  state: EventWorkspaceState,
  action: RippleAction
): EventWorkspaceState {
  if (action.type !== 'APPLY_RIPPLE') return state;

  const diff = action.payload;
  const budgetItems = [...state.budgetItems];

  // Adjust budget allocations
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

  // Inject required vendors
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

