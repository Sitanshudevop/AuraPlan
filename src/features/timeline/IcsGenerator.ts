import { MacroTask, DayOfActivity } from '../../types/timeline';
import { EventData } from '../../types/event';

export function generateIcsCalendar(
  event: EventData,
  tasks: MacroTask[],
  activities: DayOfActivity[]
): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AuraPlan//Vow and Venue Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${event.name} Timeline`,
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
    ics.push(`SUMMARY:${act.title}`);
    ics.push(`LOCATION:${act.locationZone || event.city}`);
    ics.push(`DESCRIPTION:POC: ${act.poc} | AuraPlan Run-of-Show`);
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
    ics.push(`SUMMARY:[${task.priority.toUpperCase()}] ${task.title}`);
    ics.push(`DESCRIPTION:Assignee: ${task.assignee} | Category: ${task.category}`);
    ics.push('STATUS:CONFIRMED');
    ics.push('END:VEVENT');
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

export function downloadIcsFile(event: EventData, tasks: MacroTask[], activities: DayOfActivity[]): void {
  const content = generateIcsCalendar(event, tasks, activities);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${event.name.toLowerCase().replace(/\s+/g, '-')}-schedule.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
