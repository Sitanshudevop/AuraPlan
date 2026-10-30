import { ThemeIdea } from '../types/ideation';
import { RippleDiffResult, RipplePresetId } from '../types/ripple';
import { VendorVetQuestions } from '../types/vendor';
import { EventWorkspaceState } from '../types/state';
import { themeIdeaSchema, vendorVetSchema, rippleDiffResultSchema } from '../schemas/aiSchemas';
import { getLocalThemeIdea, getLocalVendorVet } from './deterministicFallback';
import { calculateDeterministicRipple } from './rippleEngine';
import { NewEventFormInput, synthesizePlanLocally } from './planSynthesizer';
import { sanitizeText, aiRateLimiter, maskApiKey } from '../utils/security';

let lastCallTime = 0;
const DEBOUNCE_MS = 600;
const themeCache = new Map<string, ThemeIdea>();
const vendorVetCache = new Map<string, VendorVetQuestions>();

async function rateLimitDebounce(): Promise<void> {
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

export async function generateThemeIdea(
  eventType: string,
  vibePreference: string
): Promise<ThemeIdea> {
  await rateLimitDebounce();
  const cleanVibe = sanitizeText(vibePreference);
  const cacheKey = `${eventType}:${cleanVibe.toLowerCase().trim()}`;
  if (themeCache.has(cacheKey)) {
    return themeCache.get(cacheKey)!;
  }

  const apiKey = getActiveApiKey();

  if (import.meta.env.MODE === 'test' || !apiKey || !aiRateLimiter.checkRateLimit().allowed) {
    const fallback = getLocalThemeIdea(eventType, cleanVibe);
    themeCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const prompt = `You are a world-class luxury celebration designer. Generate a cohesive creative concept in JSON for a ${eventType} with preference: "${cleanVibe}". Return ONLY a JSON object matching this schema:
    {
      "id": "theme-1",
      "title": string,
      "vibe": string,
      "description": string,
      "colors": [{"name": string, "hex": "#RRGGBB", "role": string}],
      "decorConcepts": [{"id": "dc-1", "title": string, "description": string, "estimatedCost": number, "timelineTask": string, "category": "decor" | "av_photo" | "venue"}],
      "menuItems": [{"id": "mi-1", "name": string, "category": string, "description": string, "estimatedCostPerHead": number}],
      "activities": [{"id": "ea-1", "title": string, "description": string, "estimatedCost": number, "timelineTask": string, "durationMinutes": number}]
    }`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8500),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    const validated = themeIdeaSchema.parse(parsed) as ThemeIdea;
    themeCache.set(cacheKey, validated);
    return validated;
  } catch {
    const fallback = getLocalThemeIdea(eventType, cleanVibe);
    themeCache.set(cacheKey, fallback);
    return fallback;
  }
}

export async function generateVendorVet(
  vendorName: string,
  category: string,
  contractedPrice: number
): Promise<VendorVetQuestions> {
  await rateLimitDebounce();
  const cleanName = sanitizeText(vendorName);
  const cleanCat = sanitizeText(category);
  const cacheKey = `${cleanName}:${cleanCat}:${contractedPrice}`;
  if (vendorVetCache.has(cacheKey)) {
    return vendorVetCache.get(cacheKey)!;
  }

  const apiKey = getActiveApiKey();

  if (import.meta.env.MODE === 'test' || !apiKey || !aiRateLimiter.checkRateLimit().allowed) {
    const fallback = getLocalVendorVet(cleanName, cleanCat, contractedPrice);
    vendorVetCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const prompt = `Generate vendor vetting & negotiation scripts for vendor "${cleanName}" in category "${cleanCat}" with budget target ₹${contractedPrice}. Return ONLY JSON with keys: whatsappOutreachScript, emailOutreachScript, vettingQuestions (array of 5), hiddenCostRedFlags (array of 4).`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8500),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    const validated = vendorVetSchema.parse(parsed) as VendorVetQuestions;
    vendorVetCache.set(cacheKey, validated);
    return validated;
  } catch {
    const fallback = getLocalVendorVet(cleanName, cleanCat, contractedPrice);
    vendorVetCache.set(cacheKey, fallback);
    return fallback;
  }
}

export async function generateRippleScenario(
  presetId: RipplePresetId,
  state: EventWorkspaceState,
  customPrompt?: string
): Promise<RippleDiffResult> {
  await rateLimitDebounce();
  const cleanPrompt = customPrompt ? sanitizeText(customPrompt) : undefined;
  const apiKey = getActiveApiKey();

  if (import.meta.env.MODE === 'test' || !apiKey || presetId !== 'custom' || !aiRateLimiter.checkRateLimit().allowed) {
    return calculateDeterministicRipple(presetId, state, cleanPrompt);
  }

  try {
    const prompt = `Simulate ripple effect for event "${state.event.name}" (Guests: ${state.event.guestCount}, Budget: ${state.event.targetBudget}). Scenario: "${cleanPrompt}". Return JSON schema matching rippleDiffResult with scenarioTitle, scenarioDescription, budgetAdjustments, newVendors, timelineModifications, netBudgetImpact, guestCountImpact, summaryRationale.`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8500),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    return rippleDiffResultSchema.parse(parsed) as RippleDiffResult;
  } catch {
    return calculateDeterministicRipple(presetId, state, cleanPrompt);
  }
}

export async function generateCustomPlan(input: NewEventFormInput): Promise<EventWorkspaceState> {
  await rateLimitDebounce();
  return synthesizePlanLocally(input);
}
