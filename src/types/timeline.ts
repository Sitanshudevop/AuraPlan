import type { TimelineHorizonKey } from '../constants';

export type TimelineHorizon = TimelineHorizonKey;

export type Priority = 'critical' | 'high' | 'normal';

export interface MacroTask {
  id: string;
  horizon: TimelineHorizon;
  title: string;
  category: string;
  priority: Priority;
  assignee: string;
  dueDate: string;
  completed: boolean;
  notes?: string;
}

export interface DayOfActivity {
  id: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
  title: string;
  locationZone: string;
  poc: string;
  notes?: string;
  completed?: boolean;
  subEventId?: string;
}

export interface ScheduleConflict {
  activity1: DayOfActivity;
  activity2: DayOfActivity;
  reason: 'location' | 'poc';
  conflictDetail: string;
}
