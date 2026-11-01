import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useThemeIdeation } from '../features/ideation/useThemeIdeation';
import * as geminiClient from '../services/geminiClient';
import * as geminiService from '../services/geminiService';
import { eventReducer } from '../state/eventReducer';
import { INITIAL_PRESETS } from '../data/presets';

describe('Theme Ideation Hooks & Service Fallbacks (F7)', () => {
  beforeEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('calls loadTheme, handleAddToPlan, and handleInjectActivity in useThemeIdeation', async () => {
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];
    const addBudgetItem = vi.fn();
    const addMacroTask = vi.fn();
    const addDayOfActivity = vi.fn();
    const announce = vi.fn();

    vi.spyOn(geminiService, 'generateThemeIdea').mockResolvedValue({
      id: 'theme-mock',
      title: 'Mock Emerald Heritage',
      vibe: 'Royal',
      description: 'Mock Theme Description',
      colors: [{ name: 'Emerald', hex: '#059669', role: 'Primary' }],
      decorConcepts: [
        {
          id: 'd-1',
          title: 'Floral Canopy',
          description: 'Canopy with marigold',
          estimatedCost: 35000,
          timelineTask: 'Setup canopy',
          category: 'decor',
        },
      ],
      menuItems: [],
      activities: [],
    });

    const { result } = renderHook(() =>
      useThemeIdeation({
        state,
        addBudgetItem,
        addMacroTask,
        addDayOfActivity,
        announce,
      })
    );

    await act(async () => {
      await result.current.loadTheme('Contemporary Chic');
    });

    expect(result.current.idea?.title).toBe('Mock Emerald Heritage');

    act(() => {
      result.current.handleAddToPlan('Floral Canopy', 35000, 'decor', 'Setup canopy');
    });

    expect(addBudgetItem).toHaveBeenCalled();
    expect(addMacroTask).toHaveBeenCalled();
    expect(announce).toHaveBeenCalled();

    act(() => {
      result.current.handleAddActivityToTimeline({
        id: 'act-1',
        title: 'Royal Welcome Ritual',
        category: 'decor',
        description: 'Aarti and welcome drinks',
        estimatedCost: 15000,
        durationMinutes: 30,
        location: 'Main Gate',
        poc: 'Event Host',
      });
    });

    expect(addDayOfActivity).toHaveBeenCalled();
    expect(announce).toHaveBeenCalled();

    act(() => {
      result.current.handleAddActivityToBudget({
        id: 'act-1',
        title: 'Royal Welcome Ritual',
        category: 'decor',
        description: 'Aarti and welcome drinks',
        estimatedCost: 15000,
        durationMinutes: 30,
        location: 'Main Gate',
        poc: 'Event Host',
      });
    });
  });

  it('eventReducer returns untouched state on unrecognized action', () => {
    const state = INITIAL_PRESETS['preset-wedding-udaipur'].event;
    const untouched = eventReducer(state, { type: 'UNKNOWN' as unknown as 'UPDATE_EVENT', payload: {} });
    expect(untouched).toBe(state);
  });

  it('executes generateThemeIdea via callGeminiProxy with custom key', async () => {
    geminiService.setCustomApiKey('mock-key-custom-theme-999');
    const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
      id: 'theme-custom',
      title: 'Custom Royal Rajasthani',
      vibe: 'heritage',
      description: 'Cohesive heritage celebration',
      colors: [{ name: 'Saffron', hex: '#FF9933', role: 'Primary' }],
      decorConcepts: [],
      menuItems: [],
      activities: [],
    });

    const res = await geminiService.generateThemeIdea('wedding', 'heritage-unique-vibe-test');
    expect(spyProxy).toHaveBeenCalled();
    expect(res.title).toBe('Custom Royal Rajasthani');
    geminiService.removeCustomApiKey();
  });

  it('falls back to local theme idea when callGeminiProxy fails', async () => {
    geminiService.setCustomApiKey('mock-key-custom-theme-err');
    vi.spyOn(geminiClient, 'callGeminiProxy').mockRejectedValue(new Error('Proxy error'));

    const res = await geminiService.generateThemeIdea('birthday', 'disco-retro-unique-test');
    expect(res).toBeDefined();
    expect(res.vibe).toBeDefined();
    geminiService.removeCustomApiKey();
  });

  it('executes generateVendorVet via callGeminiProxy with custom key', async () => {
    geminiService.setCustomApiKey('mock-key-custom-vet-999');
    const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
      whatsappOutreachScript: 'Hello vendor, interested in your package',
      emailOutreachScript: 'Dear vendor, please share quotation',
      vettingQuestions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
      hiddenCostRedFlags: ['Flag1', 'Flag2', 'Flag3', 'Flag4'],
    });

    const res = await geminiService.generateVendorVet('Royal Caterers Unique 99', 'Catering', 200000);
    expect(spyProxy).toHaveBeenCalled();
    expect(res.vettingQuestions.length).toBe(5);
    geminiService.removeCustomApiKey();
  });

  it('falls back to local vendor vet when callGeminiProxy fails', async () => {
    geminiService.setCustomApiKey('mock-key-custom-vet-err');
    vi.spyOn(geminiClient, 'callGeminiProxy').mockRejectedValue(new Error('Proxy error'));

    const res = await geminiService.generateVendorVet('Fallback Caterers Unique 99', 'Catering', 250000);
    expect(res).toBeDefined();
    expect(res.vettingQuestions.length).toBeGreaterThan(0);

    // Test cache hit
    const cached = await geminiService.generateVendorVet('Fallback Caterers Unique 99', 'Catering', 250000);
    expect(cached).toBe(res);

    geminiService.removeCustomApiKey();
  });

  it('executes generateRippleScenario with custom preset and API key', async () => {
    geminiService.setCustomApiKey('mock-key-custom-ripple-999');
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];
    const mockDiff = {
      scenarioTitle: 'Custom Power Outage Scenario',
      scenarioDescription: 'Heavy storm caused power failure',
      budgetAdjustments: [],
      newVendors: [],
      timelineModifications: [],
      netBudgetImpact: 50000,
      guestCountImpact: 0,
      summaryRationale: 'Need backup generators',
    };
    const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue(mockDiff);

    const res = await geminiService.generateRippleScenario('custom', state, 'Storm blackout');
    expect(spyProxy).toHaveBeenCalled();
    expect(res.scenarioTitle).toBe('Custom Power Outage Scenario');

    // Also test proxy catch fallback
    spyProxy.mockRejectedValueOnce(new Error('Remote fail'));
    const fallback = await geminiService.generateRippleScenario('custom', state, 'Storm blackout fallback');
    expect(fallback).toBeDefined();
    expect(fallback.scenarioTitle).toBeDefined();

    geminiService.removeCustomApiKey();
  });
});

