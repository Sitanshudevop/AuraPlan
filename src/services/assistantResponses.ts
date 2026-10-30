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

export function getSmartLocalAssistantResponse(query: string, event: EventData): AssistantMessage {
  const q = query.toLowerCase().trim();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Greetings & Capabilities
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.includes('how can u help') ||
    q.includes('how can you help') ||
    q.includes('what can you do') ||
    q.includes('who are you') ||
    q.includes('help me')
  ) {
    return getGreetingResponse(event, timeStr);
  }

  // 2. Sangeet, Music, Dance & Entertainment
  if (q.includes('sangeet') || q.includes('dance') || q.includes('music') || q.includes('dj') || q.includes('song') || q.includes('choreograph')) {
    return getSangeetResponse(event, timeStr);
  }

  // 3. Catering & Dietary Buffers
  if (q.includes('catering') || q.includes('plate') || q.includes('dietary') || q.includes('food') || q.includes('buffet') || q.includes('menu')) {
    return getCateringResponse(event, timeStr);
  }

  // 4. Weather & Rain Contingency
  if (q.includes('rain') || q.includes('weather') || q.includes('contingency') || q.includes('outdoor') || q.includes('lawn')) {
    return getWeatherResponse(event, timeStr);
  }

  // 5. Buffer Times Baraat to Varmala & Transitions
  if (q.includes('buffer') || q.includes('baraat') || q.includes('varmala') || q.includes('transition') || q.includes('delay')) {
    return getBufferResponse(event, timeStr);
  }

  // 6. Budget Optimization & Savings
  if (q.includes('save') || q.includes('cut cost') || q.includes('budget') || q.includes('expensive') || q.includes('negotiate')) {
    return getCostSavingsResponse(event, timeStr);
  }

  // 7. Decor, Mandap & Theme Concepts
  if (q.includes('decor') || q.includes('theme') || q.includes('flower') || q.includes('lighting') || q.includes('mandap') || q.includes('stage')) {
    return getDecorResponse(event, timeStr);
  }

  // 8. Photography & Video Shot List
  if (q.includes('photo') || q.includes('video') || q.includes('photographer') || q.includes('camera') || q.includes('drone')) {
    return getPhotoResponse(event, timeStr);
  }

  // 9. Permits, Security & Compliance
  if (q.includes('permit') || q.includes('municipal') || q.includes('police') || q.includes('security') || q.includes('license')) {
    return getComplianceResponse(event, timeStr);
  }

  // 10. Birthday / Community Specific Prompts
  if (q.includes('cake') || q.includes('game') || q.includes('favor') || q.includes('adult') || q.includes('volunteer') || q.includes('sponsor')) {
    return getModalitySpecificResponse(event, timeStr);
  }

  // 11. Intelligent Dynamic Fallback
  return getFallbackResponse(query, event, timeStr);
}
