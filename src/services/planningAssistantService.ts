import { EventData, EventType } from '../types/event';
import { EventWorkspaceState } from '../types/state';
import { TimelineHorizon, Priority } from '../types/timeline';
import { BudgetCategory } from '../types/budget';
import { sanitizeText } from '../utils/security';
import { logger } from '../utils/logger';
import { getSmartLocalAssistantResponse } from './assistantResponses';
import { getActiveApiKey } from './geminiService';

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

export const MODALITY_PROMPT_CHIPS: Record<EventType, string[]> = {
  wedding: [
    'What buffer time is needed between Baraat and Varmala?',
    'How do I calculate catering buffer for 250 guests?',
    'What weather contingency plan is best for outdoor lawns?',
    'Suggest a Sangeet music and dance sequence',
  ],
  birthday: [
    'Unique 30th birthday theme ideas for adults',
    'What is the ideal schedule for cake cutting and games?',
    'Party favor ideas under ₹250 per head',
    'How to handle dietary preferences for 45 guests?',
  ],
  community: [
    'Checklist of municipal permits for outdoor festivals',
    'How to calculate crowd barricading and security guards?',
    'Best practices for sponsor banner placement',
    'Volunteer shift rotation schedule for 400 attendees',
  ],
};

export async function askPlanningAssistant(
  query: string,
  event: EventData,
  _state: EventWorkspaceState
): Promise<AssistantMessage> {
  const sanitizedQuery = sanitizeText(query);
  const apiKey = getActiveApiKey();

  const envMode = import.meta.env.MODE;
  if (envMode === 'test' || !apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return getSmartLocalAssistantResponse(sanitizedQuery, event);
  }

  try {
    const prompt = `You are AuraPlan AI planner for ${event.type}. Event: "${event.name}", City: "${event.city}", Guests: ${event.guestCount}, Budget: ${event.targetBudget}. Question: "${sanitizedQuery}". Return ONLY a JSON object with schema: {"content": "detailed tactical advice", "suggestedActions": [{"type": "add_task", "label": string, "payload": {"task": {"title": string, "horizon": "1_week", "category": "Operations", "priority": "high"}}}]}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8500),
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');

    return {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: parsed.content || getSmartLocalAssistantResponse(sanitizedQuery, event).content,
      suggestedActions: parsed.suggestedActions || getSmartLocalAssistantResponse(sanitizedQuery, event).suggestedActions,
    };
  } catch (err) {
    logger.warn('Gemini assistant error, using smart fallback', err);
    return getSmartLocalAssistantResponse(sanitizedQuery, event);
  }
}
