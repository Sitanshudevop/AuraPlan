import { describe, it, expect, vi, afterEach } from 'vitest';
import { handleGeminiProxyRequest } from '../../server/geminiProxy';
import {
  getResolvedModel,
  DEFAULT_GEMINI_MODEL,
} from '../../server/geminiValidation';
import {
  checkSlidingRateLimit,
  resetRateLimitStore,
  MAX_REQUESTS_PER_WINDOW,
} from '../../server/geminiRateLimit';

describe('F2 Hardening: handleGeminiProxyRequest and Upstream API Integration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    resetRateLimitStore();
  });

  it('rejects non-POST methods with 405', async () => {
    const req = new Request('http://localhost/api/gemini', { method: 'GET' });
    const res = await handleGeminiProxyRequest(req, 'dummy-key-12345');
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
  });

  it('rejects rate-limited requests with 429', async () => {
    const ip = '10.10.10.10';
    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      checkSlidingRateLimit(ip);
    }
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'x-real-ip': ip, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test' }),
    });
    const res = await handleGeminiProxyRequest(req, 'dummy-key-12345');
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.code).toBe('RATE_LIMITED');
  });

  it('rejects malformed JSON body with 400', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not a json',
    });
    const res = await handleGeminiProxyRequest(req, 'dummy-key-12345');
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Malformed JSON payload');
  });

  it('rejects invalid schema with 422', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalidField: 123 }),
    });
    const res = await handleGeminiProxyRequest(req, 'dummy-key-12345');
    expect(res.status).toBe(422);
  });

  it('returns 503 when API key is missing or placeholder', async () => {
    const proc = (globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process;
    const oldEnv = proc?.env?.GEMINI_API_KEY;
    if (proc?.env) delete proc.env.GEMINI_API_KEY;

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'test prompt' }),
    });
    const res = await handleGeminiProxyRequest(req, '');
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('NO_API_KEY');

    if (proc?.env && oldEnv) proc.env.GEMINI_API_KEY = oldEnv;
  });

  it('returns 200 on successful upstream call', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'Generated timeline response' }] } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Generate timeline' }),
    });
    const res = await handleGeminiProxyRequest(req, 'dummy-valid-key');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.text).toBe('Generated timeline response');
  });

  it('returns 502 when upstream API returns non-ok status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Upstream error' }), { status: 500 })
    );

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Generate timeline' }),
    });
    const res = await handleGeminiProxyRequest(req, 'dummy-valid-key');
    expect(res.status).toBe(502);
  });

  it('returns 429 when upstream API returns 429 rate limit', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Quota exceeded' }), { status: 429 })
    );

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Generate timeline' }),
    });
    const res = await handleGeminiProxyRequest(req, 'dummy-valid-key');
    expect(res.status).toBe(429);
  });

  it('returns 500 if upstream response contains the secret API key (leak prevention)', async () => {
    const key = 'secret-test-key-leaked';
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: `echoing ${key} here` }] } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Leak key' }),
    });
    const res = await handleGeminiProxyRequest(req, key);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Redacted response due to security policy');
  });

  it('returns 504 on upstream timeout or abort', async () => {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'TimeoutError';
    globalThis.fetch = vi.fn().mockRejectedValue(abortErr);

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Timeout test' }),
    });
    const res = await handleGeminiProxyRequest(req, 'dummy-key');
    expect(res.status).toBe(504);
  });

  it('returns 502 if upstream response lacks candidates', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ candidates: [] }), { status: 200 })
    );

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Empty response' }),
    });
    const res = await handleGeminiProxyRequest(req, 'dummy-key');
    expect(res.status).toBe(502);
  });
});

describe('F2 Hardening: Model Resolution and Server Env Override', () => {
  const proc = (globalThis as unknown as { process?: { env: Record<string, string | undefined> } }).process;
  const originalEnv = proc?.env?.GEMINI_MODEL;

  afterEach(() => {
    if (proc?.env) {
      if (originalEnv !== undefined) {
        proc.env.GEMINI_MODEL = originalEnv;
      } else {
        delete proc.env.GEMINI_MODEL;
      }
    }
  });

  it('resolves DEFAULT_GEMINI_MODEL by default', () => {
    if (proc?.env) delete proc.env.GEMINI_MODEL;
    expect(getResolvedModel()).toBe(DEFAULT_GEMINI_MODEL);
  });

  it('overrides model via server env GEMINI_MODEL when valid', () => {
    if (proc?.env) proc.env.GEMINI_MODEL = 'gemini-3.8-flash';
    expect(getResolvedModel('gemini-3.5-flash')).toBe('gemini-3.8-flash');
  });

  it('ignores invalid GEMINI_MODEL and falls back safely', () => {
    if (proc?.env) proc.env.GEMINI_MODEL = 'invalid-model-xyz';
    expect(getResolvedModel('gemini-3.6-flash')).toBe('gemini-3.6-flash');
  });
});
