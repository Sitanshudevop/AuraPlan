import { TimelineHorizon, Priority } from './timeline';
import { BudgetCategory } from './budget';

export interface AssistantAction {
  type: 'add_task' | 'add_budget' | 'add_vendor';
  label: string;
  payload: {
    task?: { title: string; horizon: TimelineHorizon; category: string; priority: Priority };
    budget?: { name: string; category: BudgetCategory; allocated: number };
    vendor?: { name: string; category: BudgetCategory; estimatedPrice: number; deliverables: string[] };
  };
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: AssistantAction[];
}

