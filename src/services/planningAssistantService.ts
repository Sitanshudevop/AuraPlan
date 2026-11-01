import { EventData, EventType } from '../types/event';
import { EventWorkspaceState } from '../types/state';
import { sanitizeText } from '../utils/security';
import { logger } from '../utils/logger';
import { getSmartLocalAssistantResponse } from './assistantResponses';
import { getActiveApiKey } from './geminiService';
import { AssistantAction, AssistantMessage } from '../types/assistant';
import { callGeminiProxy } from './geminiClient';
import { rawAssistantResponseSchema, ASSISTANT_RESPONSE_JSON_SCHEMA } from '../schemas/aiSchemas';

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
  if (import.meta.env.MODE === 'test' && !apiKey) return true;
  return false;
}

/** Detects URLs, spam, or keyboard-mash gibberish queries that are not event planning questions */
export function isNonPlanningQuery(query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) return true;
  // 1. Bare URL or web link
  if (/^https?:\/\//i.test(trimmed) || /^(www\.)?[a-z0-9-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) {
    return true;
  }
  // 2. Pure numbers or symbols
  if (/^[0-9\W_]+$/.test(trimmed)) {
    return true;
  }
  // 3. Gibberish without vowels / keyboard mash (e.g. asdfghjk, qwerty)
  const alphaOnly = trimmed.replace(/[^a-z]/g, '');
  if (alphaOnly.length >= 6 && (!/[aeiouy]/.test(alphaOnly) || /[bcdfghjklmnpqrstvwxz]{5,}/i.test(trimmed))) {
    return true;
  }
  if (/(?:asdf|sdfg|dfgh|fghj|ghjk|hjkl|qwerty|werty|zxcvb)/i.test(trimmed)) {
    return true;
  }
  // 4. Repeated character sequence (e.g. aaaaaa)
  if (/^(.)\1{4,}$/.test(trimmed)) {
    return true;
  }
  return false;
}

export function buildSystemInstruction(event: EventData, state?: EventWorkspaceState): string {
  const vendorsSummary = state?.vendors?.map((v) => `${v.name} (${v.category}: ₹${v.contractedPrice || v.estimatedPrice})`).join(', ') || 'Initial vendor sourcing';
  const timelineSummary = state?.macroTasks?.slice(0, 5).map((t) => `${t.title} [${t.horizon}]`).join(', ') || 'Initial milestones';
  const dietaryMix = state?.guests?.flatMap((g) => g.dietary).filter(Boolean) || [];
  const dietarySummary = dietaryMix.length > 0 ? `Dietary: ${[...new Set(dietaryMix)].join(', ')}` : 'Standard menu';

  return `You are AuraPlan AI, an elite event planner and logistics strategist for ${event.type} events.
Event Details:
- Name: "${event.name}"
- Modality/Type: ${event.type}
- City: ${event.city}
- Target Budget: ₹${event.targetBudget.toLocaleString('en-IN')}
- Guest Count: ${event.guestCount}
- Date: ${event.date}
- Cultural/Vibe Preference: ${event.culturalPreferences || 'Classic & Elegant'}
- Dietary Mix: ${dietarySummary}
- Current Vendors: ${vendorsSummary}
- Timeline Summary: ${timelineSummary}

Guidelines:
1. Provide concrete, highly specific, tactical advice tailored to this event, city, guest count, and budget. For example, for a "sangeet sequence", return a realistic timeline order of performances with timing, transitions, and DJ cues for this wedding.
2. If the user input is NOT an event planning question (e.g. bare URL, random letters/gibberish, code snippets, spam), politely state that you can only assist with planning "${event.name}" and offer 3 concrete things you can do (e.g., timeline buffers, catering calculations, vendor negotiations). In this case, return NO suggestedActions (empty array).
3. Suggested actions must be genuine tactical actions (add_task, add_budget, or add_vendor). NEVER echo the user's raw input or query as a task title.`;
}

function buildAssistantPrompt(event: EventData, query: string): string {
  return `User planning inquiry for ${event.name} (${event.type} in ${event.city}): "${query}". Provide tactical, actionable recommendations tailored to this event and return structured JSON.`;
}

interface RawGeminiParsed {
  content?: string;
  source?: 'gemini';
  model?: string;
  suggestedActions?: AssistantAction[];
}

function assembleAssistantMessage(
  parsed: RawGeminiParsed,
  fallback: AssistantMessage,
  rawQuery: string
): AssistantMessage {
  const isNonPlan = isNonPlanningQuery(rawQuery);
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Clean actions to prevent echoing raw user input
  const rawActions = isNonPlan ? [] : ((parsed.suggestedActions as AssistantAction[]) || fallback.suggestedActions || []);
  const safeActions = rawActions.filter((act) => {
    if (act.type === 'add_task' && act.payload.task) {
      const titleLower = act.payload.task.title.toLowerCase();
      const rawLower = rawQuery.toLowerCase();
      // Drop any action that blindly echoes the user query as a title
      if (rawQuery.length > 5 && titleLower.includes(rawLower)) return false;
    }
    return true;
  });

  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    source: parsed.source || 'gemini',
    model: parsed.model || 'gemini-flash-lite-latest',
    content: parsed.content || fallback.content,
    suggestedActions: safeActions,
  };
}

export async function askPlanningAssistant(
  query: string,
  event: EventData,
  state: EventWorkspaceState
): Promise<AssistantMessage> {
  const sanitizedQuery = sanitizeText(query);
  const apiKey = getActiveApiKey();

  if (isOfflineOrTestMode(apiKey)) {
    return getSmartLocalAssistantResponse(sanitizedQuery, event);
  }

  try {
    const prompt = buildAssistantPrompt(event, sanitizedQuery);
    const systemInstruction = buildSystemInstruction(event, state);
    const parsed = await callGeminiProxy(prompt, rawAssistantResponseSchema, {
      customKey: apiKey,
      responseSchema: ASSISTANT_RESPONSE_JSON_SCHEMA,
      systemInstruction,
    });
    const fallback = getSmartLocalAssistantResponse(sanitizedQuery, event);
    return assembleAssistantMessage(parsed, fallback, sanitizedQuery);
  } catch (err) {
    logger.warn('Gemini assistant error, using smart fallback', err);
    return getSmartLocalAssistantResponse(sanitizedQuery, event);
  }
}
