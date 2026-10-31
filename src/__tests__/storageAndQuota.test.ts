import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isQuotaExceededError,
  isStorageQuotaExceeded,
  loadPersistedState,
  savePersistedState,
  clearPersistedState,
  getStorageUsageBytes,
  PersistedState,
} from '../utils/storage';
import { weddingPreset } from '../data/weddingPreset';

describe('Storage Error Handling and Quota Management', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockState: PersistedState = {
    version: 1,
    activePresetId: 'preset-wedding',
    states: {
      'preset-wedding': weddingPreset,
    },
    theme: 'dark',
  };

  it('detects quota exceeded errors for DOMException codes and names', () => {
    expect(isQuotaExceededError(new DOMException('Quota', 'QuotaExceededError'))).toBe(true);
    expect(isQuotaExceededError(new DOMException('NS', 'NS_ERROR_DOM_QUOTA_REACHED'))).toBe(true);
    expect(isQuotaExceededError(new Error('Standard error'))).toBe(false);
    expect(isQuotaExceededError(null)).toBe(false);
    expect(isQuotaExceededError(123)).toBe(false);
  });

  it('handles quota exceeded in savePersistedState by falling back to memory and setting flag', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Disk full', 'QuotaExceededError');
    });

    const success = savePersistedState(mockState);
    expect(success).toBe(false);
    expect(isStorageQuotaExceeded()).toBe(true);

    // Reading back returns the in-memory fallback state
    const retrieved = loadPersistedState();
    expect(retrieved).toEqual(mockState);
  });

  it('handles generic localStorage exceptions gracefully in save and clear', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Generic disk failure');
    });

    const success = savePersistedState(mockState);
    expect(success).toBe(false);

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Remove failure');
    });
    expect(() => clearPersistedState()).not.toThrow();
  });

  it('handles invalid JSON in localStorage gracefully without throwing', () => {
    localStorage.setItem('auraplan_workspace_v1', 'INVALID_JSON_CORRUPT');
    const state = loadPersistedState();
    // Falls back safely
    expect(state).toBeDefined();
  });

  it('calculates storage usage bytes correctly and handles exceptions', () => {
    expect(getStorageUsageBytes()).toBe(0);

    localStorage.setItem('auraplan_workspace_v1', JSON.stringify(mockState));
    expect(getStorageUsageBytes()).toBeGreaterThan(0);

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    expect(getStorageUsageBytes()).toBe(0);
  });
});

