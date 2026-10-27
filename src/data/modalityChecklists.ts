import { EventType } from '../types/event';
import { BudgetCategory } from '../types/budget';

export interface ChecklistRequirement {
  id: string;
  category: BudgetCategory;
  roleTitle: string;
  description: string;
  priority: 'critical' | 'recommended' | 'optional';
  defaultEstimate: number;
  iconName: string;
}

export const MODALITY_CHECKLISTS: Record<EventType, ChecklistRequirement[]> = {
  wedding: [
    { id: 'w-venue', category: 'venue', roleTitle: 'Venue & Heritage Lawn', description: 'Palace, banquet, or lawn with power backup', priority: 'critical', defaultEstimate: 1200000, iconName: 'building' },
    { id: 'w-cater', category: 'catering', roleTitle: 'Catering & Banquets', description: 'Multi-course royal feasts, live chaat, high-tea', priority: 'critical', defaultEstimate: 950000, iconName: 'utensils' },
    { id: 'w-photo', category: 'av_photo', roleTitle: 'Photography & Cinema', description: 'Drone coverage, candid portraiture, teasers', priority: 'critical', defaultEstimate: 450000, iconName: 'camera' },
    { id: 'w-decor', category: 'decor', roleTitle: 'Mandap & Floral Decor', description: 'Fresh floral canopy, stage trussing, ambiance', priority: 'critical', defaultEstimate: 600000, iconName: 'palette' },
    { id: 'w-sound', category: 'entertainment', roleTitle: 'DJ, Dhol & Acoustic Stage', description: 'Sangeet sound systems, stage lighting, DJ', priority: 'recommended', defaultEstimate: 200000, iconName: 'music' },
    { id: 'w-rituals', category: 'logistics', roleTitle: 'Pandit & Ritual Samagri', description: 'Vedic marriage officiant, havan setup, puja kit', priority: 'critical', defaultEstimate: 50000, iconName: 'file' },
    { id: 'w-favors', category: 'buffer', roleTitle: 'Invitations & Guest Favors', description: 'Luxury Mithai hampers, welcome itinerary bags', priority: 'optional', defaultEstimate: 150000, iconName: 'gift' },
  ],
  birthday: [
    { id: 'b-venue', category: 'venue', roleTitle: 'Party Venue / Lounge', description: 'Rooftop lounge, cafe, or indoor fun zone', priority: 'critical', defaultEstimate: 60000, iconName: 'building' },
    { id: 'b-cake', category: 'catering', roleTitle: 'Custom Artisanal Bakery', description: 'Multi-tier theme cake, cupcakes, macarons', priority: 'critical', defaultEstimate: 18000, iconName: 'utensils' },
    { id: 'b-decor', category: 'decor', roleTitle: 'Balloon Arch & Backdrop', description: 'Organic balloon garland, LED neon sign, props', priority: 'critical', defaultEstimate: 35000, iconName: 'palette' },
    { id: 'b-host', category: 'entertainment', roleTitle: 'Host / DJ / Magician', description: 'Party emcee, interactive games, live music', priority: 'recommended', defaultEstimate: 25000, iconName: 'music' },
    { id: 'b-photo', category: 'av_photo', roleTitle: 'Candid Party Photographer', description: 'High-res photos, reel maker, 3-hour coverage', priority: 'recommended', defaultEstimate: 20000, iconName: 'camera' },
    { id: 'b-snacks', category: 'catering', roleTitle: 'Finger Foods & Mocktail Bar', description: 'Sliders, pizzas, dessert station, drinks', priority: 'critical', defaultEstimate: 50000, iconName: 'utensils' },
    { id: 'b-favors', category: 'buffer', roleTitle: 'Return Gifts & Goodie Bags', description: 'Custom souvenir hampers for each attendee', priority: 'optional', defaultEstimate: 15000, iconName: 'gift' },
  ],
  community: [
    { id: 'c-venue', category: 'venue', roleTitle: 'Public Ground / Auditorium', description: 'Amphitheater, sports ground, or hall lease', priority: 'critical', defaultEstimate: 300000, iconName: 'building' },
    { id: 'c-av', category: 'av_photo', roleTitle: 'Stage Sound & Projectors', description: 'Line array PA system, microphones, LED wall', priority: 'critical', defaultEstimate: 250000, iconName: 'camera' },
    { id: 'c-permits', category: 'logistics', roleTitle: 'Municipal Permits & Fire NOC', description: 'Police clearance, acoustic limit permissions', priority: 'critical', defaultEstimate: 45000, iconName: 'file' },
    { id: 'c-security', category: 'logistics', roleTitle: 'Security & Crowd Barricades', description: 'Guard personnel, bag screening, perimeter mojo', priority: 'critical', defaultEstimate: 80000, iconName: 'shield' },
    { id: 'c-waste', category: 'logistics', roleTitle: 'Green Sanitation & Clean-up', description: 'Recycling points, post-event waste clearing', priority: 'critical', defaultEstimate: 35000, iconName: 'file' },
    { id: 'c-food', category: 'catering', roleTitle: 'Food Trucks & Refreshments', description: 'Sanctioned food stalls, drinking water tanks', priority: 'recommended', defaultEstimate: 150000, iconName: 'utensils' },
    { id: 'c-medical', category: 'buffer', roleTitle: 'First Aid & EMT Station', description: 'Paramedic tent with emergency equipment', priority: 'critical', defaultEstimate: 40000, iconName: 'shield' },
  ],
};
