import { maskApiKey } from '../utils/security';

let lastCallTime = 0;
const DEBOUNCE_MS = 600;

export async function rateLimitDebounce(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastCallTime;
  if (timeSinceLast < DEBOUNCE_MS) {
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS - timeSinceLast));
  }
  lastCallTime = Date.now();
}

export function getActiveApiKey(): string | undefined {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('auraplan_custom_gemini_key');
    if (custom && custom.trim().length > 5) {
      return custom.trim();
    }
  }
  const metaEnv = import.meta.env as unknown as Record<string, string | undefined>;
  const envKey = metaEnv.VITE_GEMINI_API_KEY || metaEnv.GEMINI_API_KEY;
  if (typeof envKey === 'string' && envKey.trim().length > 5 && envKey !== 'YOUR_GEMINI_API_KEY') {
    return envKey.trim();
  }
  return undefined;
}

export function setCustomApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auraplan_custom_gemini_key', key.trim());
  }
}

export function removeCustomApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auraplan_custom_gemini_key');
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
    label: configured ? 'Gemini Flash 3.5 (Active)' : 'AuraPlan Deterministic Intelligence Engine (Active)',
    maskedKey: getSafeMaskedKey(),
  };
}

