import { EventData } from '../types/event';
import { EventAction } from './types';

/**
 * Pure domain reducer for Event metadata slice.
 */
export function eventReducer(state: EventData, action: EventAction): EventData {
  switch (action.type) {
    case 'UPDATE_EVENT':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
