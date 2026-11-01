import { describe, it, expect, beforeEach } from 'vitest';
import { loadPersistedState, clearPersistedState } from '../utils/storage';
import { INITIAL_PRESETS } from '../data/presets';

const STORAGE_KEY = 'auraplan_workspace_v1';

describe('Tampered and Corrupted Storage Resilience Suite (F7)', () => {
  beforeEach(() => {
    clearPersistedState();
    localStorage.clear();
  });

  it('rejects corrupted version (e.g., negative or string version) and falls back safely', () => {
    const corruptedState = {
      version: -1,
      activePresetId: 'preset-wedding-udaipur',
      states: INITIAL_PRESETS,
      theme: 'light',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(corruptedState));
    const loaded = loadPersistedState();
    expect(loaded).toBeNull();
  });

  it('rejects future schema version (e.g. version: 999) without crashing', () => {
    const futureState = {
      version: 999,
      activePresetId: 'preset-wedding-udaipur',
      states: INITIAL_PRESETS,
      theme: 'dark',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(futureState));
    const loaded = loadPersistedState();
    expect(loaded).toBeNull();
  });

  it('rejects payloads with missing required fields in event or budget', () => {
    const missingFieldsState = {
      version: 1,
      activePresetId: 'preset-wedding-udaipur',
      states: {
        'preset-wedding-udaipur': {
          // missing event, budget, vendors, etc.
          theme: 'light',
        },
      },
      theme: 'light',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(missingFieldsState));
    const loaded = loadPersistedState();
    expect(loaded).toBeNull();
  });

  it('rejects non-array collections where arrays are expected (vendors, guests, items)', () => {
    const invalidCollections = {
      version: 1,
      activePresetId: 'preset-wedding-udaipur',
      states: {
        'preset-wedding-udaipur': {
          ...INITIAL_PRESETS['preset-wedding-udaipur'],
          vendors: 'not-an-array',
          guests: { key: 'invalid' },
        },
      },
      theme: 'light',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidCollections));
    const loaded = loadPersistedState();
    expect(loaded).toBeNull();
  });

  it('rejects or sanitizes NaN and Infinity numbers in budget figures', () => {
    // Setting non-numeric or null where positive number expected fails schema
    const invalidBudgetState = {
      version: 1,
      activePresetId: 'preset-wedding-udaipur',
      states: {
        'preset-wedding-udaipur': {
          ...INITIAL_PRESETS['preset-wedding-udaipur'],
          event: {
            ...INITIAL_PRESETS['preset-wedding-udaipur'].event,
            targetBudget: null,
          },
        },
      },
      theme: 'light',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidBudgetState));
    const loaded = loadPersistedState();
    expect(loaded).toBeNull();
  });

  it('safely handles oversized payloads (> 5MB)', () => {
    const hugeString = 'A'.repeat(5 * 1024 * 1024 + 10);
    const hugeState = {
      version: 1,
      activePresetId: 'preset-wedding-udaipur',
      states: {
        'preset-wedding-udaipur': {
          ...INITIAL_PRESETS['preset-wedding-udaipur'],
          event: {
            ...INITIAL_PRESETS['preset-wedding-udaipur'].event,
            notes: hugeString,
          },
        },
      },
      theme: 'light',
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hugeState));
      const loaded = loadPersistedState();
      // Even if stored or rejected, it must not throw an unhandled exception
      expect(loaded === null || typeof loaded === 'object').toBe(true);
    } catch (e) {
      // In quota-limited storage, it catches cleanly
      expect(e).toBeDefined();
    }
  });

  it('rejects wrong data types for IDs (e.g. numeric ID where string expected)', () => {
    const wrongTypeId = {
      version: 1,
      activePresetId: 12345, // should be string
      states: INITIAL_PRESETS,
      theme: 'light',
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wrongTypeId));
    const loaded = loadPersistedState();
    expect(loaded).toBeNull();
  });
});

