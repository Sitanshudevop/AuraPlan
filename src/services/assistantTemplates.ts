import { EventData } from '../types/event';
import { AssistantMessage } from './planningAssistantService';

export function getGreetingResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Hello! I am your AuraPlan AI Assistant for **${event.name}** (${event.type.toUpperCase()} Mode in ${event.city}).\n\nI can help you orchestrate every detail:\n• **Timeline**: Calculate buffer times between rituals, day-of transitions, and rain contingency triggers.\n• **Budget & Catering**: Calculate per-plate attrition buffers, vendor negotiation targets, and hidden fee audits.\n• **Creative & Sangeet**: Sequence dance performances, curate decor themes, and suggest experiential moments.\n• **Operations**: Municipal permits, VIP protocols, and vendor contract vetting.\n\nTry clicking any suggested chip above or ask me a specific question!`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Add Core Planning Review Task',
        payload: { task: { title: `Conduct Master Plan Alignment for ${event.name}`, horizon: '1_month', category: 'Operations', priority: 'high' } },
      },
    ],
  };
}

export function getSangeetResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Curated Sangeet & Music Flow for **${event.name}**:\n1. **Acoustic / Fusion Warm-Up** (19:00–19:30): Instrumental cocktail lounge music while guests arrive.\n2. **Grand Couple Entry** (19:30–19:45): High-impact entrance with safe cold pyrotechnics and spotlighting.\n3. **Family Dance Sequence** (19:45–20:45): 3-minute max sets per side with friendly voting to keep momentum brisk.\n4. **Couple Feature Performance** (20:45–21:00): Romantic ballad with low-lying dry ice fog.\n5. **High-Energy DJ Curfew Run** (21:00–23:00): Seamless switch to commercial party beats.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Add Sangeet Run-of-Show Task',
        payload: { task: { title: 'Finalize Sangeet Track List & Sound Check with DJ', horizon: '1_week', category: 'Entertainment', priority: 'high' } },
      },
      {
        type: 'add_budget',
        label: '+ Allocate AV & Sound Budget',
        payload: { budget: { name: 'Sangeet Stage Lighting & Audio Rig', category: 'av_photo', allocated: 45000 } },
      },
    ],
  };
}

export function getCateringResponse(event: EventData, timeStr: string): AssistantMessage {
  const contracted = Math.round(event.guestCount * 0.9);
  const buffer = Math.round(event.guestCount * 0.1);
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Catering Strategy for **${event.guestCount} Guests** in ${event.city}:\n• **Contracted Base**: Lock guaranteed covers at 90% (**${contracted} plates**) to avoid overpaying for inevitable no-shows.\n• **Flexible Buffer**: Pre-contract a 10% on-demand buffer (**${buffer} plates**) at standard plate rate without last-minute surge penalties.\n• **Dietary Isolation**: Isolate Jain/Vegan preparation and serving stations with distinct utensils and signage.\n• **Post-Ceremony Bar**: Provide late-night hot snacks (chai kulhad, kathi rolls) for after-hours crew and family.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Lock 10% Floating Catering Buffer',
        payload: { task: { title: `Lock ${contracted} + ${buffer} Floating Plate Contract with Banquets`, horizon: '1_week', category: 'Catering Banquets', priority: 'critical' } },
      },
    ],
  };
}

export function getWeatherResponse(event: EventData, timeStr: string): AssistantMessage {
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

export function getBufferResponse(event: EventData, timeStr: string): AssistantMessage {
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

export function getCostSavingsResponse(event: EventData, timeStr: string): AssistantMessage {
  return {
    id: `ai-msg-${Date.now()}`,
    role: 'assistant',
    timestamp: timeStr,
    content: `Cost-Optimization Playbook for **${event.name}** (Target: ₹${event.targetBudget.toLocaleString('en-IN')}):\n• **Rigging & Lighting**: Bundle moving-head lights with existing venue trusses to save 18% on external scaffolding.\n• **Floral Repurposing**: Re-stage Varmala/Stage floral backdrops to the morning brunch or photo-booth station.\n• **Vendor Bundling**: Secure a 15% combo discount by hiring Photography + Drone Cinematography under a unified production crew.\n• **Strict 10% Reserve**: Keep 10% of total funds in reserve for unexpected power hookup and generator fuel fees.`,
    suggestedActions: [
      {
        type: 'add_task',
        label: '+ Audit Vendor Quotes for Hidden Costs',
        payload: { task: { title: 'Audit Vendor Line Items for Fuel & Overtime Charges', horizon: '1_month', category: 'Finance & Contracts', priority: 'critical' } },
      },
    ],
  };
}
