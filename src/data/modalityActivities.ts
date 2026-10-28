import { EventType } from '../types/event';
import { BudgetCategory } from '../types/budget';

export interface PersonalizedActivity {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  location: string;
  poc: string;
  estimatedCost: number;
  category: BudgetCategory;
  culturalNote?: string;
}

export const MODALITY_ACTIVITIES: Record<EventType, PersonalizedActivity[]> = {
  wedding: [
    {
      id: 'act-w-1',
      title: 'Baraat Grand Entry Flash Mob',
      description: 'Coordinated procession dance with dhol troupe, brass band, and safe cold pyrotechnics',
      durationMinutes: 60,
      location: 'Grand Driveway / Forecourt',
      poc: 'Groomsmen Lead & Dhol Master',
      estimatedCost: 45000,
      category: 'entertainment',
      culturalNote: 'Traditional celebratory groom procession with modern dance curve',
    },
    {
      id: 'act-w-2',
      title: 'Sangeet Dance-Off & Trophy Battle',
      description: 'Friendly Groom vs Bride family choreography sequence with synchronized LED wall visuals',
      durationMinutes: 90,
      location: 'Royal Ballroom Stage',
      poc: 'Choreographer & Emcee',
      estimatedCost: 35000,
      category: 'entertainment',
      culturalNote: 'High-energy family performance competition with judges scorecards',
    },
    {
      id: 'act-w-3',
      title: 'Joota Chupai (Shoe-Stealing) Protocol',
      description: 'Traditional playful negotiation between bridesmaids and groom for the wedding footwear',
      durationMinutes: 30,
      location: 'Mandap Pavilion',
      poc: 'Maid of Honor & Best Man',
      estimatedCost: 15000,
      category: 'buffer',
      culturalNote: 'Centuries-old lighthearted wedding extortion tradition with calligraphy cash envelope',
    },
    {
      id: 'act-w-4',
      title: 'Late-Night Chai & Street Food Counter',
      description: 'Artisanal ginger chai, midnight samosas, and warm Maggi bowls for late-night party guests',
      durationMinutes: 120,
      location: 'Poolside Lounge Courtyard',
      poc: 'Banquet Sous Chef',
      estimatedCost: 40000,
      category: 'catering',
      culturalNote: 'Beloved post-midnight comfort food indulgence',
    },
  ],
  birthday: [
    {
      id: 'act-b-1',
      title: 'Retro Arcade High-Score Tournament',
      description: 'Custom vintage arcade cabinets (Pac-Man, Street Fighter) with live digital leaderboard',
      durationMinutes: 120,
      location: 'Lounge Arcade Zone',
      poc: 'Games Coordinator',
      estimatedCost: 25000,
      category: 'entertainment',
    },
    {
      id: 'act-b-2',
      title: 'Blindfolded Artisanal Dessert Tasting',
      description: 'Interactive tasting challenge featuring micro-pastries before the official cake cutting',
      durationMinutes: 40,
      location: 'Main Dining Terrace',
      poc: 'Pastry Chef & Host',
      estimatedCost: 12000,
      category: 'catering',
    },
    {
      id: 'act-b-3',
      title: 'Instant Polaroid Wall & Memory Book',
      description: 'Vintage film cameras with glitter pens, metallic washi tape, and keepsake guestbook',
      durationMinutes: 180,
      location: 'Entrance Foyer Gallery',
      poc: 'Welcome Ambassador',
      estimatedCost: 15000,
      category: 'av_photo',
    },
    {
      id: 'act-b-4',
      title: 'Midnight Neon Toast & Confetti Drop',
      description: 'Synchronized soundscape drop, UV glow accessories, and sparkling toast celebration',
      durationMinutes: 20,
      location: 'Rooftop DJ Dancefloor',
      poc: 'Resident DJ & Mixologist',
      estimatedCost: 18000,
      category: 'entertainment',
    },
  ],
  community: [
    {
      id: 'act-c-1',
      title: 'Community Collaborative Mural Canvas',
      description: '10-meter community graffiti wall guided by local artists where all attendees leave their mark',
      durationMinutes: 240,
      location: 'Artisan Pavilion Lawn',
      poc: 'Community Arts Director',
      estimatedCost: 35000,
      category: 'decor',
    },
    {
      id: 'act-c-2',
      title: 'Local Artisan & Maker Showcase',
      description: '12 curated neighborhood makers displaying handmade sustainable crafts and eco-produce',
      durationMinutes: 300,
      location: 'Perimeter Canopy Stalls',
      poc: 'Vendor Coordinator',
      estimatedCost: 40000,
      category: 'venue',
    },
    {
      id: 'act-c-3',
      title: 'Battle of the Acoustic Ensembles',
      description: 'Open stage showcase featuring 4 local youth bands and acoustic singer-songwriters',
      durationMinutes: 120,
      location: 'Acoustic Amphitheater',
      poc: 'Stage Manager & Audio Engineer',
      estimatedCost: 30000,
      category: 'entertainment',
    },
    {
      id: 'act-c-4',
      title: 'Civic Leadership Awards & Grand Raffle',
      description: 'Ceremony honoring community volunteers and drawing raffle prizes sponsored by local businesses',
      durationMinutes: 45,
      location: 'Main Stage',
      poc: 'Festival Chair & Emcee',
      estimatedCost: 20000,
      category: 'buffer',
    },
  ],
};

