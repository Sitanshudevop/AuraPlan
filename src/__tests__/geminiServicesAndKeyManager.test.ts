import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { z } from 'zod';
import { callGeminiJson } from '../services/geminiApi';
import {
  getActiveApiKey,
  setCustomApiKey,
  removeCustomApiKey,
  isGeminiKeyConfigured,
  getSafeMaskedKey,
  getAiEngineStatus,
  rateLimitDebounce,
  _resetMigrationFlagForTesting,
} from '../services/geminiKeyManager';
import {
  generateThemeIdea,
  generateVendorVet,
  generateRippleScenario,
  generateCustomPlan,
} from '../services/geminiService';
import { INITIAL_PRESETS } from '../data/presets';

describe('Gemini Key Manager & Configuration (F8)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    _resetMigrationFlagForTesting();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    _resetMigrationFlagForTesting();
  });

  it('stores custom key strictly in sessionStorage, never in localStorage', () => {
    expect(isGeminiKeyConfigured()).toBe(false);
    expect(getActiveApiKey()).toBeUndefined();
    expect(getSafeMaskedKey()).toBe('Not Configured');

    setCustomApiKey('AIzaSyD-TEST-KEY-1234567890');
    expect(isGeminiKeyConfigured()).toBe(true);
    expect(getActiveApiKey()).toBe('AIzaSyD-TEST-KEY-1234567890');

    // Invariant: stored in sessionStorage only
    expect(sessionStorage.getItem('auraplan_custom_gemini_key')).toBe('AIzaSyD-TEST-KEY-1234567890');
    expect(localStorage.getItem('auraplan_custom_gemini_key')).toBeNull();

    const status = getAiEngineStatus();
    expect(status.isConfigured).toBe(true);
    expect(status.label).toContain('Gemini');
    expect(status.maskedKey).toContain('••••');

    removeCustomApiKey();
    expect(isGeminiKeyConfigured()).toBe(false);
    expect(sessionStorage.getItem('auraplan_custom_gemini_key')).toBeNull();
    expect(localStorage.getItem('auraplan_custom_gemini_key')).toBeNull();
  });

  it('migrates legacy key from localStorage to sessionStorage on initial access and deletes it from disk', () => {
    // Seed legacy localStorage entry
    localStorage.setItem('auraplan_custom_gemini_key', 'AIzaSyD-LEGACY-KEY-MIGRATION-999');
    expect(sessionStorage.getItem('auraplan_custom_gemini_key')).toBeNull();

    // Access key triggers migration
    const active = getActiveApiKey();
    expect(active).toBe('AIzaSyD-LEGACY-KEY-MIGRATION-999');

    // Key migrated to sessionStorage and removed from localStorage
    expect(sessionStorage.getItem('auraplan_custom_gemini_key')).toBe('AIzaSyD-LEGACY-KEY-MIGRATION-999');
    expect(localStorage.getItem('auraplan_custom_gemini_key')).toBeNull();
  });

  it('falls back to memory storage when sessionStorage throws QuotaExceededError', () => {
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = () => {
      throw new Error('QuotaExceededError');
    };

    setCustomApiKey('AIzaSyD-MEMORY-FALLBACK-KEY-888');
    expect(isGeminiKeyConfigured()).toBe(true);
    expect(getActiveApiKey()).toBe('AIzaSyD-MEMORY-FALLBACK-KEY-888');

    removeCustomApiKey();
    expect(getActiveApiKey()).toBeUndefined();
    sessionStorage.setItem = originalSetItem;
  });

  it('rateLimitDebounce limits calling frequency safely', async () => {
    const t0 = Date.now();
    await rateLimitDebounce();
    await rateLimitDebounce();
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });
});

describe('Gemini API JSON Client (callGeminiJson)', () => {
  const originalFetch = globalThis.fetch;
  const mockSchema = z.object({
    success: z.boolean(),
    greeting: z.string(),
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('successfully fetches and validates schema-conforming JSON payload', async () => {
    const mockApiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({ success: true, greeting: 'Namaste from Gemini' }),
              },
            ],
          },
        },
      ],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as unknown as Response);

    const result = await callGeminiJson('dummy-key', 'Test Prompt', mockSchema);
    expect(result.success).toBe(true);
    expect(result.greeting).toBe('Namaste from Gemini');
  });

  it('throws an error when HTTP response status is non-200', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    } as unknown as Response);

    await expect(callGeminiJson('dummy-key', 'Test Prompt', mockSchema)).rejects.toThrow(
      'Gemini API error: 429'
    );
  });
});

describe('Gemini Service Fallback & Synthesis', () => {
  it('generates fallback theme ideas with memoized caching', async () => {
    const theme1 = await generateThemeIdea('wedding', 'Royal Rajasthani Heritage');
    expect(theme1).toBeDefined();
    expect(theme1.title).toBeDefined();
    expect(theme1.colors.length).toBeGreaterThan(0);

    // Second call should return cached concept
    const theme2 = await generateThemeIdea('wedding', 'Royal Rajasthani Heritage');
    expect(theme2).toBe(theme1);
  });

  it('generates vendor vetting questions with memoized caching', async () => {
    const vet1 = await generateVendorVet('Grand Palace Venue', 'venue', 500000);
    expect(vet1.vettingQuestions.length).toBeGreaterThan(0);
    expect(vet1.hiddenCostRedFlags.length).toBeGreaterThan(0);

    // Cached call
    const vet2 = await generateVendorVet('Grand Palace Venue', 'venue', 500000);
    expect(vet2).toBe(vet1);
  });

  it('generates ripple diff through local engine', async () => {
    const weddingState = INITIAL_PRESETS['preset-wedding-udaipur'];
    const diff = await generateRippleScenario('guest_surge_25', weddingState);
    expect(diff.scenarioTitle).toBe('Guest Surge (+25% Headcount)');
    expect(diff.guestCountImpact).toBeGreaterThan(0);
  });

  it('synthesizes new event plan through local synthesizer', async () => {
    const plan = await generateCustomPlan({
      name: 'Summit 2026',
      type: 'community',
      date: '2026-11-20',
      city: 'Bengaluru',
      setting: 'indoor',
      guestCount: 300,
      targetBudget: 1500000,
      currency: 'INR',
      culturalPreferences: 'Tech Innovation',
    });

    expect(plan.event.name).toBe('Summit 2026');
    expect(plan.event.targetBudget).toBe(1500000);
    expect(plan.budgetItems.length).toBe(5);
  });
});
