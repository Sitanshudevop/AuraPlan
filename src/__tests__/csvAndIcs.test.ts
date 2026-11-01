import { describe, it, expect, vi } from 'vitest';
import { escapeCsvCell, buildCsv } from '../utils/csv';
import {
  escapeIcsText,
  generateIcsCalendar,
  downloadIcsFile,
  foldIcsLine,
  sanitizeUid,
  isValidIcsDate,
  formatOrRepairIcsDate,
  ICS_PRODID,
  ICS_VERSION,
  ICS_CALSCALE,
} from '../features/timeline/IcsGenerator';
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

  it('neutralizes formula injection with leading whitespace, pipe, percent, and newline', () => {
    expect(escapeCsvCell('   =1+1')).toBe(`"'   =1+1"`);
    expect(escapeCsvCell('  +2+3')).toBe(`"'  +2+3"`);
    expect(escapeCsvCell('\t@cmd')).toBe(`"'\t@cmd"`);
    expect(escapeCsvCell('|cmd|/C calc')).toBe(`"'|cmd|/C calc"`);
    expect(escapeCsvCell('%1+1')).toBe(`"'%1+1"`);
    expect(escapeCsvCell('\n=DANGEROUS()')).toBe(`"'\n=DANGEROUS()"`);
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

describe('iCalendar RFC 5545 Text Escaping & Octet Folding', () => {
  it('escapes backslashes, semicolons, commas, and newlines', () => {
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

  it('neutralizes bare CR and CRLF injection attempts in titles and descriptions', () => {
    // Attack 1: Bare CR injection (Title\rATTENDEE:evil)
    const escapedBareCr = escapeIcsText('Title\rATTENDEE:evil');
    expect(escapedBareCr).toBe('Title\\nATTENDEE:evil');
    expect(escapedBareCr).not.toContain('\r');
    expect(escapedBareCr).not.toContain('\n');

    // Attack 2: CRLF VEVENT termination injection
    const escapedVeventBreak = escapeIcsText('Title\r\nEND:VEVENT\r\nBEGIN:VEVENT');
    expect(escapedVeventBreak).toBe('Title\\nEND:VEVENT\\nBEGIN:VEVENT');
    expect(escapedVeventBreak).not.toContain('\r\n');

    // Attack 3: Stripping other control characters (0x00-0x1F except \n, and 0x7F)
    const strippedControls = escapeIcsText('Test\x00\x08\x0b\x1f\x7fDone');
    expect(strippedControls).toBe('TestDone');
  });

  it('sanitizes UIDs and hashes inputs containing injection or invalid characters', () => {
    // Valid standard UID
    expect(sanitizeUid('valid-id_123.456@host')).toBe('valid-id_123.456@host');

    // Malicious injection in UID with CRLF
    const maliciousUid = 'act-1\r\nATTENDEE:malicious@evil.com';
    const sanitized = sanitizeUid(maliciousUid);
    expect(sanitized).toMatch(/^uid-[a-f0-9]+@auraplan\.workspace$/);
    expect(sanitized).not.toContain('\r');
    expect(sanitized).not.toContain('\n');
    expect(sanitized).not.toContain('ATTENDEE');

    // Deterministic hash check
    expect(sanitizeUid(maliciousUid)).toBe(sanitized);
  });

  it('validates and repairs dates, skipping invalid events without crashing', () => {
    expect(isValidIcsDate('20261030')).toBe(true);
    expect(isValidIcsDate('20261030T140000')).toBe(true);
    expect(isValidIcsDate('20261030T140000Z')).toBe(true);
    expect(isValidIcsDate('invalid')).toBe(false);

    expect(formatOrRepairIcsDate('2026-10-30')).toBe('20261030');
    expect(formatOrRepairIcsDate('2026-10-30', '14:30')).toBe('20261030T143000');
    expect(formatOrRepairIcsDate(new Date('2026-10-30T12:00:00Z'))).toMatch(/^\d{8}T\d{6}Z$/);
    expect(formatOrRepairIcsDate('invalid-date')).toBeNull();

    const corruptEvent: EventData = {
      id: 'bad-1',
      name: 'Corrupt Event',
      type: 'wedding',
      date: 'invalid-date-not-a-date',
      guestCount: 50,
      targetBudget: 10000,
      city: 'Delhi',
      currency: 'INR',
      setting: 'outdoor',
      culturalPreferences: 'Standard',
      subEvents: [],
    };

    const corruptActivities: DayOfActivity[] = [
      {
        id: 'bad-act',
        title: 'Broken Activity',
        startTime: 'bad-time',
        endTime: 'bad-time-2',
        durationMinutes: 30,
        locationZone: 'Main Hall',
        poc: 'Manager',
      },
    ];

    // Must skip invalid events without throwing unhandled exceptions
    expect(() => generateIcsCalendar(corruptEvent, [], corruptActivities)).not.toThrow();
    const ics = generateIcsCalendar(corruptEvent, [], corruptActivities);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain(`PRODID:${ICS_PRODID}`);
    expect(ics).toContain(`VERSION:${ICS_VERSION}`);
    expect(ics).toContain(`CALSCALE:${ICS_CALSCALE}`);
    expect(ics).not.toContain('BEGIN:VEVENT'); // Successfully skipped corrupt event
  });

  it('performs clean round-trip unfold parsing without injecting fake calendar components', () => {
    const testEvent: EventData = {
      id: 'evt-secure',
      name: 'Secure Gala\r\nSUMMARY:Faked Header',
      type: 'wedding',
      date: '2026-11-15',
      guestCount: 100,
      targetBudget: 25000,
      city: 'Mumbai',
      currency: 'INR',
      setting: 'indoor',
      culturalPreferences: 'Traditional',
      subEvents: [],
    };

    const attackTasks: MacroTask[] = [
      {
        id: 'task-inj\r\nATTENDEE:injected@evil.com',
        title: 'Title\rATTENDEE:evil\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nSUMMARY:Hijacked',
        category: 'Setup',
        dueDate: '2026-11-10',
        completed: false,
        priority: 'high',
        assignee: 'Planner',
        horizon: '1_month',
      },
    ];

    const attackActivities: DayOfActivity[] = [
      {
        id: 'act-multibyte',
        title: 'A very long celebration description with Hindi विवाह समारोह एवं संगीत संध्या उत्सव 🌸 🎉 🪔 🏰 to test unfolding parser',
        startTime: '10:00',
        endTime: '11:30',
        durationMinutes: 90,
        locationZone: 'Grand Palace Lawn',
        poc: 'Coordinator',
      },
    ];

    const ics = generateIcsCalendar(testEvent, attackTasks, attackActivities);

    // Unfold parser per RFC 5545 (replace CRLF + space with empty string)
    const unfolded = ics.replace(/\r\n /g, '');
    const lines = unfolded.split('\r\n');
    const veventBlocks: Array<Record<string, string>> = [];
    let currentVevent: Record<string, string> | null = null;

    for (const line of lines) {
      if (line === 'BEGIN:VEVENT') {
        currentVevent = {};
      } else if (line === 'END:VEVENT') {
        if (currentVevent) veventBlocks.push(currentVevent);
        currentVevent = null;
      } else if (currentVevent && line.includes(':')) {
        const colonIdx = line.indexOf(':');
        const key = line.slice(0, colonIdx);
        const val = line.slice(colonIdx + 1);
        currentVevent[key] = val;
      }
    }

    // Exactly 2 valid VEVENT blocks (1 attackActivity + 1 attackTask). NOT 3! The fake BEGIN:VEVENT was neutralized.
    expect(veventBlocks).toHaveLength(2);

    // Find the attack task block and activity block
    const taskBlock = veventBlocks.find((b) => b.UID.startsWith('uid-'));
    const actBlock = veventBlocks.find((b) => b.UID.startsWith('dayof-'));

    expect(taskBlock).toBeDefined();
    expect(actBlock).toBeDefined();

    // UID must be safe (attack task UID with CRLF was sanitized and hashed)
    expect(taskBlock!.UID).toMatch(/^uid-[a-f0-9]+@auraplan\.workspace$/);
    // Attacker cannot inject an ATTENDEE field into the event
    expect(taskBlock!['ATTENDEE']).toBeUndefined();
    // Injected string is safely escaped inside SUMMARY
    expect(taskBlock!.SUMMARY).toContain('Title\\nATTENDEE:evil\\nEND:VEVENT\\nBEGIN:VEVENT\\nSUMMARY:Hijacked');

    // Multibyte text in activity event is preserved intact
    expect(actBlock!.SUMMARY).toContain('विवाह समारोह एवं संगीत संध्या उत्सव 🌸 🎉 🪔 🏰');
  });

  it('covers downloadIcsFile and branch corner cases', () => {
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName === 'a') {
        el.click = mockClick;
      }
      return el;
    });

    const mockUrl = 'blob:http://localhost/test-uuid';
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(mockUrl);
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const sampleEvent: EventData = {
      id: 'evt-dl',
      name: 'Sample Gala',
      type: 'wedding',
      date: '2026-10-30',
      guestCount: 50,
      targetBudget: 10000,
      city: 'Delhi',
      currency: 'INR',
      setting: 'indoor',
      culturalPreferences: 'Standard',
      subEvents: [],
    };

    downloadIcsFile(sampleEvent, [], []);
    expect(mockClick).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith(mockUrl);

    // Branch tests for sanitizeUid and formatOrRepairIcsDate
    expect(sanitizeUid('')).toMatch(/^uid-[a-f0-9]+@auraplan\.workspace$/);
    expect(formatOrRepairIcsDate(null)).toBeNull();
    expect(formatOrRepairIcsDate(new Date('invalid'))).toBeNull();
    expect(formatOrRepairIcsDate('20261030')).toBe('20261030');
    expect(formatOrRepairIcsDate('1800-01-01')).toBeNull(); // year < 1900
    expect(formatOrRepairIcsDate('2026-13-01')).toBeNull(); // month > 12
    expect(formatOrRepairIcsDate('2026-10-32')).toBeNull(); // day > 31
    expect(formatOrRepairIcsDate('2026-10-30', '14:30:45')).toBe('20261030T143045');
    expect(formatOrRepairIcsDate('2026-10-30', 'invalid')).toBe('20261030T000000');
    expect(formatOrRepairIcsDate('2026-10-30', null)).toBe('20261030');
  });
});
