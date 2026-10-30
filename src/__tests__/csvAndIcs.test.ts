import { describe, it, expect } from 'vitest';
import { escapeCsvCell, buildCsv } from '../utils/csv';
import { escapeIcsText, generateIcsCalendar } from '../features/timeline/IcsGenerator';
import { EventData } from '../types/event';
import { MacroTask, DayOfActivity } from '../types/timeline';

describe('CSV Security and Formatting (RFC 4180 & CWE-1236)', () => {
  it('neutralizes spreadsheet formula injection prefixes (=, +, -, @, \\t, \\r)', () => {
    expect(escapeCsvCell('=1+1')).toBe(`"'=1+1"`);
    expect(escapeCsvCell('+SUM(A1:A10)')).toBe(`"'+SUM(A1:A10)"`);
    expect(escapeCsvCell('-2+3')).toBe(`"'-2+3"`);
    expect(escapeCsvCell('@cmd|/C calc')).toBe(`"'@cmd|/C calc"`);
    expect(escapeCsvCell('\tmalicious')).toBe(`"'\tmalicious"`);
    expect(escapeCsvCell('\rmalicious')).toBe(`"'\rmalicious"`);
  });

  it('preserves valid numbers and booleans as safe primitives', () => {
    expect(escapeCsvCell(123)).toBe('123');
    expect(escapeCsvCell(-45.67)).toBe('-45.67');
    expect(escapeCsvCell(0)).toBe('0');
    expect(escapeCsvCell(true)).toBe('Yes');
    expect(escapeCsvCell(false)).toBe('No');
  });

  it('handles null, undefined, and empty values gracefully', () => {
    expect(escapeCsvCell(null)).toBe('');
    expect(escapeCsvCell(undefined)).toBe('');
    expect(escapeCsvCell('')).toBe('');
  });

  it('escapes embedded quotes, commas, and newlines per RFC 4180', () => {
    expect(escapeCsvCell('Hello, World')).toBe('"Hello, World"');
    expect(escapeCsvCell('Said "Hello"')).toBe('"Said ""Hello"""');
    expect(escapeCsvCell('Line1\nLine2')).toBe('"Line1\nLine2"');
  });

  it('builds a multi-row CSV document with CRLF row delimiters', () => {
    const headers = ['Category', 'Name', 'Cost', 'Safe'];
    const rows = [
      ['Venue', 'Grand Ballroom', 5000, true],
      ['Catering', '=DANGEROUS()', 3200, false],
    ];
    const csv = buildCsv(headers, rows);
    const lines = csv.split('\r\n');
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('Category,Name,Cost,Safe');
    expect(lines[1]).toBe('Venue,Grand Ballroom,5000,Yes');
    expect(lines[2]).toBe(`Catering,"'=DANGEROUS()",3200,No`);
  });
});

describe('iCalendar RFC 5545 Text Escaping', () => {
  it('escapes backslashes, semicolons, commas, and newlines', () => {
    expect(escapeIcsText('Hello, World; Welcome\\Home')).toBe('Hello\\, World\\; Welcome\\\\Home');
    expect(escapeIcsText('Line 1\nLine 2\r\nLine 3')).toBe('Line 1\\nLine 2\\nLine 3');
    expect(escapeIcsText('')).toBe('');
    expect(escapeIcsText(null as unknown as string)).toBe('');
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
