import { EventData, EventType } from '../types/event';
import { EventWorkspaceState } from '../types/state';
import { sanitizeText } from '../utils/security';
import { logger } from '../utils/logger';
import { getSmartLocalAssistantResponse } from './assistantResponses';
import { getActiveApiKey } from './geminiService';
import { AssistantAction, AssistantMessage } from '../types/assistant';
import { callGeminiProxy } from './geminiClient';
import { rawAssistantResponseSchema } from '../schemas/aiSchemas';

export type { AssistantAction, AssistantMessage };

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

function isOfflineOrTestMode(apiKey?: string | null): boolean {
  return import.meta.env.MODE === 'test' || !apiKey || apiKey === 'YOUR_GEMINI_API_KEY';
}

function buildAssistantPrompt(event: EventData, query: string): string {
  return `You are AuraPlan AI planner for ${event.type}. Event: "${event.name}", City: "${event.city}", Guests: ${event.guestCount}, Budget: ${event.targetBudget}. Question: "${query}". Return ONLY a JSON object with schema: {"content": "detailed tactical advice", "suggestedActions": [{"type": "add_task", "label": string, "payload": {"task": {"title": string, "horizon": "1_week", "category": "Operations", "priority": "high"}}}]}`;
}

interface RawGeminiParsed {
  content?: string;
  suggestedActions?: AssistantAction[];
}

function assembleAssistantMessage(
  parsed: RawGeminiParsed,
  fallback: AssistantMessage
): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    content: parsed.content || fallback.content,
    suggestedActions: (parsed.suggestedActions as AssistantAction[]) || fallback.suggestedActions,
  };
}

export async function askPlanningAssistant(
  query: string,
  event: EventData,
  _state: EventWorkspaceState
): Promise<AssistantMessage> {
  const sanitizedQuery = sanitizeText(query);
  const apiKey = getActiveApiKey();

  if (isOfflineOrTestMode(apiKey)) {
    return getSmartLocalAssistantResponse(sanitizedQuery, event);
  }

  try {
    const prompt = buildAssistantPrompt(event, sanitizedQuery);
    const parsed = await callGeminiProxy(prompt, rawAssistantResponseSchema, { customKey: apiKey });
    const fallback = getSmartLocalAssistantResponse(sanitizedQuery, event);
    return assembleAssistantMessage(parsed, fallback);
  } catch (err) {
    logger.warn('Gemini assistant error, using smart fallback', err);
    return getSmartLocalAssistantResponse(sanitizedQuery, event);
  }
}
