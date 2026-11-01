import { EventData } from '../types/event';
import { AssistantMessage } from '../types/assistant';
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
  getVendorsResponse,
  getGuestsResponse,
  getRitualsResponse,
  getModalitySpecificResponse,
  getUnknownOrNonPlanningResponse,
  getFallbackResponse,
} from './assistantDomainTemplates';

export { getFallbackResponse };

type ResponseHandler = (event: EventData, timeStr: string) => AssistantMessage;

interface IntentRule {
  intent: 'budget' | 'timeline_buffer' | 'weather' | 'catering' | 'music_entertainment' | 'vendors' | 'guests' | 'rituals' | 'other';
  keywords: string[];
  handler: ResponseHandler;
}

const GREETING_EXACT = new Set(['hi', 'hello', 'hey', 'namaste']);
const GREETING_KEYWORDS = ['how can u help', 'how can you help', 'what can you do', 'who are you', 'help me'];

/** 9 explicit domain intents classifier for offline and fallback execution */
export const INTENT_RULES: IntentRule[] = [
  { intent: 'timeline_buffer', keywords: ['buffer', 'baraat', 'varmala', 'transition', 'delay', 'schedule', 'timeline'], handler: getBufferResponse },
  { intent: 'music_entertainment', keywords: ['sangeet', 'dance', 'music', 'dj', 'song', 'choreograph', 'entertainment', 'band'], handler: getSangeetResponse },
  { intent: 'catering', keywords: ['catering', 'plate', 'dietary', 'food', 'buffet', 'menu', 'jain', 'vegan', 'cocktail', 'drinks', 'beverage'], handler: getCateringResponse },
  { intent: 'weather', keywords: ['rain', 'weather', 'contingency', 'outdoor', 'lawn', 'monsoon', 'storm', 'heat'], handler: getWeatherResponse },
  { intent: 'budget', keywords: ['save', 'cut cost', 'budget', 'expensive', 'negotiate', 'allocat', 'financial', 'reserve'], handler: getCostSavingsResponse },
  { intent: 'vendors', keywords: ['vendor', 'contract', 'quote', 'sla', 'advance', 'retention', 'payment', 'lead'], handler: getVendorsResponse },
  { intent: 'guests', keywords: ['guest', 'rsvp', 'seating', 'hospitality', 'invite', 'table', 'capacity', 'vip'], handler: getGuestsResponse },
  { intent: 'other', keywords: ['decor', 'flower', 'lighting'], handler: getDecorResponse },
  { intent: 'other', keywords: ['photo', 'camera', 'drone', 'video'], handler: getPhotoResponse },
  { intent: 'other', keywords: ['permit', 'police', 'license', 'municipal'], handler: getComplianceResponse },
  { intent: 'rituals', keywords: ['ritual', 'ceremony', 'mandap', 'muhurat', 'priest', 'pandit', 'samagri', 'haldi', 'mehendi'], handler: getRitualsResponse },
  { intent: 'other', keywords: ['cake', 'game', 'favor', 'sponsor', 'volunteer', 'keynote', 'farewell'], handler: (event, timeStr) => getModalitySpecificResponse(event, timeStr) },
];

function matchesGreeting(q: string): boolean {
  return GREETING_EXACT.has(q) || GREETING_KEYWORDS.some((kw) => q.includes(kw));
}

export function classifyIntent(query: string): ResponseHandler | null {
  const q = query.toLowerCase().trim();
  const rule = INTENT_RULES.find((r) => r.keywords.some((kw) => q.includes(kw)));
  return rule?.handler ?? null;
}

export function getSmartLocalAssistantResponse(query: string, event: EventData): AssistantMessage {
  const q = query.toLowerCase().trim();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (matchesGreeting(q)) {
    return getGreetingResponse(event, timeStr);
  }

  const handler = classifyIntent(q);
  if (handler) {
    return handler(event, timeStr);
  }

  return getUnknownOrNonPlanningResponse(event, timeStr);
}
