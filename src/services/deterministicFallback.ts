import { ThemeIdea } from '../types/ideation';
import { VendorVetQuestions } from '../types/vendor';

export function getLocalVendorVet(vendorName: string, category: string, contractedPrice: number): VendorVetQuestions {
  return {
    whatsappOutreachScript: `Hi ${vendorName} team! We are finalizing contracts for our celebration and love your portfolio. Our current benchmark for ${category} is within ₹${Math.round(contractedPrice * 0.9).toLocaleString('en-IN')}. If we sign this week and pay a 40% upfront deposit, can we align on this figure including all taxes and sound/service surcharges? Look forward to working together!`,
    emailOutreachScript: `Subject: Partnership Proposal & Commercial Review — ${vendorName}\n\nDear ${vendorName} Team,\n\nWe have thoroughly reviewed your initial quote for our upcoming event. Your past work in ${category} stands out, and we would love to have you on board.\n\nTo formalize the booking within our allocated board budget, we propose a contracted rate of ₹${Math.round(contractedPrice * 0.92).toLocaleString('en-IN')}, inclusive of transport, setup crew, and standard insurance waivers. In return, we offer prompt payment milestones and guaranteed vendor recognition.\n\nPlease confirm if this works so we may execute the agreement.\n\nWarm regards,\nEvent Operations Desk`,
    vettingQuestions: [
      `What is your specific contingency policy if weather or generator power forces an abrupt venue switch?`,
      `Are all crew meals, local transport fees, and overtime rates after 11:00 PM explicitly included in this quote?`,
      `Do you provide on-site backup equipment or duplicate staff in case of unexpected technical failure or illness?`,
      `What is the exact payment milestone breakdown and refund terms in case of government restriction or force majeure?`,
      `Who will be the physically present point of contact on event day, and what time does your team arrive on site?`,
    ],
    hiddenCostRedFlags: [
      `Check for unstated generator fuel, diesel surcharges, or power-hookup fees by the venue.`,
      `Watch out for per-hour overtime penalties that escalate significantly past midnight.`,
      `Clarify whether corkage fees, service charges, or breakdown cleanup labor are extra.`,
      `Confirm if sound board patch fees or DJ license fees (PPL/IPRS) are included or passed through.`,
    ],
  };
}

export function getLocalThemeIdea(eventType: string, vibePreference: string): ThemeIdea {
  if (eventType === 'wedding') {
    return {
      id: `theme-local-${Date.now()}`,
      title: 'Regal Saffron & Ivory Heritage Serenade',
      vibe: vibePreference || 'Royal, timeless, warmly lit with marigold and brass accents',
      description: 'A sumptuous palatial atmosphere marrying traditional royal heritage with modern minimalist candle scapes and soulful acoustic instrumentation.',
      colors: [
        { name: 'Heritage Saffron', hex: '#E07A5F', role: 'Primary Accent & Floral Drapes' },
        { name: 'Warm Alabaster', hex: '#FAF9F6', role: 'Surfaces & Linen Canopy' },
        { name: 'Muted Brass Gold', hex: '#D4AF37', role: 'Candelabras & Cutlery' },
        { name: 'Deep Forest Moss', hex: '#2D4A3E', role: 'Foliage & Backdrops' },
      ],
      decorConcepts: [
        { id: 'dc-1', title: 'Suspended Brass Urli & Tuberose Floating Chandelier', description: 'Handcrafted bell-metal urlis with fragrant mogra and tea lights floating above guest reception.', estimatedCost: 18000, timelineTask: 'Hang floral urlis 3h before guest arrival', category: 'decor' },
        { id: 'dc-2', title: 'Ambient Amber Architectural Uplighting', description: 'Warm 2700K tungsten wash lighting highlighting venue sandstone pillars and stone arches.', estimatedCost: 22000, timelineTask: 'Test dimmer board wash 4h before evening', category: 'av_photo' },
      ],
      menuItems: [
        { id: 'mi-1', name: 'Smoked Saffron Paneer Tikka with Mint Foam', category: 'Hors d’oeuvres', description: 'Clay-oven charred cottage cheese infused with Kashmiri saffron threads', estimatedCostPerHead: 240 },
        { id: 'mi-2', name: 'Rose Petal Infused Sparkling Kokum Cooler', category: 'Beverage', description: 'Hand-pressed kokum cordial with fizz and candied wild rose petals', estimatedCostPerHead: 90 },
      ],
      activities: [
        { id: 'ea-1', title: 'Live Perfumery & Ittar Blending Bar', description: 'Guests blend their custom pocket sandalwood or jasmine ittar fragrance as a keepsake.', estimatedCost: 15000, timelineTask: 'Stage ittar bar display in garden pavilion', durationMinutes: 120 },
      ],
    };
  }

  return {
    id: `theme-local-${Date.now()}`,
    title: 'Minimalist Monolith & Neon Noir',
    vibe: vibePreference || 'Sharp, modern, high-contrast with industrial greenery',
    description: 'An elevated, high-craft social atmosphere focused on bespoke culinary moments and seamless indie audio.',
    colors: [
      { name: 'Carbon Obsidian', hex: '#09090B', role: 'Background Canvas' },
      { name: 'Crisp Alabaster', hex: '#FAF9F6', role: 'Typography & Highlights' },
      { name: 'Electric Emerald', hex: '#059669', role: 'Accent Lighting & Foliage' },
      { name: 'Warm Amber Filament', hex: '#D97706', role: 'Edison Bulb Glow' },
    ],
    decorConcepts: [
      { id: 'dc-3', title: 'Custom Warm-White Neon Monogram Signage', description: 'Minimalist typographic neon sculpture framed by wild fiddle-leaf ferns.', estimatedCost: 12000, timelineTask: 'Mount neon wall fixture and test transformer', category: 'decor' },
      { id: 'dc-4', title: 'Matte Black Bar Counter with Smoked Mirror Display', description: 'High-contrast mixology bar with backlit crystal glassware display.', estimatedCost: 16000, timelineTask: 'Position modular bar frame on sky terrace', category: 'venue' },
    ],
    menuItems: [
      { id: 'mi-3', name: 'Truffle & Wild Mushroom Tartlets', category: 'Bites', description: 'Crisp butter pastry with porcini duxelles and shaved black truffle', estimatedCostPerHead: 190 },
      { id: 'mi-4', name: 'Smoked Rosemary Grapefruit Paloma', category: 'Cocktail', description: 'Flambéed rosemary sprig with pink grapefruit soda and artisanal agave', estimatedCostPerHead: 110 },
    ],
    activities: [
      { id: 'ea-2', title: 'Curated Vinyl Listening Station & Audio Guestbook', description: 'Guests record 30-second audio voice notes over a vintage rotary telephone.', estimatedCost: 8000, timelineTask: 'Check audio recorder levels and flash drive', durationMinutes: 90 },
    ],
  };
}
