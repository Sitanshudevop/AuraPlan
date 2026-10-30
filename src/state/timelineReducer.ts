import { MacroTask, DayOfActivity } from '../types/timeline';
import { TimelineAction } from './types';

export interface TimelineSliceState {
  macroTasks: MacroTask[];
  dayOfActivities: DayOfActivity[];
}

/**
 * Pure domain reducer for Dual-Horizon Timeline and Day-of Run-of-Show.
 */
export function timelineReducer(
  state: TimelineSliceState,
  action: TimelineAction
): TimelineSliceState {
  switch (action.type) {
    case 'UPDATE_TASK':
      return {
        ...state,
        macroTasks: state.macroTasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.partial } : t
        ),
      };

    case 'ADD_TASK':
      return {
        ...state,
        macroTasks: [...state.macroTasks, action.payload],
      };

    case 'DELETE_TASK':
      return {
        ...state,
        macroTasks: state.macroTasks.filter((t) => t.id !== action.payload.id),
      };

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        dayOfActivities: state.dayOfActivities.map((a) =>
          a.id === action.payload.id ? { ...a, ...action.payload.partial } : a
        ),
      };

    case 'ADD_ACTIVITY':
      return {
        ...state,
        dayOfActivities: [...state.dayOfActivities, action.payload],
      };

    case 'DELETE_ACTIVITY':
      return {
        ...state,
        dayOfActivities: state.dayOfActivities.filter((a) => a.id !== action.payload.id),
      };

    case 'SHIFT_ACTIVITY_30M': {
      const formatTime = (mins: number) => {
        const hh = Math.floor(mins / 60) % 24;
        const mm = mins % 60;
        return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
      };

      const dayOfActivities = state.dayOfActivities.map((a) => {
        if (a.id !== action.payload.id) return a;
        const [h, m] = a.startTime.split(':').map(Number);
        const [eh, em] = a.endTime.split(':').map(Number);
        const startMins = h * 60 + m + 30;
        const endMins = eh * 60 + em + 30;
        return { ...a, startTime: formatTime(startMins), endTime: formatTime(endMins) };
      });
      return { ...state, dayOfActivities };
    }

    default:
      return state;
  }
}

