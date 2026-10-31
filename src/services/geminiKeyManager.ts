import { maskApiKey } from '../utils/security';

let lastCallTime = 0;
const DEBOUNCE_MS = 600;
const STORAGE_KEY = 'auraplan_custom_gemini_key';

let memoryKeyCache: string | null = null;
let migrated = false;

export async function rateLimitDebounce(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastCallTime;
  if (timeSinceLast < DEBOUNCE_MS) {
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS - timeSinceLast));
  }
  lastCallTime = Date.now();
}

/**
 * One-time migration: moves any legacy key stored in localStorage into sessionStorage
 * and deletes it immediately from localStorage to prevent unencrypted disk persistence.
 */
export function migrateLegacyStorageKey(): void {
  if (migrated || typeof window === 'undefined') return;
  migrated = true;
  try {
    const legacyKey = window.localStorage?.getItem(STORAGE_KEY);
    if (legacyKey && legacyKey.trim().length > 5) {
      try {
        window.sessionStorage?.setItem(STORAGE_KEY, legacyKey.trim());
      } catch {
        memoryKeyCache = legacyKey.trim();
      }
    }
    window.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage access errors in sandboxed environments
  }
}

export function getActiveApiKey(): string | undefined {
  if (typeof window === 'undefined') return undefined;

  migrateLegacyStorageKey();

  let key: string | null = null;
  try {
    key = window.sessionStorage?.getItem(STORAGE_KEY);
  } catch {
    // sessionStorage blocked/restricted
  }

  const effectiveKey = key || memoryKeyCache;
  if (effectiveKey && effectiveKey.trim().length > 5) {
    return effectiveKey.trim();
  }
  return undefined;
}

export function setCustomApiKey(key: string): void {
  if (!key || typeof key !== 'string') return;
  const trimmed = key.trim();
  memoryKeyCache = trimmed;

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.setItem(STORAGE_KEY, trimmed);
    } catch {
      // In-memory cache handles fallback
    }
    try {
      // Invariant: never leave unencrypted keys in persistent localStorage
      window.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

export function removeCustomApiKey(): void {
  memoryKeyCache = null;
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage?.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    try {
      window.localStorage?.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

export function isGeminiKeyConfigured(): boolean {
  const key = getActiveApiKey();
  return typeof key === 'string' && key.length > 5;
}

export function getSafeMaskedKey(): string {
  const key = getActiveApiKey();
  return maskApiKey(key);
}

export function getAiEngineStatus(): { isConfigured: boolean; label: string; maskedKey: string } {
  const configured = isGeminiKeyConfigured();
  return {
    isConfigured: configured,
    label: configured ? 'Gemini Flash 1.5 (Custom Key Active)' : 'AuraPlan Server AI & Local Fallback Engine (Active)',
    maskedKey: getSafeMaskedKey(),
  };
}

/** Reset internal migration flag for testing purposes */
export function _resetMigrationFlagForTesting(): void {
  migrated = false;
  memoryKeyCache = null;
}
