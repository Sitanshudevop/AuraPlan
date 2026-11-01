import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import handler from '../../api/gemini';

describe('Vercel API Entry Handler: /api/gemini', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns 405 Method Not Allowed for GET requests with JSON error and Allow header', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'GET',
    });
    const res = await handler(req);

    expect(res.status).toBe(405);
    expect(res.headers.get('Content-Type')).toContain('application/json');
    expect(res.headers.get('Allow')).toBe('POST');
    const json = await res.json();
    expect(json).toEqual({ error: 'Method Not Allowed' });
  });

  it('returns 400 Malformed JSON payload when body cannot be parsed', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json-{broken',
    });
    const res = await handler(req);

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Malformed JSON payload');
  });

  it('returns 422 Invalid request body schema when prompt is empty string', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: '' }),
    });
    const res = await handler(req);

    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error).toBe('Invalid request body schema');
    expect(Array.isArray(json.details)).toBe(true);
  });

  it('returns 413 Payload Too Large when Content-Length header or body exceeds 50 KB', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': '60000',
      },
      body: JSON.stringify({ prompt: 'x'.repeat(60000) }),
    });
    const res = await handler(req);

    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error).toBe('Payload Too Large');
  });

  it('returns 503 NO_API_KEY when neither server env key nor x-gemini-api-key header is provided', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Plan wedding schedule' }),
    });
    const res = await handler(req);

    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.code).toBe('NO_API_KEY');
    expect(json.error).toContain('Gemini service not configured');
  });

  it('returns 200 with generated text on successful upstream response, without leaking key', async () => {
    const mockKey = 'FAKE-TEST-KEY-FOR-HANDLER-UNIT-TESTING-123';
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: '{"title":"Luxury Palace Wedding"}' }],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': mockKey,
      },
      body: JSON.stringify({ prompt: 'Plan wedding schedule' }),
    });
    const res = await handler(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.text).toBe('{"title":"Luxury Palace Wedding"}');
    expect(JSON.stringify(json)).not.toContain(mockKey);
  });

  it('returns 500 redacted response if upstream maliciously echoes back the active API key', async () => {
    const mockKey = 'FAKE-SECRET-KEY-MUST-NEVER-BE-LEAKED-123';
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: `Leaked secret is ${mockKey}` }],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': mockKey,
      },
      body: JSON.stringify({ prompt: 'Echo key test' }),
    });
    const res = await handler(req);

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Redacted response due to security policy');
    expect(JSON.stringify(json)).not.toContain(mockKey);
  });

  it('returns 502 on upstream AI provider error status', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Internal Google Error' }), { status: 500 })
    );

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': 'FAKE-VALID-KEY-FOR-UPSTREAM-ERROR-TEST-1234',
      },
      body: JSON.stringify({ prompt: 'Plan wedding schedule' }),
    });
    const res = await handler(req);

    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toBe('Upstream AI provider error');
  });

  it('returns 504 when upstream request times out with TimeoutError or AbortError', async () => {
    const timeoutErr = new Error('The operation was aborted');
    timeoutErr.name = 'TimeoutError';
    globalThis.fetch = vi.fn().mockRejectedValue(timeoutErr);

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gemini-api-key': 'FAKE-GOOGLE-API-KEY-PLACEHOLDER',
      },
      body: JSON.stringify({ prompt: 'Plan wedding schedule' }),
    });
    const res = await handler(req);

    expect(res.status).toBe(504);
    const json = await res.json();
    expect(json.error).toBe('Upstream AI request timed out');
  });
});

