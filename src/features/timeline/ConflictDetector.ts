import { DayOfActivity, ScheduleConflict } from '../../types/timeline';

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Sorts day-of activities in strict chronological order by start time.
 */
export function sortActivitiesChronologically(activities: DayOfActivity[]): DayOfActivity[] {
  return [...activities].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

/**
 * Detects overlapping day-of schedule events sharing the same location or POC.
 */
export function detectScheduleConflicts(activities: DayOfActivity[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];
  const sorted = [...activities]
    .map((act) => ({
      act,
      start: timeToMinutes(act.startTime),
      end: timeToMinutes(act.endTime),
      locLower: act.locationZone ? act.locationZone.toLowerCase() : '',
      pocLower: act.poc ? act.poc.toLowerCase() : '',
    }))
    .sort((a, b) => a.start - b.start);

  for (let i = 0; i < sorted.length; i++) {
    const item1 = sorted[i];
    for (let j = i + 1; j < sorted.length; j++) {
      const item2 = sorted[j];

      // Since items are sorted chronologically, break early when item2 starts after item1 ends
      if (item2.start >= item1.end) break;

      // Check if time windows overlap
      if (Math.max(item1.start, item2.start) < Math.min(item1.end, item2.end)) {
        if (item1.locLower && item1.locLower === item2.locLower) {
          conflicts.push({
            activity1: item1.act,
            activity2: item2.act,
            reason: 'location',
            conflictDetail: `Zone double-booking: Both activities require "${item1.act.locationZone}" between ${item1.act.startTime} and ${item2.act.endTime}.`,
          });
        } else if (item1.pocLower && item1.pocLower === item2.pocLower) {
          conflicts.push({
            activity1: item1.act,
            activity2: item2.act,
            reason: 'poc',
            conflictDetail: `POC conflict: "${item1.act.poc}" is assigned simultaneously to both activities.`,
          });
        }
      }
    }
  }

  return conflicts;
}
