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

async function rateLimitDebounce(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastCallTime;
  if (timeSinceLast < DEBOUNCE_MS) {
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_MS - timeSinceLast));
  }
  lastCallTime = Date.now();
}

export function isGeminiKeyConfigured(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return typeof key === 'string' && key.length > 5;
}

export function getSafeMaskedKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  return maskApiKey(key);
}

export function getAiEngineStatus(): { isConfigured: boolean; label: string; maskedKey: string } {
  const configured = isGeminiKeyConfigured();
  return {
    isConfigured: configured,
    label: configured ? 'Gemini 3.8 Flash (Active)' : 'AuraPlan Deterministic Intelligence Engine (Active)',
    maskedKey: getSafeMaskedKey(),
  };
}

export async function generateThemeIdea(
  eventType: string,
  vibePreference: string
): Promise<ThemeIdea> {
  await rateLimitDebounce();
  const cleanVibe = sanitizeText(vibePreference);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || !aiRateLimiter.checkRateLimit().allowed) {
    return getLocalThemeIdea(eventType, cleanVibe);
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

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    return themeIdeaSchema.parse(parsed) as ThemeIdea;
  } catch {
    return getLocalThemeIdea(eventType, cleanVibe);
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
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || !aiRateLimiter.checkRateLimit().allowed) {
    return getLocalVendorVet(cleanName, cleanCat, contractedPrice);
  }

  try {
    const prompt = `Generate vendor vetting & negotiation scripts for vendor "${cleanName}" in category "${cleanCat}" with budget target ₹${contractedPrice}. Return ONLY JSON with keys: whatsappOutreachScript, emailOutreachScript, vettingQuestions (array of 5), hiddenCostRedFlags (array of 4).`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawText);
    return vendorVetSchema.parse(parsed) as VendorVetQuestions;
  } catch {
    return getLocalVendorVet(cleanName, cleanCat, contractedPrice);
  }
}

export async function generateRippleScenario(
  presetId: RipplePresetId,
  state: EventWorkspaceState,
  customPrompt?: string
): Promise<RippleDiffResult> {
  await rateLimitDebounce();
  const cleanPrompt = customPrompt ? sanitizeText(customPrompt) : undefined;
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || presetId !== 'custom' || !aiRateLimiter.checkRateLimit().allowed) {
    return calculateDeterministicRipple(presetId, state, cleanPrompt);
  }

  try {
    const prompt = `Simulate ripple effect for event "${state.event.name}" (Guests: ${state.event.guestCount}, Budget: ${state.event.targetBudget}). Scenario: "${cleanPrompt}". Return JSON schema matching rippleDiffResult with scenarioTitle, scenarioDescription, budgetAdjustments, newVendors, timelineModifications, netBudgetImpact, guestCountImpact, summaryRationale.`;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
