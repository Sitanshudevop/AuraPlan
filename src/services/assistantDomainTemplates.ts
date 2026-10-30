import { EventData } from '../types/event';
import { AssistantMessage } from './planningAssistantService';

export function getDecorResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Visual Design Strategy for **${event.name}**:\n• **Hero Statement**: Focus 60% of floral decor budget on the main stage/mandap backdrop where 85% of photos are captured.\n• **Ambient Lighting**: Warm 2700K tungsten wash lighting transforms raw banquet spaces at one-third the cost of exotic imported flowers.\n• **Table Accents**: Use brass urlis, scented floating mogra, and textured linen runners rather than towering centerpieces that obstruct cross-table conversation.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Review Decor 3D Renderings',
        payload: { task: { title: 'Approve Stage Lighting Grid and Floral Palette Samples', horizon: '1_month', category: 'Decor & Styling', priority: 'high' } },
      },
    ],
  };
}

export function getPhotoResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Production Shot List & Briefing for ${event.city}:\n• **Golden Hour Portraits**: Schedule couple portraits 45 minutes prior to sunset for optimal ambient warmth.\n• **Candid Lead**: Assign 1 candid photographer exclusively to VIP elders and candid emotional moments.\n• **Drone Regulation**: Obtain local municipal drone clearance for heritage sites in ${event.city}.\n• **Delivery Timeline**: Ensure the contract specifies a 48-hour social media highlight reel and full deliverables within 30 days.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Brief Photography Crew on VIP Shot List',
        payload: { task: { title: 'Distribute Family VIP Shot List to Lead Photographer', horizon: '1_week', category: 'Media & Photo', priority: 'high' } },
      },
    ],
  };
}

export function getComplianceResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Statutory & Municipal Compliance Checklist for **${event.city}**:\n1. **Police Traffic & Route Clearance**: Submit parking and procession map 21 days prior.\n2. **Sound License (PPL / IPRS)**: Secure public performance music licenses and adhere to the 22:00 outdoor acoustic decibel cutoff.\n3. **Fire Department NOC**: Mandatory for elevated wooden stages, fabric canopies, and cold pyrotechnics.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ File Sound License & Police NOC',
        payload: { task: { title: 'File Police Route NOC and Sound License Application', horizon: '1_month', category: 'Compliance & Permits', priority: 'critical' } },
      },
    ],
  };
}

export function getModalitySpecificResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Tailored Execution Framework for **${event.name}**:\n• **Pacing**: Sequence high-energy highlights (cake cutting / keynote) within the first 90 minutes when guest attendance peaks.\n• **Guest Experience**: Distribute personalized keepsake favors near the farewell lounge to leave an indelible impression.\n• **Crowd Management**: Assign dedicated volunteer zone leads for registration, hospitality, and crowd guidance.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Finalize Experiential Itinerary',
        payload: { task: { title: 'Review Entertainment Cues & Favors Distribution', horizon: '1_week', category: 'Operations', priority: 'high' } },
      },
    ],
  };
}

export function getFallbackResponse(query: string, event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Regarding **"${query}"** for **${event.name}** (${event.type.toUpperCase()} in ${event.city}):\n\nFor an event of **${event.guestCount} guests** with a budget of ₹${event.targetBudget.toLocaleString('en-IN')}, I recommend evaluating this against your critical path:\n• Verify if this impacts vendor contract deliverables or timeline schedules.\n• Ensure an operational buffer of at least 15% is factored into costs.\n• Coordinate with your on-site leads 7 days before execution to lock in logistical support.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: `+ Add Planning Task for "${query.slice(0, 28)}..."`,
        payload: { task: { title: `Action Item: ${query.slice(0, 50)}`, horizon: '1_week', category: 'Operations', priority: 'high' } },
      },
    ],
  };
}
