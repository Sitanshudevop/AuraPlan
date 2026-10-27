import { EventWorkspaceState } from '../types/state';

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
    if (parsed && parsed.version === 1 && parsed.states) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to parse saved state from localStorage:', err);
  }
  return null;
}

export function savePersistedState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to persist state to localStorage:', err);
  }
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear storage:', err);
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
