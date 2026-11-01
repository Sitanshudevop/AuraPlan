import { describe, it, expect, vi, afterEach } from 'vitest';
import { callGeminiProxy } from '../services/geminiClient';
import { generateThemeIdea, generateVendorVet, generateRippleScenario } from '../services/geminiService';
import { themeIdeaSchema } from '../schemas/aiSchemas';
import { INITIAL_PRESETS } from '../data/presets';
import { renderHook, act } from '@testing-library/react';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext';
import React from 'react';

describe('Chaos & Resilience Testing Suite (F7)', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('simulates offline mode: network error triggers graceful deterministic fallback', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch (offline)'));

    // 1. Theme idea fallback
    const theme = await generateThemeIdea('wedding', 'royal heritage');
    expect(theme).toBeDefined();
    expect(theme.vibe).toBeDefined();

    // 2. Vendor vet fallback
    const vet = await generateVendorVet('Grand Palace Venue', 'venue', 500000);
    expect(vet).toBeDefined();
    expect(vet.vettingQuestions.length).toBeGreaterThan(0);

    // 3. Ripple effect fallback
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];
    const ripple = await generateRippleScenario('guest_surge_25', state);
    expect(ripple).toBeDefined();
    expect(ripple.budgetAdjustments.length).toBeGreaterThan(0);
  });

  it('simulates slow network (2s delay) without failing or hanging', async () => {
    globalThis.fetch = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(
                  JSON.stringify({
                    text: JSON.stringify({
                      id: 'delayed-theme-1',
                      title: 'Delayed Response',
                      vibe: 'chill',
                      description: 'Delayed response loaded',
                      colors: [],
                      decorConcepts: [],
                      menuItems: [],
                      activities: [],
                    }),
                  }),
                  { status: 200, headers: { 'Content-Type': 'application/json' } }
                )
              ),
            100 // Keep within reasonable test speed while testing async resolution
          )
        )
    );

    const res = await callGeminiProxy('Hello after delay', themeIdeaSchema);
    expect(res).toBeDefined();
  });

  it('handles random 500 server errors from Gemini API gracefully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const state = INITIAL_PRESETS['preset-wedding-udaipur'];
    // Must not throw an unhandled rejection, falls back to deterministic engine
    const ripple = await generateRippleScenario('cut_budget_15', state);
    expect(ripple).toBeDefined();
    expect(ripple.scenarioTitle).toBeDefined();
  });

  it('handles concurrent tab storage events gracefully', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WorkspaceProvider>{children}</WorkspaceProvider>
    );

    const { result } = renderHook(() => useWorkspace(), { wrapper });
    expect(result.current.state).toBeDefined();

    // Simulate another browser tab saving state
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'auraplan_workspace_v1',
          newValue: JSON.stringify({
            version: 1,
            activePresetId: 'preset-birthday-botanical',
            states: INITIAL_PRESETS,
            theme: 'dark',
          }),
        })
      );
    });

    // App remains stable and interactive
    expect(result.current.state.event.name).toBeDefined();
  });
});

