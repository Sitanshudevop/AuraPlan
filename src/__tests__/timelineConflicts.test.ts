import { describe, it, expect } from 'vitest';
import {
  detectScheduleConflicts,
  sortActivitiesChronologically,
  timeToMinutes,
} from '../features/timeline/ConflictDetector';
import { generateIcsCalendar } from '../features/timeline/IcsGenerator';
import { DayOfActivity } from '../types/timeline';
import { workspaceReducer } from '../context/workspaceReducer';
import { weddingPreset } from '../data/weddingPreset';

describe('Timeline Conflicts & Chronological Run-of-Show', () => {
  describe('Chronological Sorting', () => {
    it('converts time strings to accurate minute offsets', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('08:30')).toBe(510);
      expect(timeToMinutes('14:45')).toBe(885);
      expect(timeToMinutes('23:59')).toBe(1439);
    });

    it('sorts scrambled schedule activities in strict chronological order by start time', () => {
      const unsorted: DayOfActivity[] = [
        { id: '3', startTime: '19:00', endTime: '21:00', durationMinutes: 120, title: 'Banquet Dinner', locationZone: 'Courtyard', poc: 'Chef' },
        { id: '1', startTime: '08:30', endTime: '10:00', durationMinutes: 90, title: 'Morning Soundcheck', locationZone: 'Stage', poc: 'Audio Crew' },
        { id: '4', startTime: '21:30', endTime: '23:30', durationMinutes: 120, title: 'After-Party DJ Set', locationZone: 'Lounge', poc: 'DJ' },
        { id: '2', startTime: '14:00', endTime: '16:00', durationMinutes: 120, title: 'Baraat Procession', locationZone: 'Palace Gates', poc: 'Band' },
      ];

      const sorted = sortActivitiesChronologically(unsorted);

      expect(sorted[0].id).toBe('1');
      expect(sorted[0].startTime).toBe('08:30');
      expect(sorted[1].id).toBe('2');
      expect(sorted[1].startTime).toBe('14:00');
      expect(sorted[2].id).toBe('3');
      expect(sorted[2].startTime).toBe('19:00');
      expect(sorted[3].id).toBe('4');
      expect(sorted[3].startTime).toBe('21:30');
    });
  });

  describe('Overlapping Schedule Conflict Detection', () => {
    it('detects location zone double-booking when two activities overlap in the same area', () => {
      const activities: DayOfActivity[] = [
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

      const conflicts = detectScheduleConflicts(activities);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].reason).toBe('location');
      expect(conflicts[0].activity1.id).toBe('act-cocktails');
      expect(conflicts[0].activity2.id).toBe('act-photoshoot');
      expect(conflicts[0].conflictDetail).toContain('Lake Pavilion');
    });

    it('detects point of contact double-booking when the same POC is assigned simultaneously', () => {
      const activities: DayOfActivity[] = [
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

      const conflicts = detectScheduleConflicts(activities);

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].reason).toBe('poc');
      expect(conflicts[0].conflictDetail).toContain('Praveen Sharma');
    });

    it('returns zero conflicts for sequential back-to-back activities sharing location or POC', () => {
      const sequential: DayOfActivity[] = [
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

      const conflicts = detectScheduleConflicts(sequential);
      expect(conflicts.length).toBe(0);
    });

    it('returns zero conflicts when activities overlap in time but operate in distinct zones with different POCs', () => {
      const parallel: DayOfActivity[] = [
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

      const conflicts = detectScheduleConflicts(parallel);
      expect(conflicts.length).toBe(0);
    });
  });

  describe('+30m Auto-Resolve Conflict Action', () => {
    it('shifts target activity start and end time by +30 minutes in workspaceReducer', () => {
      const state = {
        ...weddingPreset,
        dayOfActivities: [
          {
            id: 'act-shift-target',
            startTime: '15:00',
            endTime: '16:30',
            durationMinutes: 90,
            title: 'Welcome Hi-Tea',
            locationZone: 'Terrace',
            poc: 'Catering Captain',
          },
        ],
      };

      const nextState = workspaceReducer(state, {
        type: 'SHIFT_ACTIVITY_30M',
        payload: { id: 'act-shift-target' },
      });

      const shifted = nextState.dayOfActivities[0];
      expect(shifted.startTime).toBe('15:30');
      expect(shifted.endTime).toBe('17:00');
    });

    it('resolves active schedule conflict after triggering +30m auto-resolve', () => {
      // Act 1: 15:00 - 16:30
      // Act 2: 16:00 - 17:00 (Overlaps by 30 mins at same location)
      const act1: DayOfActivity = {
        id: 'act-1',
        startTime: '15:00',
        endTime: '16:30',
        durationMinutes: 90,
        title: 'VIP Lounge Setup',
        locationZone: 'Clubhouse',
        poc: 'Decor Team',
      };
      const act2: DayOfActivity = {
        id: 'act-2',
        startTime: '16:00',
        endTime: '17:00',
        durationMinutes: 60,
        title: 'Lounge Photo Call',
        locationZone: 'Clubhouse',
        poc: 'Photo Team',
      };

      // Initially conflicting
      expect(detectScheduleConflicts([act1, act2]).length).toBe(1);

      // Apply +30m resolution to act2
      const testState = {
        ...weddingPreset,
        dayOfActivities: [act1, act2],
      };
      const resolvedState = workspaceReducer(testState, {
        type: 'SHIFT_ACTIVITY_30M',
        payload: { id: 'act-2' },
      });

      // After shift, act2 is 16:30 - 17:30 (sequential with act1 ending at 16:30)
      const resolvedConflicts = detectScheduleConflicts(resolvedState.dayOfActivities);
      expect(resolvedConflicts.length).toBe(0);
    });
  });

  describe('.ics Calendar Export', () => {
    it('generates standard RFC 5545 compliant calendar export with milestones', () => {
      const ics = generateIcsCalendar(
        weddingPreset.event,
        weddingPreset.macroTasks,
        weddingPreset.dayOfActivities
      );

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//AuraPlan//Vow and Venue Calendar//EN');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('END:VCALENDAR');
    });
  });
});
