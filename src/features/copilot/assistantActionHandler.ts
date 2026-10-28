import { AssistantAction } from '../../services/planningAssistantService';
import { MacroTask } from '../../types/timeline';
import { BudgetItem } from '../../types/budget';
import { Vendor } from '../../types/vendor';
import { EventData } from '../../types/event';

export interface ActionHandlerDeps {
  event: EventData;
  addMacroTask: (task: MacroTask) => void;
  addBudgetItem: (item: BudgetItem) => void;
  addVendor: (vendor: Vendor) => void;
  announce: (msg: string) => void;
}

export const executeAssistantAction = (
  action: AssistantAction,
  deps: ActionHandlerDeps
): void => {
  const { event, addMacroTask, addBudgetItem, addVendor, announce } = deps;

  if (action.type === 'add_task' && action.payload.task) {
    const t = action.payload.task;
    addMacroTask({
      id: `task-ai-${Date.now()}`,
      title: t.title,
      horizon: t.horizon,
      category: t.category,
      priority: t.priority,
      assignee: 'Lead Coordinator',
      dueDate: event.date,
      completed: false,
    });
    announce(`Scheduled "${t.title}"`);
  } else if (action.type === 'add_budget' && action.payload.budget) {
    const b = action.payload.budget;
    addBudgetItem({
      id: `b-ai-${Date.now()}`,
      name: b.name,
      category: b.category,
      allocated: b.allocated,
      vendorQuote: b.allocated,
      actualContracted: 0,
      amountPaid: 0,
      isLocked: false,
    });
    announce(`Allocated budget for "${b.name}"`);
  } else if (action.type === 'add_vendor' && action.payload.vendor) {
    const v = action.payload.vendor;
    addVendor({
      id: `v-ai-${Date.now()}`,
      name: v.name,
      category: v.category,
      status: 'shortlisted',
      estimatedPrice: v.estimatedPrice,
      contractedPrice: 0,
      paidAmount: 0,
      contactName: 'Inquiry Desk',
      phone: '+91 98200 55555',
      email: 'info@partner.com',
      rating: 4.9,
      ratingCount: 12,
      location: event.city,
      notes: 'Sourced via AuraPlan AI Assistant',
      deliverables: v.deliverables,
    });
    announce(`Added vendor "${v.name}"`);
  }
};

