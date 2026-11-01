import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as geminiApi from '../../api/gemini';
import * as statusApi from '../../api/gemini-status';
import { askPlanningAssistant } from '../services/planningAssistantService';
import { generateThemeIdea, generateVendorVet, generateRippleScenario } from '../services/geminiService';
import { weddingPreset } from '../data/weddingPreset';

describe('F1 Regression Guard: API Entry Export Shapes & Handlers', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('asserts api/gemini exports named POST, GET and default handler', () => {
    expect(typeof geminiApi.POST).toBe('function');
    expect(typeof geminiApi.GET).toBe('function');
    expect(typeof geminiApi.default).toBe('function');
  });

  it('asserts api/gemini-status exports named GET, POST and default handler', () => {
    expect(typeof statusApi.GET).toBe('function');
    expect(typeof statusApi.POST).toBe('function');
    expect(typeof statusApi.default).toBe('function');
  });

  it('geminiApi.GET returns 405 Method Not Allowed with Allow: POST', async () => {
    const res = await geminiApi.GET();
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
    const json = await res.json();
    expect(json.error).toBe('Method Not Allowed');
  });

  it('geminiApi.POST returns 400 on malformed JSON body', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-{broken',
    });
    const res = await geminiApi.POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Malformed JSON payload');
  });

  it('geminiApi.POST returns 503 NO_API_KEY when key is absent', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Hello' }),
    });
    const res = await geminiApi.POST(req);
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('NO_API_KEY');
  });

  it('geminiApi.POST returns 200 on successful upstream response with custom key', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: '{"ok":true}' }] } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': 'TEST-CUSTOM-KEY-FOR-EXPORT-UNIT-TEST-1234',
      },
      body: JSON.stringify({ prompt: 'Hello' }),
    });
    const res = await geminiApi.POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.text).toBe('{"ok":true}');
  });

  it('geminiApi.POST handles upstream timeout by returning 504', async () => {
    const timeoutErr = new Error('Timeout');
    timeoutErr.name = 'TimeoutError';
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutErr);

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': 'TEST-CUSTOM-KEY-FOR-EXPORT-UNIT-TEST-1234',
      },
      body: JSON.stringify({ prompt: 'Hello' }),
    });
    const res = await geminiApi.POST(req);
    expect(res.status).toBe(504);
  });

  it('geminiApi.POST handles upstream 500 by returning 502', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Upstream Down' }), { status: 500 })
    );

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': 'TEST-CUSTOM-KEY-FOR-EXPORT-UNIT-TEST-1234',
      },
      body: JSON.stringify({ prompt: 'Hello' }),
    });
    const res = await geminiApi.POST(req);
    expect(res.status).toBe(502);
  });

  it('geminiApi legacy (req, res) handler executes and ends res without hanging', async () => {
    let endedBody = '';
    const mockRes = {
      statusCode: 200,
      setHeader: vi.fn(),
      end: vi.fn((chunk?: string) => {
        endedBody = chunk || '';
      }),
    };
    const mockReq = {
      method: 'GET',
      headers: { host: 'localhost' },
      url: '/api/gemini',
    };

    await geminiApi.default(mockReq, mockRes);
    expect(mockRes.end).toHaveBeenCalled();
    expect(mockRes.statusCode).toBe(405);
    expect(endedBody).toContain('Method Not Allowed');
  });

  it('statusApi returns 200 JSON with configured boolean', async () => {
    const res = await statusApi.GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(typeof json.configured).toBe('boolean');
  });

  it('statusApi POST returns 405 Method Not Allowed with Allow: GET', async () => {
    const res = await statusApi.POST();
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('GET');
  });

  it('statusApi legacy (req, res) handler writes to res and ends', async () => {
    const mockRes = {
      statusCode: 200,
      setHeader: vi.fn(),
      end: vi.fn(),
    };
    const mockReq = { method: 'GET' };
    await statusApi.default(mockReq, mockRes);
    expect(mockRes.end).toHaveBeenCalled();
  });
});

describe('F1 Client Resilience: Offline Fallback on Fetch Failures', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const failureScenarios = [
    { name: 'fetch rejects (network offline)', fn: () => vi.fn().mockRejectedValue(new Error('Failed to fetch')) },
    { name: '500 Internal Server Error', fn: () => vi.fn().mockResolvedValue(new Response('Server error', { status: 500 })) },
    { name: '503 Service Unavailable', fn: () => vi.fn().mockResolvedValue(new Response('Unavailable', { status: 503 })) },
    { name: '504 Gateway Timeout', fn: () => vi.fn().mockResolvedValue(new Response('Timeout', { status: 504 })) },
    { name: 'malformed JSON response', fn: () => vi.fn().mockResolvedValue(new Response('Not-JSON', { status: 200, headers: { 'Content-Type': 'application/json' } })) },
  ];

  failureScenarios.forEach(({ name, fn }) => {
    it(`all AI features return clear fallback result when ${name}`, async () => {
      globalThis.fetch = fn();

      // 1. Planning Assistant
      const assistantRes = await askPlanningAssistant('What is the venue checklist?', weddingPreset.event, weddingPreset);
      expect(assistantRes).toBeDefined();
      expect(typeof assistantRes.content).toBe('string');
      expect(assistantRes.content.length).toBeGreaterThan(10);

      // 2. Theme Idea Generator
      const themeRes = await generateThemeIdea('wedding', 'Royal Rajputana');
      expect(themeRes).toBeDefined();
      expect(themeRes.title).toBeDefined();

      // 3. Vendor Vet Generator
      const vetRes = await generateVendorVet('Palace Caterers', 'Catering', 250000);
      expect(vetRes).toBeDefined();
      expect(vetRes.vettingQuestions.length).toBeGreaterThan(0);

      // 4. Ripple Simulator
      const rippleRes = await generateRippleScenario('custom', weddingPreset, 'Surge 50 guests');
      expect(rippleRes).toBeDefined();
      expect(rippleRes.summaryRationale).toBeDefined();
    });
  });
});
