export type TimelineHorizon =
  | '6_months'
  | '3_months'
  | '1_month'
  | '1_week'
  | 'day_before';

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
