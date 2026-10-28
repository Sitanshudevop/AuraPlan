import { EventData, EventType } from '../types/event';
import { EventWorkspaceState } from '../types/state';
import { TimelineHorizon, Priority } from '../types/timeline';
import { BudgetCategory } from '../types/budget';
import { sanitizeText } from '../utils/security';
import { logger } from '../utils/logger';

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

function getLocalAssistantResponse(query: string, event: EventData): AssistantMessage {
  const q = query.toLowerCase();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (q.includes('rain') || q.includes('weather') || q.includes('contingency')) {
    return {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      timestamp: timeStr,
      content: `For outdoor celebrations in ${event.city}, establish a **48-Hour Weather Trigger Window**:\n1. Lock an indoor waterproof marquee or banquet backup hall with your venue.\n2. Ensure all electrical boards (AV, stage, catering) have elevated waterproof risers.\n3. Keep 150 compact ivory umbrellas on standby near valet arrivals.`,
      suggestedActions: [
        {
          type: 'add_task',
          label: '+ Add Rain Contingency Task',
          payload: { task: { title: 'Confirm 48-Hour Waterproof Marquee Backup Hall', horizon: '1_week', category: 'Logistics & Safety', priority: 'critical' } },
        },
        {
          type: 'add_budget',
          label: '+ Allocate Weather Reserve',
          payload: { budget: { name: 'Weather & Waterproofing Reserve', category: 'buffer', allocated: event.type === 'wedding' ? 50000 : 15000 } },
        },
      ],
    };
  }

  if (q.includes('buffer') || q.includes('baraat') || q.includes('varmala') || q.includes('timeline')) {
    return {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      timestamp: timeStr,
      content: `Operational standard for ${event.type === 'wedding' ? 'Baraat to Varmala' : 'schedule transitions'}:\n• Baraats in India consistently exceed planned schedules by **30–45 minutes** due to dhol encores.\n• Recommended timeline: Schedule Baraat assembly at 17:30, start moving by 18:00, with Varmala at 19:15.\n• Deploy high-tea refreshments at the groom entry point to keep early guests comfortable.`,
      suggestedActions: [
        {
          type: 'add_task',
          label: '+ Add Varmala Buffer Task',
          payload: { task: { title: 'Deploy Groom VIP Welcomers with Refreshments', horizon: 'day_before', category: 'Run-of-Show', priority: 'high' } },
        },
      ],
    };
  }

  if (q.includes('catering') || q.includes('plate') || q.includes('dietary')) {
    return {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      timestamp: timeStr,
      content: `For **${event.guestCount} confirmed guests** in ${event.city}:\n• **Attrition buffer**: Expect 5–8% no-show rate for city events, but 10–15% surge for weddings.\n• Contract 90% guaranteed covers, with a 10% on-demand flexible cover at pre-agreed rates.\n• Ensure Jain/Vegan live counters are isolated from the main buffet.`,
      suggestedActions: [
        {
          type: 'add_task',
          label: '+ Lock 10% Catering Buffer',
          payload: { task: { title: 'Reconfirm 10% Floating Plate Buffer with Chef', horizon: '1_week', category: 'Catering Banquets', priority: 'critical' } },
        },
      ],
    };
  }

  if (q.includes('permit') || q.includes('municipal') || q.includes('police') || q.includes('security')) {
    return {
      id: `ai-msg-${Date.now()}`,
      role: 'assistant',
      timestamp: timeStr,
      content: `Key regulatory approvals for ${event.name} in ${event.city}:\n1. **Police Permission & Traffic Clearance**: File route and parking plan 21 days prior.\n2. **Fire Department NOC**: Required for temporary wooden/cloth stages.\n3. **Sound License**: Strict 22:00 acoustic limit for outdoor sound systems.`,
      suggestedActions: [
        {
          type: 'add_task',
          label: '+ Schedule Police & Fire NOC Filing',
          payload: { task: { title: 'Submit Municipal Sound License & Fire NOC', horizon: '1_month', category: 'Compliance & Permits', priority: 'critical' } },
        },
      ],
    };
  }

  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Regarding **${event.name}** (${event.type.toUpperCase()} Mode):\nBased on your budget and **${event.guestCount} guests**, prioritize locking your core venue and AV vendors first, maintaining a 10% contingency buffer for sudden additions.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Add Recommended Milestone Task',
        payload: { task: { title: `Review Core Vendor Agreements for ${event.name}`, horizon: '1_month', category: 'Operations', priority: 'high' } },
      },
    ],
  };
}

export async function askPlanningAssistant(
  query: string,
  event: EventData,
  _state: EventWorkspaceState
): Promise<AssistantMessage> {
  const sanitizedQuery = sanitizeText(query);
  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY;

  const envMode = (import.meta as unknown as { env: Record<string, string> }).env?.MODE;
  if (envMode === 'test' || !apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return getLocalAssistantResponse(sanitizedQuery, event);
  }

  try {
    const prompt = `AuraPlan AI planner for ${event.type}. Event: "${event.name}", City: "${event.city}", Guests: ${event.guestCount}, Budget: ${event.targetBudget}. Question: "${sanitizedQuery}". Return JSON: {"content": "advice", "suggestedActions": []}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      content: parsed.content || getLocalAssistantResponse(sanitizedQuery, event).content,
      suggestedActions: parsed.suggestedActions || [],
    };
  } catch (err) {
    logger.warn('Gemini assistant error, using local fallback', err);
    return getLocalAssistantResponse(sanitizedQuery, event);
  }
}

