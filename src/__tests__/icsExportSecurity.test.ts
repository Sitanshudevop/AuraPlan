import { describe, it, expect, vi } from 'vitest';
import {
  escapeIcsText,
  generateIcsCalendar,
  downloadIcsFile,
  sanitizeUid,
  isValidIcsDate,
  formatOrRepairIcsDate,
  ICS_PRODID,
  ICS_VERSION,
  ICS_CALSCALE,
} from '../features/timeline/IcsGenerator';
import { EventData } from '../types/event';
import { MacroTask, DayOfActivity } from '../types/timeline';

describe('iCalendar Security, Injection Hardening & Date Repair', () => {
  it('neutralizes bare CR and CRLF injection attempts in titles and descriptions', () => {
    const escapedBareCr = escapeIcsText('Title\rATTENDEE:evil');
    expect(escapedBareCr).toBe('Title\\nATTENDEE:evil');
    expect(escapedBareCr).not.toContain('\r');
    expect(escapedBareCr).not.toContain('\n');

    const escapedVeventBreak = escapeIcsText('Title\r\nEND:VEVENT\r\nBEGIN:VEVENT');
    expect(escapedVeventBreak).toBe('Title\\nEND:VEVENT\\nBEGIN:VEVENT');
    expect(escapedVeventBreak).not.toContain('\r\n');

    const strippedControls = escapeIcsText('Test\x00\x08\x0b\x1f\x7fDone');
    expect(strippedControls).toBe('TestDone');
  });

  it('sanitizes UIDs and hashes inputs containing injection or invalid characters', () => {
    expect(sanitizeUid('valid-id_123.456@host')).toBe('valid-id_123.456@host');

    const maliciousUid = 'act-1\r\nATTENDEE:malicious@evil.com';
    const sanitized = sanitizeUid(maliciousUid);
    expect(sanitized).toMatch(/^uid-[a-f0-9]+@auraplan\.workspace$/);
    expect(sanitized).not.toContain('\r');
    expect(sanitized).not.toContain('\n');
    expect(sanitized).not.toContain('ATTENDEE');

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

    expect(() => generateIcsCalendar(corruptEvent, [], corruptActivities)).not.toThrow();
    const ics = generateIcsCalendar(corruptEvent, [], corruptActivities);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain(`PRODID:${ICS_PRODID}`);
    expect(ics).toContain(`VERSION:${ICS_VERSION}`);
    expect(ics).toContain(`CALSCALE:${ICS_CALSCALE}`);
    expect(ics).not.toContain('BEGIN:VEVENT');
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

    expect(veventBlocks).toHaveLength(2);
    const taskBlock = veventBlocks.find((b) => b.UID.startsWith('uid-'));
    const actBlock = veventBlocks.find((b) => b.UID.startsWith('dayof-'));

    expect(taskBlock).toBeDefined();
    expect(actBlock).toBeDefined();
    expect(taskBlock!.UID).toMatch(/^uid-[a-f0-9]+@auraplan\.workspace$/);
    expect(taskBlock!['ATTENDEE']).toBeUndefined();
    expect(taskBlock!.SUMMARY).toContain('Title\\nATTENDEE:evil\\nEND:VEVENT\\nBEGIN:VEVENT\\nSUMMARY:Hijacked');
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

    expect(sanitizeUid('')).toMatch(/^uid-[a-f0-9]+@auraplan\.workspace$/);
    expect(formatOrRepairIcsDate(null)).toBeNull();
    expect(formatOrRepairIcsDate(new Date('invalid'))).toBeNull();
    expect(formatOrRepairIcsDate('20261030')).toBe('20261030');
    expect(formatOrRepairIcsDate('1800-01-01')).toBeNull();
    expect(formatOrRepairIcsDate('2026-13-01')).toBeNull();
    expect(formatOrRepairIcsDate('2026-10-32')).toBeNull();
    expect(formatOrRepairIcsDate('2026-10-30', '14:30:45')).toBe('20261030T143045');
    expect(formatOrRepairIcsDate('2026-10-30', 'invalid')).toBe('20261030T000000');
    expect(formatOrRepairIcsDate('2026-10-30', null)).toBe('20261030');
  });
});
