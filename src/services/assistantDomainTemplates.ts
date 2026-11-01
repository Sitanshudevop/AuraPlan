import { EventData } from '../types/event';
import { AssistantMessage } from '../types/assistant';

export function getDecorResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    source: 'offline',
    model: 'offline-engine',
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
    source: 'offline',
    model: 'offline-engine',
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
    source: 'offline',
    model: 'offline-engine',
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

export function getVendorsResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    source: 'offline',
    model: 'offline-engine',
    content: `Commercial Vendor Sourcing & Negotiation Protocol for **${event.name}**:\n• **Milestone Retention**: Cap booking advances at 25%, tie 50% to on-site setup sign-off, and hold 25% post-event retention.\n• **Hidden Cost Audit**: Explicitly eliminate generator fuel surcharges, vendor crew meal charges, and overtime penalties.\n• **Backup Clauses**: Require written replacement SLA (within 3 hours) for critical audiovisual or catering leads.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Audit Vendor Payment Milestones',
        payload: { task: { title: 'Finalize Vendor Payment Milestone Schedules & SLA Clauses', horizon: '1_month', category: 'Vendors & Legal', priority: 'high' } },
      },
    ],
  };
}

export function getGuestsResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    source: 'offline',
    model: 'offline-engine',
    content: `Guest Hospitality & Seating Logistics for **${event.guestCount} Guests** in ${event.city}:\n• **RSVP Attrition**: Plan for standard 12–15% attendance drop-off; confirm headcounts via WhatsApp 7 days out.\n• **Zone Seating**: Allocate front-row low-noise lounges for elders away from acoustic speaker arrays.\n• **Hospitality Desk**: Set up an arrival welcome station with luggage tags and local transport coordination.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Finalize Hospitality Desk Roster',
        payload: { task: { title: 'Assign Family Hospitality Desk Leads and RSVP Roster', horizon: '1_week', category: 'Hospitality', priority: 'high' } },
      },
    ],
  };
}

export function getRitualsResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    source: 'offline',
    model: 'offline-engine',
    content: `Ceremony & Ritual Timeline Flow for **${event.name}** (${event.culturalPreferences || 'Traditional'}):\n• **Mandap Preparation**: Complete sacred fire canopy and floral backdrop 2 hours prior to muhurat.\n• **Samagri Checklist**: Cross-verify 100% of ritual items with the priest 24 hours in advance.\n• **Pacing**: Factor in comfortable breaks between rituals for photography and guest greetings.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Review Ritual Samagri Checklist',
        payload: { task: { title: 'Verify Priest Samagri List and Muhurat Schedule', horizon: '1_week', category: 'Ceremony & Rituals', priority: 'high' } },
      },
    ],
  };
}

export function getModalitySpecificResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    source: 'offline',
    model: 'offline-engine',
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

export function getUnknownOrNonPlanningResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    source: 'offline',
    model: 'offline-engine',
    content: `I am specialized to assist with tactical planning for **${event.name}** (${event.type} in ${event.city}).\n\nI couldn't identify a specific planning topic in that request, but I can help you with:\n1. **Timeline & Buffer Planning**: Calculate transition buffers between key ceremonies and events.\n2. **Budget & Catering Math**: Compute guaranteed covers, floating plate buffers, and cost rebalancing.\n3. **Vendor Negotiation**: Generate vetting questions, fee audits, and contract checklists.\n\nAsk about any of these areas or select one of the suggested prompts above!`,
    suggestedActions: [],
  };
}

export function getFallbackResponse(_query: string, event: EventData, timeStr: string): AssistantMessage {
  return getUnknownOrNonPlanningResponse(event, timeStr);
}

