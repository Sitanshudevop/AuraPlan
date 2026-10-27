export interface ColorSwatch {
  name: string;
  hex: string;
  role: string;
}

export interface DecorConcept {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  timelineTask: string;
  category: 'decor' | 'av_photo' | 'venue';
}

export interface MenuItemConcept {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedCostPerHead: number;
}

export interface EngagementActivity {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  timelineTask: string;
  durationMinutes: number;
}

export interface ThemeIdea {
  id: string;
  title: string;
  vibe: string;
  description: string;
  colors: ColorSwatch[];
  decorConcepts: DecorConcept[];
  menuItems: MenuItemConcept[];
  activities: EngagementActivity[];
}
