import { ThemeIdea } from '../types/ideation';
import { RippleDiffResult, RipplePresetId } from '../types/ripple';
import { VendorVetQuestions } from '../types/vendor';
import { EventWorkspaceState } from '../types/state';
import { themeIdeaSchema, vendorVetSchema, rippleDiffResultSchema } from '../schemas/aiSchemas';
import { getLocalThemeIdea, getLocalVendorVet } from './deterministicFallback';
import { calculateDeterministicRipple } from './rippleEngine';
import { NewEventFormInput, synthesizePlanLocally } from './planSynthesizer';
import { sanitizeText, aiRateLimiter } from '../utils/security';
import { callGeminiProxy } from './geminiClient';
import {
  rateLimitDebounce,
  getActiveApiKey,
  setCustomApiKey,
  removeCustomApiKey,
  isGeminiKeyConfigured,
  getSafeMaskedKey,
  getAiEngineStatus,
} from './geminiKeyManager';

export {
  getActiveApiKey,
  setCustomApiKey,
  removeCustomApiKey,
  isGeminiKeyConfigured,
  getSafeMaskedKey,
  getAiEngineStatus,
};

const themeCache = new Map<string, ThemeIdea>();
const vendorVetCache = new Map<string, VendorVetQuestions>();

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

  const customKey = getActiveApiKey();
  if ((import.meta.env.MODE === 'test' && !customKey) || !aiRateLimiter.checkRateLimit().allowed) {
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

    const validated = await callGeminiProxy(prompt, themeIdeaSchema, { customKey });
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

  const customKey = getActiveApiKey();
  if ((import.meta.env.MODE === 'test' && !customKey) || !aiRateLimiter.checkRateLimit().allowed) {
    const fallback = getLocalVendorVet(cleanName, cleanCat, contractedPrice);
    vendorVetCache.set(cacheKey, fallback);
    return fallback;
  }

  try {
    const prompt = `Generate vendor vetting & negotiation scripts for vendor "${cleanName}" in category "${cleanCat}" with budget target ₹${contractedPrice}. Return ONLY JSON with keys: whatsappOutreachScript, emailOutreachScript, vettingQuestions (array of 5), hiddenCostRedFlags (array of 4).`;
    const validated = await callGeminiProxy(prompt, vendorVetSchema, { customKey });
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
  const customKey = getActiveApiKey();

  if (
    presetId !== 'custom' ||
    (import.meta.env.MODE === 'test' && !customKey) ||
    !aiRateLimiter.checkRateLimit().allowed
  ) {
    return calculateDeterministicRipple(presetId, state, cleanPrompt);
  }

  try {
    const prompt = `Simulate ripple effect for event "${state.event.name}" (Guests: ${state.event.guestCount}, Budget: ${state.event.targetBudget}). Scenario: "${cleanPrompt}". Return JSON schema matching rippleDiffResult with scenarioTitle, scenarioDescription, budgetAdjustments, newVendors, timelineModifications, netBudgetImpact, guestCountImpact, summaryRationale.`;
    return await callGeminiProxy(prompt, rippleDiffResultSchema, { customKey });
  } catch {
    return calculateDeterministicRipple(presetId, state, cleanPrompt);
  }
}

export async function generateCustomPlan(input: NewEventFormInput): Promise<EventWorkspaceState> {
  await rateLimitDebounce();
  return synthesizePlanLocally(input);
}
