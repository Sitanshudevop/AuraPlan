import { MacroTask, DayOfActivity } from '../../types/timeline';
import { EventData } from '../../types/event';

export const ICS_PRODID = '-//AuraPlan//Vow and Venue Calendar//EN';
export const ICS_VERSION = '2.0';
export const ICS_CALSCALE = 'GREGORIAN';

const ICS_DATE_REGEX = /^\d{8}(T\d{6}Z?)?$/;

/**
 * Strips ASCII control characters (0x00-0x1F except \n [0x0A], and 0x7F DEL).
 * Iterates by char code to avoid regex control-char vulnerabilities and lint warnings.
 */
function stripDisallowedControlChars(str: string): string {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if ((code <= 0x1f && code !== 0x0a) || code === 0x7f) {
      continue;
    }
    out += str[i];
  }
  return out;
}

/**
 * Escapes characters for iCalendar (RFC 5545) text values.
 * 1. Normalizes all CRLF, CR, LF to LF.
 * 2. Strips control characters (U+0000-U+001F except converted LF, and U+007F).
 * 3. Escapes backslashes, semicolons, commas, and newlines.
 */
export function escapeIcsText(text: string | null | undefined): string {
  if (!text) return '';
  const normalized = String(text).replace(/\r\n|\r|\n/g, '\n');
  const stripped = stripDisallowedControlChars(normalized);
  return stripped
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Deterministic hash for string inputs containing disallowed UID characters.
 */
function hashString(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

/**
 * Sanitizes UID to strict [A-Za-z0-9._@-] set.
 * Hashes input if it contains injection attempts or disallowed characters.
 */
export function sanitizeUid(uid: string): string {
  if (!uid) return `uid-${hashString(String(Date.now()))}@auraplan.workspace`;
  if (/^[A-Za-z0-9._@-]+$/.test(uid)) {
    return uid;
  }
  return `uid-${hashString(uid)}@auraplan.workspace`;
}

/**
 * Validates whether string conforms to RFC 5545 date / date-time format.
 */
export function isValidIcsDate(val: string): boolean {
  return ICS_DATE_REGEX.test(val);
}

function formatDateObject(d: Date): string | null {
  if (isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function extractDateOnlyDigits(cleanDate: string): string | null {
  const dateOnly = cleanDate.split('T')[0].replace(/[-/]/g, '');
  if (!/^\d{8}$/.test(dateOnly)) {
    return null;
  }
  const y = parseInt(dateOnly.slice(0, 4), 10);
  const m = parseInt(dateOnly.slice(4, 6), 10);
  const d = parseInt(dateOnly.slice(6, 8), 10);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) {
    return null;
  }
  return dateOnly;
}

function normalizeTimeComponent(timeInput?: string | null): string {
  if (!timeInput) return '000000';
  const cleanTime = String(timeInput).trim().replace(/:/g, '');
  if (/^\d{4}$/.test(cleanTime)) return `${cleanTime}00`;
  if (/^\d{6}$/.test(cleanTime)) return cleanTime;
  return '000000';
}

/**
 * Formats or repairs a date and optional time into a valid RFC 5545 string.
 * Returns null if the date cannot be validated or repaired.
 */
export function formatOrRepairIcsDate(
  dateInput: string | Date | null | undefined,
  timeInput?: string | null
): string | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return formatDateObject(dateInput);
  }

  const cleanDate = String(dateInput).trim();
  if (isValidIcsDate(cleanDate) && !timeInput) {
    return cleanDate;
  }

  const dateDigits = extractDateOnlyDigits(cleanDate);
  if (!dateDigits) {
    return null;
  }

  if (!timeInput) {
    return dateDigits;
  }

  const timeDigits = normalizeTimeComponent(timeInput);
  const res = `${dateDigits}T${timeDigits}`;
  return isValidIcsDate(res) ? res : null;
}

/**
 * Folds a single iCalendar content line according to RFC 5545 section 3.1.
 * Lines MUST NOT exceed 75 octets (bytes), excluding CRLF.
 * Continuation lines start with a single space (0x20).
 * Multi-byte UTF-8 characters are NEVER split across fold boundaries.
 */
export function foldIcsLine(line: string, maxOctets = 75): string {
  const encoder = new TextEncoder();
  const lineBytes = encoder.encode(line);

  if (lineBytes.length <= maxOctets) {
    return line;
  }

  const codePoints = Array.from(line);
  const foldedLines: string[] = [];
  let currentSegment = '';
  let currentOctets = 0;
  let allowedOctets = maxOctets;

  for (const char of codePoints) {
    const charOctets = encoder.encode(char).length;
    if (currentOctets + charOctets > allowedOctets && currentSegment.length > 0) {
      foldedLines.push(currentSegment);
      currentSegment = ` ${char}`;
      currentOctets = 1 + charOctets;
      allowedOctets = maxOctets;
    } else {
      currentSegment += char;
      currentOctets += charOctets;
    }
  }

  if (currentSegment.length > 0) {
    foldedLines.push(currentSegment);
  }

  return foldedLines.join('\r\n');
}

export function generateIcsCalendar(
  event: EventData,
  tasks: MacroTask[],
  activities: DayOfActivity[]
): string {
  const now = new Date();
  const stamp = formatOrRepairIcsDate(now) || '20260101T000000Z';

  const ics: string[] = [
    'BEGIN:VCALENDAR',
    `VERSION:${ICS_VERSION}`,
    `PRODID:${ICS_PRODID}`,
    `CALSCALE:${ICS_CALSCALE}`,
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(event.name)} Timeline`,
  ];

  activities.forEach((act) => {
    if (!act) return;
    const startFormatted = formatOrRepairIcsDate(event.date, act.startTime);
    const endFormatted = formatOrRepairIcsDate(event.date, act.endTime || act.startTime);
    if (!startFormatted || !endFormatted) return;

    const uid = sanitizeUid(`dayof-${act.id}@auraplan.workspace`);
    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${uid}`);
    ics.push(`DTSTAMP:${stamp}`);
    ics.push(`DTSTART:${startFormatted}`);
    ics.push(`DTEND:${endFormatted}`);
    ics.push(`SUMMARY:${escapeIcsText(act.title)}`);
    ics.push(`LOCATION:${escapeIcsText(act.locationZone || event.city)}`);
    ics.push(`DESCRIPTION:${escapeIcsText(`POC: ${act.poc} | AuraPlan Run-of-Show`)}`);
    ics.push('STATUS:CONFIRMED');
    ics.push('END:VEVENT');
  });

  tasks.forEach((task) => {
    if (!task) return;
    const taskDate = formatOrRepairIcsDate(task.dueDate || event.date);
    if (!taskDate) return;

    const uid = sanitizeUid(`macro-${task.id}@auraplan.workspace`);
    ics.push('BEGIN:VEVENT');
    ics.push(`UID:${uid}`);
    ics.push(`DTSTAMP:${stamp}`);
    ics.push(`DTSTART;VALUE=DATE:${taskDate}`);
    ics.push(`SUMMARY:[${task.priority.toUpperCase()}] ${escapeIcsText(task.title)}`);
    ics.push(`DESCRIPTION:${escapeIcsText(`Assignee: ${task.assignee} | Category: ${task.category}`)}`);
    ics.push('STATUS:CONFIRMED');
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.map((line) => foldIcsLine(line)).join('\r\n');
}

export function downloadIcsFile(event: EventData, tasks: MacroTask[], activities: DayOfActivity[]): void {
  const content = generateIcsCalendar(event, tasks, activities);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${event.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-schedule.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
