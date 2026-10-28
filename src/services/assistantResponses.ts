import { EventData } from '../types/event';
import { AssistantMessage } from './planningAssistantService';

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

  // 2. Sangeet, Music, Dance & Entertainment
  if (q.includes('sangeet') || q.includes('dance') || q.includes('music') || q.includes('dj') || q.includes('song') || q.includes('choreograph')) {
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

  // 3. Catering & Dietary Buffers
  if (q.includes('catering') || q.includes('plate') || q.includes('dietary') || q.includes('food') || q.includes('buffet') || q.includes('menu')) {
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

  // 4. Weather & Rain Contingency
  if (q.includes('rain') || q.includes('weather') || q.includes('contingency') || q.includes('outdoor') || q.includes('lawn')) {
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

  // 5. Buffer Times Baraat to Varmala & Transitions
  if (q.includes('buffer') || q.includes('baraat') || q.includes('varmala') || q.includes('transition') || q.includes('delay')) {
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

  // 6. Budget Optimization & Savings
  if (q.includes('save') || q.includes('cut cost') || q.includes('budget') || q.includes('expensive') || q.includes('negotiate')) {
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

  // 7. Decor, Mandap & Theme Concepts
  if (q.includes('decor') || q.includes('theme') || q.includes('flower') || q.includes('lighting') || q.includes('mandap') || q.includes('stage')) {
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

  // 8. Photography & Video Shot List
  if (q.includes('photo') || q.includes('video') || q.includes('photographer') || q.includes('camera') || q.includes('drone')) {
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

  // 9. Permits, Security & Compliance
  if (q.includes('permit') || q.includes('municipal') || q.includes('police') || q.includes('security') || q.includes('license')) {
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

  // 10. Birthday / Community Specific Prompts
  if (q.includes('cake') || q.includes('game') || q.includes('favor') || q.includes('adult') || q.includes('volunteer') || q.includes('sponsor')) {
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

  // 11. Intelligent Dynamic Fallback
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
