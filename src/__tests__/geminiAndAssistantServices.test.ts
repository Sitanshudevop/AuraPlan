import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  askPlanningAssistant,
  MODALITY_PROMPT_CHIPS,
} from '../services/planningAssistantService';
import {
  generateVendorVet,
  generateRippleScenario,
  generateCustomPlan,
} from '../services/geminiService';
import { setCustomApiKey, removeCustomApiKey } from '../services/geminiKeyManager';
import { weddingPreset } from '../data/weddingPreset';
import * as geminiClient from '../services/geminiClient';

describe('Gemini Planning Assistant and Synthesis Services', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    removeCustomApiKey();
  });

  it('exposes modality prompt chips for all three event types', () => {
    expect(MODALITY_PROMPT_CHIPS.wedding.length).toBeGreaterThan(0);
    expect(MODALITY_PROMPT_CHIPS.birthday.length).toBeGreaterThan(0);
    expect(MODALITY_PROMPT_CHIPS.community.length).toBeGreaterThan(0);
  });

  it('askPlanningAssistant generates contextual advice and tactical actions', async () => {
    const res = await askPlanningAssistant(
      'How to calculate buffer times for wedding?',
      weddingPreset.event,
      weddingPreset
    );

    expect(res.role).toBe('assistant');
    expect(res.content.length).toBeGreaterThan(10);
    expect(res.suggestedActions?.length).toBeGreaterThan(0);
  });

  it('generateVendorVet calls proxy when custom API key is present', async () => {
    setCustomApiKey('test-custom-api-key');
    const proxySpy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValueOnce({
      whatsappOutreachScript: 'WA Custom Script',
      emailOutreachScript: 'Email Custom Script',
      vettingQuestions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
      hiddenCostRedFlags: ['Flag1', 'Flag2', 'Flag3', 'Flag4'],
    });

    const vet = await generateVendorVet('Palace Decor', 'decor', 500000);
    expect(proxySpy).toHaveBeenCalled();
    expect(vet.whatsappOutreachScript).toBe('WA Custom Script');
  });

  it('generateRippleScenario executes custom scenario via proxy or fallback on error', async () => {
    setCustomApiKey('test-custom-api-key');
    vi.spyOn(geminiClient, 'callGeminiProxy').mockRejectedValueOnce(new Error('Network offline'));

    const diff = await generateRippleScenario('custom', weddingPreset, 'Unexpected rain shower');
    expect(diff.scenarioTitle).toBeDefined();
    expect(diff.budgetAdjustments).toBeDefined();
  });

  it('generateCustomPlan synthesizes plan locally', async () => {
    const plan = await generateCustomPlan({
      name: 'Jaipur Heritage Gala',
      type: 'wedding',
      date: '2026-11-20',
      city: 'Jaipur',
      setting: 'outdoor',
      guestCount: 200,
      targetBudget: 1500000,
      currency: 'INR',
      culturalPreferences: 'Rajasthani folk decor',
    });

    expect(plan.event.name).toBe('Jaipur Heritage Gala');
    expect(plan.budgetItems.length).toBeGreaterThan(0);
    expect(plan.vendors.length).toBeGreaterThan(0);
  });
});
