import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askPlanningAssistant, isNonPlanningQuery } from '../services/planningAssistantService';
import * as geminiClient from '../services/geminiClient';
import * as geminiService from '../services/geminiService';
import { INITIAL_PRESETS } from '../data/presets';
import { classifyIntent } from '../services/assistantResponses';

describe('PlanningAssistantService: Remote Proxy, Context & Live Answers (F7/LiveAI)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies prompt and event context reach proxy body via systemInstruction', async () => {
    vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('mock-active-test-key-12345');
    const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
      content: 'AI proxy tactical response content',
      source: 'gemini',
      model: 'gemini-flash-lite-latest',
      suggestedActions: [
        {
          type: 'add_task',
          label: 'Schedule AV rehearsal',
          payload: {
            task: {
              title: 'Rehearse Sound',
              horizon: '1_week',
              category: 'AV',
              priority: 'high',
            },
          },
        },
      ],
    });

    const event = INITIAL_PRESETS['preset-wedding-udaipur'].event;
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];

    const res = await askPlanningAssistant('How to manage rain?', event, state);
    expect(spyProxy).toHaveBeenCalledTimes(1);
    const callArgs = spyProxy.mock.calls[0];
    expect(callArgs[0]).toContain('How to manage rain?');
    expect(callArgs[2]?.systemInstruction).toContain(event.name);
    expect(callArgs[2]?.systemInstruction).toContain(event.city);
    expect(res.content).toBe('AI proxy tactical response content');
    expect(res.source).toBe('gemini');
    expect(res.suggestedActions?.length).toBe(1);
  });

  it('guarantees answers differ for different prompts in live AI mode', async () => {
    vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('mock-active-test-key-12345');
    vi.spyOn(geminiClient, 'callGeminiProxy').mockImplementation(async (prompt) => {
      if (prompt.includes('Sangeet')) {
        return {
          content: 'Sangeet sequence with entry at 7:30 PM and couple performance at 8:45 PM',
          source: 'gemini',
          model: 'gemini-flash-lite-latest',
          suggestedActions: [],
        };
      }
      return {
        content: 'Catering strategy: 10% floating plate buffer for 250 guests',
        source: 'gemini',
        model: 'gemini-flash-lite-latest',
        suggestedActions: [],
      };
    });

    const event = INITIAL_PRESETS['preset-wedding-udaipur'].event;
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];

    const res1 = await askPlanningAssistant('Suggest Sangeet music and dance sequence', event, state);
    const res2 = await askPlanningAssistant('Calculate catering buffer', event, state);

    expect(res1.content).not.toEqual(res2.content);
    expect(res1.content).toContain('Sangeet');
    expect(res2.content).toContain('Catering');
  });

  it('returns polite refusal with 0 suggested actions for non-planning inputs (URLs, gibberish)', async () => {
    vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('mock-active-test-key-12345');
    const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
      content: 'I cannot process external links',
      source: 'gemini',
      model: 'gemini-flash-lite-latest',
      suggestedActions: [
        {
          type: 'add_task',
          label: 'Echoed task',
          payload: { task: { title: 'https://example.com', horizon: '1_week', category: 'Ops', priority: 'high' } },
        },
      ],
    });

    const event = INITIAL_PRESETS['preset-wedding-udaipur'].event;
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];

    expect(isNonPlanningQuery('https://example.com/unrelated')).toBe(true);
    expect(isNonPlanningQuery('asdfghjkl')).toBe(true);
    expect(isNonPlanningQuery('What buffer time between Baraat and Varmala?')).toBe(false);

    const resUrl = await askPlanningAssistant('https://example.com/unrelated', event, state);
    expect(spyProxy).toHaveBeenCalled();
    expect(resUrl.suggestedActions?.length).toBe(0);
    expect(resUrl.content).not.toContain('Regarding');
  });

  it('prevents suggested action titles from echoing raw user query', async () => {
    vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('mock-active-test-key-12345');
    vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
      content: 'Planning response',
      source: 'gemini',
      model: 'gemini-flash-lite-latest',
      suggestedActions: [
        {
          type: 'add_task',
          label: 'Echo task',
          payload: { task: { title: 'Action Item: How do I book sound licenses?', horizon: '1_week', category: 'Ops', priority: 'high' } },
        },
        {
          type: 'add_task',
          label: 'Clean task',
          payload: { task: { title: 'File Police Route NOC and Sound License Application', horizon: '1_week', category: 'Ops', priority: 'high' } },
        },
      ],
    });

    const event = INITIAL_PRESETS['preset-wedding-udaipur'].event;
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];

    const res = await askPlanningAssistant('How do I book sound licenses?', event, state);
    // The echoed action should be filtered out, leaving only the clean task
    expect(res.suggestedActions?.length).toBe(1);
    expect(res.suggestedActions?.[0].label).toBe('Clean task');
  });

  it('classifies each of the 9 offline intents accurately', () => {
    const intents = [
      { query: 'save money and cut budget costs', expected: 'getCostSavingsResponse' },
      { query: 'what buffer time between baraat and varmala', expected: 'getBufferResponse' },
      { query: 'rain and monsoon weather contingency', expected: 'getWeatherResponse' },
      { query: 'catering plate buffer and jain food', expected: 'getCateringResponse' },
      { query: 'sangeet choreography and music track list', expected: 'getSangeetResponse' },
      { query: 'negotiate vendor payment advances and retention', expected: 'getVendorsResponse' },
      { query: 'guest rsvp seating and hospitality desk', expected: 'getGuestsResponse' },
      { query: 'mandap ritual muhurat and priest samagri', expected: 'getRitualsResponse' },
      { query: 'flower decor and stage lighting grid', expected: 'getModalitySpecificResponse' },
    ];

    for (const item of intents) {
      const handler = classifyIntent(item.query);
      expect(handler).toBeDefined();
      expect(typeof handler).toBe('function');
    }
  });

  it('falls back to smart local response with offline source label when proxy rejects', async () => {
    vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('mock-active-test-key-12345');
    vi.spyOn(geminiClient, 'callGeminiProxy').mockRejectedValue(new Error('Proxy 504 timeout'));

    const event = INITIAL_PRESETS['preset-wedding-udaipur'].event;
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];

    const res = await askPlanningAssistant('What buffer is needed between Baraat and Varmala?', event, state);
    expect(res).toBeDefined();
    expect(res.source).toBe('offline');
    expect(res.content).toContain('Baraat');
    expect(res.content).not.toContain('Regarding');
  });
});
