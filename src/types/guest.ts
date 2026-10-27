export type RsvpStatus = 'confirmed' | 'pending' | 'declined';

export type GuestGroup =
  | 'bride'
  | 'groom'
  | 'vip'
  | 'general'
  | 'speaker_sponsor';

export type DietaryTag =
  | 'regular'
  | 'vegetarian'
  | 'jain'
  | 'vegan'
  | 'gluten_free'
  | 'nut_free';

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  group: GuestGroup;
  rsvp: RsvpStatus;
  plusOnes: number;
  dietary: DietaryTag;
  tableOrZoneId?: string;
  notes?: string;
}

export interface ZoneCapacity {
  id: string;
  name: string;
  maxCapacity: number;
  assignedCount: number;
  type: 'table' | 'zone' | 'lounge';
}
