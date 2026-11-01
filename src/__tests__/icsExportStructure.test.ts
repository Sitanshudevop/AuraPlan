import { describe, it, expect } from 'vitest';
import * as utilsIcs from '../utils/IcsGenerator';
import {
  escapeIcsText,
  generateIcsCalendar,
  foldIcsLine,
} from '../features/timeline/IcsGenerator';
import { EventData } from '../types/event';
import { MacroTask, DayOfActivity } from '../types/timeline';

describe('iCalendar RFC 5545 Text Escaping & Octet Folding', () => {
  it('escapes backslashes, semicolons, commas, and newlines', () => {
    expect(utilsIcs.generateIcsCalendar).toBeDefined();
    expect(escapeIcsText('Hello, World; Welcome\\Home')).toBe('Hello\\, World\\; Welcome\\\\Home');
    expect(escapeIcsText('Line 1\nLine 2\r\nLine 3')).toBe('Line 1\\nLine 2\\nLine 3');
    expect(escapeIcsText('')).toBe('');
    expect(escapeIcsText(null as unknown as string)).toBe('');
  });

  it('folds lines exceeding 75 octets without breaking multibyte UTF-8 characters', () => {
    const encoder = new TextEncoder();
    const longLine = 'DESCRIPTION:This is a very long celebration description that definitely exceeds seventy-five octets in length and requires strict RFC 5545 folding.';
    const folded = foldIcsLine(longLine);
    const segments = folded.split('\r\n');

    expect(segments.length).toBeGreaterThan(1);
    segments.forEach((seg, index) => {
      expect(encoder.encode(seg).length).toBeLessThanOrEqual(75);
      if (index > 0) {
        expect(seg.startsWith(' ')).toBe(true);
      }
    });

    // Verify round-trip unfolding
    const unfolded = folded.replace(/\r\n /g, '');
    expect(unfolded).toBe(longLine);
  });

  it('safely folds multibyte Hindi and Emoji characters without mid-character corruption', () => {
    const encoder = new TextEncoder();
    const multiByteLine = 'SUMMARY:विवाह समारोह एवं संगीत संध्या उत्सव 🌸 🎉 🪔 🏰 - Detailed Royal Wedding Event Schedule';
    const folded = foldIcsLine(multiByteLine, 50); // fold at 50 octets to force boundary crossing
    const segments = folded.split('\r\n');

    segments.forEach((seg) => {
      expect(encoder.encode(seg).length).toBeLessThanOrEqual(50);
    });

    const unfolded = folded.replace(/\r\n /g, '');
    expect(unfolded).toBe(multiByteLine);
  });

  it('generates compliant VCALENDAR text structure with escaped values', () => {
    const mockEvent: EventData = {
      id: 'evt-1',
      name: 'Elena & Lucas; Wedding, Gala',
      type: 'wedding',
      date: '2026-10-30',
      guestCount: 150,
      targetBudget: 50000,
      city: 'San Francisco, CA',
      currency: 'USD',
      setting: 'indoor',
      culturalPreferences: 'Western Traditional',
      subEvents: [],
    };

    const mockTasks: MacroTask[] = [
      {
        id: 't-1',
        title: 'Review contracts; sign & deposit',
        category: 'Legal, Admin',
        dueDate: '2026-10-25',
        completed: true,
        priority: 'high',
        assignee: 'Planner & Couple',
        horizon: '3_months',
      },
    ];

    const mockActivities: DayOfActivity[] = [
      {
        id: 'a-1',
        title: 'First Look, Photos',
        startTime: '14:00',
        endTime: '15:00',
        durationMinutes: 60,
        locationZone: 'Garden, North Lawn',
        poc: 'Photographer',
      },
    ];

    const ics = generateIcsCalendar(mockEvent, mockTasks, mockActivities);

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('VERSION:2.0');
    expect(ics).toContain('X-WR-CALNAME:Elena & Lucas\\; Wedding\\, Gala Timeline');
    expect(ics).toContain('SUMMARY:[HIGH] Review contracts\\; sign & deposit');
    expect(ics).toContain('LOCATION:Garden\\, North Lawn');
    expect(ics).toContain('END:VCALENDAR');
  });
});
