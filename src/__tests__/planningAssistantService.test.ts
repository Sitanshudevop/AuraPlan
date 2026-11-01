import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { askPlanningAssistant } from '../services/planningAssistantService';
import * as geminiClient from '../services/geminiClient';
import * as geminiService from '../services/geminiService';
import { INITIAL_PRESETS } from '../data/presets';

describe('PlanningAssistantService: Remote Proxy & Fallbacks (F7)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls callGeminiProxy when API key is provided and returns parsed response', async () => {
    vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('mock-active-test-key-12345');
    const spyProxy = vi.spyOn(geminiClient, 'callGeminiProxy').mockResolvedValue({
      content: 'AI proxy tactical response content',
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
    expect(spyProxy).toHaveBeenCalled();
    expect(res.content).toBe('AI proxy tactical response content');
    expect(res.suggestedActions?.length).toBe(1);
  });

  it('falls back to smart local response when callGeminiProxy rejects', async () => {
    vi.spyOn(geminiService, 'getActiveApiKey').mockReturnValue('mock-active-test-key-12345');
    vi.spyOn(geminiClient, 'callGeminiProxy').mockRejectedValue(new Error('Proxy network failure'));

    const event = INITIAL_PRESETS['preset-wedding-udaipur'].event;
    const state = INITIAL_PRESETS['preset-wedding-udaipur'];

    const res = await askPlanningAssistant('What about catering buffer?', event, state);
    expect(res).toBeDefined();
    expect(res.content).toBeDefined();
  });
});

