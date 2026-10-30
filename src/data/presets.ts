import { EventWorkspaceState } from '../types/state';
import { weddingPreset } from './weddingPreset';
import { birthdayPreset } from './birthdayPreset';
import { communityPreset } from './communityPreset';

export const INITIAL_PRESETS: Record<string, EventWorkspaceState> = {
  'preset-wedding-udaipur': weddingPreset,
  'preset-birthday-botanical': birthdayPreset,
  'preset-community-builders': communityPreset,
};

export const PRESET_OPTIONS = [
  {
    id: 'preset-wedding-udaipur',
    title: 'Udaipur Royal Wedding',
    badge: 'Wedding',
    stats: '250 Guests · 14 Vendors',
    type: 'wedding' as const,
  },
  {
    id: 'preset-birthday-botanical',
    title: 'Midnight Botanical Gala',
    badge: 'Birthday',
    stats: '65 Guests · 8 Vendors',
    type: 'birthday' as const,
  },
  {
    id: 'preset-community-builders',
    title: 'AI Builders Summit',
    badge: 'Community',
    stats: '400 Guests · 3 Sponsors',
    type: 'community' as const,
  },
];
