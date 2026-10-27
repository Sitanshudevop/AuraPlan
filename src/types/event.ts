export type EventType = 'wedding' | 'birthday' | 'community';
export type Currency = 'INR' | 'USD';
export type EventSetting = 'indoor' | 'outdoor' | 'hybrid';

export interface SubEvent {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  guestCount: number;
  notes?: string;
}

export interface EventData {
  id: string;
  name: string;
  type: EventType;
  date: string;
  city: string;
  setting: EventSetting;
  guestCount: number;
  targetBudget: number;
  currency: Currency;
  culturalPreferences: string;
  subEvents: SubEvent[];
  notes?: string;
  cakeTier?: string;
  vibePlaylist?: string;
  favorBudget?: number;
  speakerTracks?: string[];
  volunteerRoles?: string[];
}
