import { EventWorkspaceState } from '../types/state';
import { persistedStateSchema } from '../schemas/eventSchemas';
import { logger } from './logger';

const STORAGE_KEY = 'auraplan_workspace_v1';

export interface PersistedState {
  version: number;
  activePresetId: string;
  states: Record<string, EventWorkspaceState>;
  theme: 'light' | 'dark';
}

export function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const validated = persistedStateSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data as unknown as PersistedState;
    }
    logger.warn('Persisted state in localStorage failed schema validation:', validated.error.format());
  } catch (err) {
    logger.warn('Failed to parse saved state from localStorage:', err);
  }
  return null;
}

export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    logger.warn('Failed to persist state to localStorage:', err);
  }
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    logger.warn('Failed to clear storage:', err);
  }
}

export function getStorageUsageBytes(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Blob([raw]).size : 0;
  } catch {
    return 0;
  }
}
