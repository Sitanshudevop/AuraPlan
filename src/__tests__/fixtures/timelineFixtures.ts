import { DayOfActivity } from '../../types/timeline';

export const mockUnsortedActivities: DayOfActivity[] = [
  { id: '3', startTime: '19:00', endTime: '21:00', durationMinutes: 120, title: 'Banquet Dinner', locationZone: 'Courtyard', poc: 'Chef' },
  { id: '1', startTime: '08:30', endTime: '10:00', durationMinutes: 90, title: 'Morning Soundcheck', locationZone: 'Stage', poc: 'Audio Crew' },
  { id: '4', startTime: '21:30', endTime: '23:30', durationMinutes: 120, title: 'After-Party DJ Set', locationZone: 'Lounge', poc: 'DJ' },
  { id: '2', startTime: '14:00', endTime: '16:00', durationMinutes: 120, title: 'Baraat Procession', locationZone: 'Palace Gates', poc: 'Band' },
];

export const mockLocationConflictActivities: DayOfActivity[] = [
  {
    id: 'act-cocktails',
    startTime: '16:00',
    endTime: '18:00',
    durationMinutes: 120,
    title: 'Sunset Cocktails',
    locationZone: 'Lake Pavilion',
    poc: 'Hospitality Lead',
  },
  {
    id: 'act-photoshoot',
    startTime: '17:00',
    endTime: '19:00',
    durationMinutes: 120,
    title: 'Bridal Couple Golden Hour Shoot',
    locationZone: 'Lake Pavilion',
    poc: 'Lead Cinematographer',
  },
];

export const mockPocConflictActivities: DayOfActivity[] = [
  {
    id: 'act-sound',
    startTime: '10:00',
    endTime: '11:30',
    durationMinutes: 90,
    title: 'Main Stage Audio Soundcheck',
    locationZone: 'Auditorium A',
    poc: 'Praveen Sharma',
  },
  {
    id: 'act-livestream',
    startTime: '10:45',
    endTime: '12:00',
    durationMinutes: 75,
    title: 'Keynote Speaker Mic Rigging & Stream Sync',
    locationZone: 'Workshop Hall B',
    poc: 'Praveen Sharma',
  },
];

export const mockSequentialActivities: DayOfActivity[] = [
  {
    id: 'act-s1',
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    title: 'Opening Ceremony',
    locationZone: 'Ballroom',
    poc: 'Lead Planner',
  },
  {
    id: 'act-s2',
    startTime: '11:00',
    endTime: '12:00',
    durationMinutes: 60,
    title: 'Fireside Chat',
    locationZone: 'Ballroom',
    poc: 'Lead Planner',
  },
];

export const mockParallelActivities: DayOfActivity[] = [
  {
    id: 'p1',
    startTime: '14:00',
    endTime: '16:00',
    durationMinutes: 120,
    title: 'Mehendi Lounge Art',
    locationZone: 'Courtyard Lawn',
    poc: 'Mehendi Artist',
  },
  {
    id: 'p2',
    startTime: '14:30',
    endTime: '15:30',
    durationMinutes: 60,
    title: 'Sangeet Stage Lighting Truss Rigging',
    locationZone: 'Grand Ballroom',
    poc: 'Lighting Tech',
  },
];

