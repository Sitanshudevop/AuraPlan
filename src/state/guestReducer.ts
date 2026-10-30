import { Guest } from '../types/guest';
import { GuestAction } from './types';

export interface GuestSliceState {
  guests: Guest[];
}

/**
 * Pure domain reducer for Guests & Seating Capacity slice.
 */
export function guestReducer(
  state: GuestSliceState,
  action: GuestAction
): GuestSliceState {
  switch (action.type) {
    case 'UPDATE_GUEST':
      return {
        ...state,
        guests: state.guests.map((g) =>
          g.id === action.payload.id ? { ...g, ...action.payload.partial } : g
        ),
      };

    case 'ADD_GUEST':
      return {
        ...state,
        guests: [...state.guests, action.payload],
      };

    case 'DELETE_GUEST':
      return {
        ...state,
        guests: state.guests.filter((g) => g.id !== action.payload.id),
      };

    default:
      return state;
  }
}
