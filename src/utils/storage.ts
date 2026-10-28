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

let inMemoryFallbackState: PersistedState | null = null;
let quotaExceededFlag = false;

export function isQuotaExceededError(err: unknown): boolean {
  if (err instanceof DOMException) {
    return (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    );
  }
  return false;
}

export function isStorageQuotaExceeded(): boolean {
  return quotaExceededFlag;
}

export function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return inMemoryFallbackState;
    }
    const parsed = JSON.parse(raw);
    const validated = persistedStateSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data as unknown as PersistedState;
    }
    logger.warn('Persisted state in localStorage failed schema validation:', validated.error.format());
  } catch (err) {
    logger.warn('Failed to parse saved state from localStorage:', err);
  }
  return inMemoryFallbackState;
}

export function savePersistedState(state: PersistedState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    inMemoryFallbackState = state;
    quotaExceededFlag = false;
    return true;
  } catch (err) {
    if (isQuotaExceededError(err)) {
      quotaExceededFlag = true;
      inMemoryFallbackState = state;
      logger.warn('Storage quota exceeded! Operating in in-memory session cache mode.');
      return false;
    }
    logger.warn('Failed to persist state to localStorage:', err);
    inMemoryFallbackState = state;
    return false;
  }
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    inMemoryFallbackState = null;
    quotaExceededFlag = false;
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
