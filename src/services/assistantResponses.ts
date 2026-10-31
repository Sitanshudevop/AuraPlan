import { EventData } from '../types/event';
import { AssistantMessage } from './planningAssistantService';
import {
  getGreetingResponse,
  getSangeetResponse,
  getCateringResponse,
  getWeatherResponse,
  getBufferResponse,
  getCostSavingsResponse,
} from './assistantTemplates';
import {
  getDecorResponse,
  getPhotoResponse,
  getComplianceResponse,
  getModalitySpecificResponse,
  getFallbackResponse,
} from './assistantDomainTemplates';

type ResponseHandler = (event: EventData, timeStr: string) => AssistantMessage;

interface IntentRule {
  keywords: string[];
  handler: ResponseHandler;
}

/** Exact-match greetings checked before keyword scan. */
const GREETING_EXACT = new Set(['hi', 'hello', 'hey']);

/** Substring keywords that trigger greeting intent. */
const GREETING_KEYWORDS = ['how can u help', 'how can you help', 'what can you do', 'who are you', 'help me'];

/** Ordered intent routing table — first match wins. */
const INTENT_RULES: IntentRule[] = [
  { keywords: ['sangeet', 'dance', 'music', 'dj', 'song', 'choreograph'], handler: getSangeetResponse },
  { keywords: ['catering', 'plate', 'dietary', 'food', 'buffet', 'menu'], handler: getCateringResponse },
  { keywords: ['rain', 'weather', 'contingency', 'outdoor', 'lawn'], handler: getWeatherResponse },
  { keywords: ['buffer', 'baraat', 'varmala', 'transition', 'delay'], handler: getBufferResponse },
  { keywords: ['save', 'cut cost', 'budget', 'expensive', 'negotiate'], handler: getCostSavingsResponse },
  { keywords: ['decor', 'theme', 'flower', 'lighting', 'mandap', 'stage'], handler: getDecorResponse },
  { keywords: ['photo', 'video', 'photographer', 'camera', 'drone'], handler: getPhotoResponse },
  { keywords: ['permit', 'municipal', 'police', 'security', 'license'], handler: getComplianceResponse },
  { keywords: ['cake', 'game', 'favor', 'adult', 'volunteer', 'sponsor'], handler: getModalitySpecificResponse },
];

function matchesGreeting(q: string): boolean {
  return GREETING_EXACT.has(q) || GREETING_KEYWORDS.some((kw) => q.includes(kw));
}

function resolveIntent(q: string): ResponseHandler | null {
  const rule = INTENT_RULES.find((r) => r.keywords.some((kw) => q.includes(kw)));
  return rule?.handler ?? null;
}

export function getSmartLocalAssistantResponse(query: string, event: EventData): AssistantMessage {
  const q = query.toLowerCase().trim();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (matchesGreeting(q)) {
    return getGreetingResponse(event, timeStr);
  }

  const handler = resolveIntent(q);
  if (handler) {
    return handler(event, timeStr);
  }

  return getFallbackResponse(query, event, timeStr);
}
