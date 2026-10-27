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

  for (let i = 0; i < activities.length; i++) {
    for (let j = i + 1; j < activities.length; j++) {
      const act1 = activities[i];
      const act2 = activities[j];

      const start1 = timeToMinutes(act1.startTime);
      const end1 = timeToMinutes(act1.endTime);
      const start2 = timeToMinutes(act2.startTime);
      const end2 = timeToMinutes(act2.endTime);

      // Check if time windows overlap
      const isOverlapping = Math.max(start1, start2) < Math.min(end1, end2);

      if (isOverlapping) {
        if (
          act1.locationZone &&
          act2.locationZone &&
          act1.locationZone.toLowerCase() === act2.locationZone.toLowerCase()
        ) {
          conflicts.push({
            activity1: act1,
            activity2: act2,
            reason: 'location',
            conflictDetail: `Zone double-booking: Both activities require "${act1.locationZone}" between ${act1.startTime} and ${act2.endTime}.`,
          });
        } else if (
          act1.poc &&
          act2.poc &&
          act1.poc.toLowerCase() === act2.poc.toLowerCase()
        ) {
          conflicts.push({
            activity1: act1,
            activity2: act2,
            reason: 'poc',
            conflictDetail: `POC conflict: "${act1.poc}" is assigned simultaneously to both activities.`,
          });
        }
      }
    }
  }

  return conflicts;
}
