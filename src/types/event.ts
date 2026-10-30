import type { EventTypeKey, CurrencyKey, EventSettingKey } from '../constants';

export type EventType = EventTypeKey;
export type Currency = CurrencyKey;
export type EventSetting = EventSettingKey;

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
