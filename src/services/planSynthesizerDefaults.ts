import { EventData, EventType, EventSetting, Currency } from '../types/event';
import { BudgetItem, PaymentMilestone } from '../types/budget';
import { Vendor } from '../types/vendor';
import { MacroTask, DayOfActivity } from '../types/timeline';
import { Guest, ZoneCapacity } from '../types/guest';

export interface NewEventFormInput {
  name: string;
  type: EventType;
  date: string;
  city: string;
  setting: EventSetting;
  guestCount: number;
  targetBudget: number;
  currency: Currency;
  culturalPreferences: string;
}

export function buildEventData(input: NewEventFormInput, ts: number): EventData {
  return {
    id: `event-custom-${ts}`,
    name: input.name,
    type: input.type,
    date: input.date,
    city: input.city,
    setting: input.setting,
    guestCount: input.guestCount,
    targetBudget: input.targetBudget,
    currency: input.currency,
    culturalPreferences: input.culturalPreferences,
    subEvents: [
      {
        id: `se-${ts}-1`,
        name: input.type === 'wedding' ? 'Ceremony & Vows' : input.type === 'birthday' ? 'Evening Soirée' : 'Plenary Summit',
        date: input.date,
        startTime: '16:00',
        endTime: '21:00',
        venueName: `${input.city} Signature Event Space`,
        guestCount: input.guestCount,
        notes: `Tailored for ${input.culturalPreferences || 'custom client vision'}`,
      },
    ],
  };
}

export function buildBudgetAndMilestones(budget: number, guestCount: number, date: string, city: string, ts: number): {
  budgetItems: BudgetItem[];
  paymentMilestones: PaymentMilestone[];
} {
  const venueCost = Math.round(budget * 0.35);
  const cateringCost = Math.round(budget * 0.30);
  const decorCost = Math.round(budget * 0.15);
  const photoCost = Math.round(budget * 0.10);
  const bufferCost = Math.round(budget * 0.10);

  const budgetItems: BudgetItem[] = [
    { id: `b-${ts}-1`, category: 'venue', name: 'Primary Venue Booking & Licences', allocated: venueCost, vendorQuote: venueCost, actualContracted: venueCost, amountPaid: Math.round(venueCost * 0.5), isLocked: true },
    { id: `b-${ts}-2`, category: 'catering', name: `Gourmet Catering (${guestCount} pax)`, allocated: cateringCost, vendorQuote: cateringCost, actualContracted: cateringCost, amountPaid: Math.round(cateringCost * 0.4), isLocked: false },
    { id: `b-${ts}-3`, category: 'decor', name: 'Styling, Floral & Ambient Illumination', allocated: decorCost, vendorQuote: decorCost, actualContracted: decorCost, amountPaid: 0, isLocked: false },
    { id: `b-${ts}-4`, category: 'av_photo', name: 'Master Photography & High-Definition AV Rig', allocated: photoCost, vendorQuote: photoCost, actualContracted: photoCost, amountPaid: 0, isLocked: false },
    { id: `b-${ts}-5`, category: 'buffer', name: 'Contingency & Variable Reserve (10%)', allocated: bufferCost, vendorQuote: 0, actualContracted: 0, amountPaid: 0, isLocked: true },
  ];

  const paymentMilestones: PaymentMilestone[] = [
    { id: `pm-${ts}-1`, title: 'Venue Booking Advance', amount: Math.round(venueCost * 0.5), dueDate: date, status: 'paid', vendorName: `${city} Estate`, category: 'venue' },
    { id: `pm-${ts}-2`, title: 'Catering Advance Deposit', amount: Math.round(cateringCost * 0.4), dueDate: date, status: 'pending', vendorName: 'Gourmet Kitchens', category: 'catering' },
  ];

  return { budgetItems, paymentMilestones };
}

export function buildVendors(budget: number, city: string, ts: number): Vendor[] {
  const venueCost = Math.round(budget * 0.35);
  const cateringCost = Math.round(budget * 0.30);

  return [
    { id: `v-${ts}-1`, name: `${city} Signature Estate`, category: 'venue', status: 'contract_signed', estimatedPrice: venueCost, contractedPrice: venueCost, paidAmount: Math.round(venueCost * 0.5), contactName: 'Venue Manager', phone: '+91 90000 12345', email: 'events@venue.com', rating: 4.9, ratingCount: 42, location: city, notes: 'Includes power backups and basic illumination', deliverables: ['Full hall access', 'Valet zone', 'Green rooms'] },
    { id: `v-${ts}-2`, name: 'Artisanal Culinary Collective', category: 'catering', status: 'contacted', estimatedPrice: cateringCost, contractedPrice: cateringCost, paidAmount: 0, contactName: 'Executive Chef', phone: '+91 90000 23456', email: 'chef@culinary.com', rating: 4.8, ratingCount: 38, location: city, notes: 'Dietary preference tailored menu', deliverables: ['Buffet display', 'Beverage counter', 'Waitstaff'] },
  ];
}

export function buildTimelineTasks(date: string, ts: number): {
  macroTasks: MacroTask[];
  dayOfActivities: DayOfActivity[];
} {
  const macroTasks: MacroTask[] = [
    { id: `mt-${ts}-1`, horizon: '3_months', title: 'Execute Venue Agreement and Security Deposit', category: 'Venue', priority: 'critical', assignee: 'Host', dueDate: date, completed: true },
    { id: `mt-${ts}-2`, horizon: '1_month', title: 'Approve Food Tasting Menu & Bar Service Specs', category: 'Catering', priority: 'high', assignee: 'Planner', dueDate: date, completed: false },
    { id: `mt-${ts}-3`, horizon: '1_week', title: 'Lock Headcount & Share Seating Chart with Staff', category: 'Operations', priority: 'critical', assignee: 'Host', dueDate: date, completed: false },
  ];

  const dayOfActivities: DayOfActivity[] = [
    { id: `doa-${ts}-1`, startTime: '15:00', endTime: '16:00', durationMinutes: 60, title: 'Final AV Line Check & Production Setup', locationZone: 'Main Hall', poc: 'Tech Coordinator', completed: false },
    { id: `doa-${ts}-2`, startTime: '16:00', endTime: '18:00', durationMinutes: 120, title: 'Guest Arrival, Welcome Refreshments & Networking', locationZone: 'Welcome Foyer', poc: 'Host & Lead Usher', completed: false },
    { id: `doa-${ts}-3`, startTime: '18:00', endTime: '20:30', durationMinutes: 150, title: 'Main Program & Culinary Banquet', locationZone: 'Main Hall', poc: 'Event Director', completed: false },
  ];

  return { macroTasks, dayOfActivities };
}

export function buildRosterAndZones(guestCount: number, ts: number): {
  guests: Guest[];
  zones: ZoneCapacity[];
} {
  const guests: Guest[] = [
    { id: `g-${ts}-1`, name: 'Honored Key Guest', group: 'vip', rsvp: 'confirmed', plusOnes: 1, dietary: 'regular', tableOrZoneId: `zone-${ts}-1` },
    { id: `g-${ts}-2`, name: 'Lead Coordinator', group: 'general', rsvp: 'confirmed', plusOnes: 0, dietary: 'vegetarian', tableOrZoneId: `zone-${ts}-2` },
  ];

  const zones: ZoneCapacity[] = [
    { id: `zone-${ts}-1`, name: 'VIP & Executive Reserved Enclosure', maxCapacity: Math.round(guestCount * 0.3), assignedCount: Math.round(guestCount * 0.25), type: 'zone' },
    { id: `zone-${ts}-2`, name: 'General Banquet & Open Lounge', maxCapacity: Math.round(guestCount * 0.7), assignedCount: Math.round(guestCount * 0.5), type: 'zone' },
  ];

  return { guests, zones };
}
