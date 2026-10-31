import { MacroTask, DayOfActivity } from '../../types/timeline';
import { EventData } from '../../types/event';

/**
 * Escapes characters for iCalendar (RFC 5545) text values.
 * Backslashes, semicolons, commas, and newlines must be escaped.
 */
export function escapeIcsText(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
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
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const ics: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AuraPlan//Vow and Venue Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(event.name)} Timeline`,
  ];

  // Add Day-Of Activities
  activities.forEach((act) => {
    const dateFormatted = event.date.replace(/-/g, '');
    const startFormatted = act.startTime.replace(':', '') + '00';
    const endFormatted = act.endTime.replace(':', '') + '00';

    ics.push('BEGIN:VEVENT');
    ics.push(`UID:dayof-${act.id}@auraplan.workspace`);
    ics.push(`DTSTAMP:${stamp}`);
    ics.push(`DTSTART:${dateFormatted}T${startFormatted}`);
    ics.push(`DTEND:${dateFormatted}T${endFormatted}`);
    ics.push(`SUMMARY:${escapeIcsText(act.title)}`);
    ics.push(`LOCATION:${escapeIcsText(act.locationZone || event.city)}`);
    ics.push(`DESCRIPTION:${escapeIcsText(`POC: ${act.poc} | AuraPlan Run-of-Show`)}`);
    ics.push('STATUS:CONFIRMED');
    ics.push('END:VEVENT');
  });

  // Add Macro Tasks
  tasks.forEach((task) => {
    const taskDate = (task.dueDate || event.date).replace(/-/g, '');
    ics.push('BEGIN:VEVENT');
    ics.push(`UID:macro-${task.id}@auraplan.workspace`);
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
