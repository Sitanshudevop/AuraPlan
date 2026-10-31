import { describe, it, expect } from 'vitest';
import { getSmartLocalAssistantResponse } from '../services/assistantResponses';
import {
  getGreetingResponse,
  getSangeetResponse,
  getCateringResponse,
  getWeatherResponse,
  getBufferResponse,
  getCostSavingsResponse,
} from '../services/assistantTemplates';
import {
  getDecorResponse,
  getPhotoResponse,
  getComplianceResponse,
  getModalitySpecificResponse,
  getFallbackResponse,
} from '../services/assistantDomainTemplates';
import { MODALITY_PROMPT_CHIPS } from '../services/planningAssistantService';
import { EventData } from '../types/event';

const weddingEvent: EventData = {
  id: 'ev-wedding-udaipur',
  name: 'Udaipur Royal Wedding',
  type: 'wedding',
  city: 'Udaipur',
  date: '2027-11-15',
  targetBudget: 15000000,
  guestCount: 250,
  currency: 'INR',
  setting: 'outdoor',
  culturalPreferences: 'Marwari Royal Vedic',
  subEvents: [],
};

const birthdayEvent: EventData = {
  id: 'ev-birthday-mumbai',
  name: 'Aarav 10th Birthday',
  type: 'birthday',
  city: 'Mumbai',
  date: '2027-05-10',
  targetBudget: 500000,
  guestCount: 60,
  currency: 'INR',
  setting: 'indoor',
  culturalPreferences: 'Contemporary Superhero',
  subEvents: [],
};

const communityEvent: EventData = {
  id: 'ev-community-delhi',
  name: 'Diwali Charity Gala',
  type: 'community',
  city: 'Delhi',
  date: '2027-10-20',
  targetBudget: 3500000,
  guestCount: 500,
  currency: 'INR',
  setting: 'hybrid',
  culturalPreferences: 'Pan-Indian Cultural',
  subEvents: [],
};

describe('Planning Assistant Local Responses & Domain Templates', () => {
  it('handles exact and keyword greetings properly', () => {
    const r1 = getSmartLocalAssistantResponse('hi', weddingEvent);
    expect(r1.role).toBe('assistant');
    expect(r1.content).toContain('Udaipur Royal Wedding');

    const r2 = getSmartLocalAssistantResponse('hello', weddingEvent);
    expect(r2.content).toContain('WEDDING');

    const r3 = getSmartLocalAssistantResponse('how can you help', weddingEvent);
    expect(r3.suggestedActions?.length).toBeGreaterThan(0);
  });

  it('routes domain keywords to specialized templates', () => {
    // Sangeet & Music
    const sangeet = getSmartLocalAssistantResponse('Plan our sangeet dance sequence', weddingEvent);
    expect(sangeet.content).toContain('Sangeet');
    expect(sangeet.suggestedActions?.[0].payload.task?.category).toBe('Entertainment');

    // Catering
    const catering = getSmartLocalAssistantResponse('What is our catering buffet calculation?', weddingEvent);
    expect(catering.content).toContain('Catering');
    expect(catering.suggestedActions?.[0].payload.task?.category).toBe('Catering Banquets');

    // Weather
    const weather = getSmartLocalAssistantResponse('Is there a rain contingency for the lawn?', weddingEvent);
    expect(weather.content).toContain('Weather Trigger');

    // Buffer
    const buffer = getSmartLocalAssistantResponse('Buffer time between baraat and varmala', weddingEvent);
    expect(buffer.content).toContain('Baraat to Varmala');

    // Cost Savings
    const savings = getSmartLocalAssistantResponse('How can we cut cost and negotiate vendors?', weddingEvent);
    expect(savings.content).toContain('Cost-Optimization');

    // Decor
    const decor = getSmartLocalAssistantResponse('Lighting and mandap decor suggestions', weddingEvent);
    expect(decor.content).toContain('Visual Design');

    // Photo
    const photo = getSmartLocalAssistantResponse('Photographer shot list and drone rules', weddingEvent);
    expect(photo.content).toContain('Production Shot List');

    // Compliance
    const compliance = getSmartLocalAssistantResponse('Municipal police permit and sound license', weddingEvent);
    expect(compliance.content).toContain('Compliance Checklist');

    // Modality-specific
    const modality = getSmartLocalAssistantResponse('Cake cutting and return favors', birthdayEvent);
    expect(modality.content).toContain('Tailored Execution');
  });

  it('falls back gracefully on unknown queries', () => {
    const fallback = getSmartLocalAssistantResponse('quantum entanglement physics in event management', weddingEvent);
    expect(fallback.content).toContain('Regarding **"quantum entanglement');
    expect(fallback.suggestedActions?.length).toBeGreaterThan(0);
  });

  it('executes all MODALITY_PROMPT_CHIPS successfully without throwing', () => {
    const events: Record<string, EventData> = {
      wedding: weddingEvent,
      birthday: birthdayEvent,
      community: communityEvent,
    };

    for (const [modality, chips] of Object.entries(MODALITY_PROMPT_CHIPS)) {
      const event = events[modality];
      for (const chip of chips) {
        const response = getSmartLocalAssistantResponse(chip, event);
        expect(response).toBeDefined();
        expect(response.content.length).toBeGreaterThan(20);
        expect(response.role).toBe('assistant');
      }
    }
  });

  it('directly verifies individual template functions', () => {
    const timeStr = '12:00 PM';
    const g = getGreetingResponse(weddingEvent, timeStr);
    expect(g.content).toContain('AuraPlan AI Assistant');

    const s = getSangeetResponse(weddingEvent, timeStr);
    expect(s.content).toContain('Family Dance Sequence');

    const c = getCateringResponse(weddingEvent, timeStr);
    expect(c.content).toContain('Flexible Buffer');

    const w = getWeatherResponse(weddingEvent, timeStr);
    expect(w.content).toContain('Weather Trigger Window');

    const b = getBufferResponse(weddingEvent, timeStr);
    expect(b.content).toContain('Baraat to Varmala');

    const cs = getCostSavingsResponse(weddingEvent, timeStr);
    expect(cs.content).toContain('Cost-Optimization Playbook');

    const d = getDecorResponse(weddingEvent, timeStr);
    expect(d.content).toContain('Visual Design Strategy');
    expect(d.suggestedActions?.[0].payload.task?.title).toContain('Floral Palette Samples');

    const p = getPhotoResponse(weddingEvent, timeStr);
    expect(p.content).toContain('Production Shot List');
    expect(p.suggestedActions?.[0].payload.task?.title).toContain('VIP Shot List');

    const comp = getComplianceResponse(weddingEvent, timeStr);
    expect(comp.content).toContain('Police');
    expect(comp.suggestedActions?.[0].payload.task?.title).toContain('Police Route NOC');

    const m = getModalitySpecificResponse(weddingEvent, timeStr);
    expect(m.content).toContain('Tailored Execution Framework');

    const fb = getFallbackResponse('Custom Inquiry', weddingEvent, timeStr);
    expect(fb.content).toContain('Custom Inquiry');
  });
});
