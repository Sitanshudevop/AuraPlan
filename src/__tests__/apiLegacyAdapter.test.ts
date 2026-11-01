import { describe, it, expect } from 'vitest';
import defaultGeminiHandler from '../../api/gemini';
import defaultStatusHandler from '../../api/gemini-status';

describe('API Legacy Handler Adapters & Edge Branches', () => {
  it('handles legacy (req, res) for gemini-status GET and POST', async () => {
    let status = 0;
    const headers: Record<string, string> = {};
    let endBody = '';

    const mockRes = {
      set statusCode(val: number) { status = val; },
      get statusCode() { return status; },
      setHeader: (k: string, v: string) => { headers[k] = v; },
      end: (chunk?: string) => { endBody = chunk || ''; },
    };

    const legacyGetReq = { method: 'GET' };
    const getRes = await defaultStatusHandler(legacyGetReq, mockRes);
    expect(getRes.status).toBe(200);
    expect(status).toBe(200);
    expect(endBody).toContain('configured');

    const legacyPostReq = { method: 'POST' };
    const postRes = await defaultStatusHandler(legacyPostReq, mockRes);
    expect(postRes.status).toBe(405);
    expect(status).toBe(405);
  });

  it('handles standard Request for default status handler when res is omitted', async () => {
    const res = await defaultStatusHandler();
    expect(res.status).toBe(200);
  });

  it('handles legacy (req, res) for gemini handler with GET and POST streams', async () => {
    let status = 0;
    const headers: Record<string, string> = {};
    let endBody = '';

    const mockRes = {
      set statusCode(val: number) { status = val; },
      get statusCode() { return status; },
      setHeader: (k: string, v: string) => { headers[k] = v; },
      end: (chunk?: string) => { endBody = chunk || ''; },
    };

    // GET method
    const legacyGetReq = { method: 'GET', url: '/api/gemini' };
    const getRes = await defaultGeminiHandler(legacyGetReq, mockRes);
    expect(getRes.status).toBe(405);
    expect(status).toBe(405);

    // POST with async iterator chunks
    const chunkData = new TextEncoder().encode(JSON.stringify({ prompt: 'test' }));
    const legacyPostReq = {
      method: 'POST',
      url: '/api/gemini',
      headers: {
        'content-type': 'application/json',
        'content-length': String(chunkData.byteLength),
      },
      async *[Symbol.asyncIterator]() {
        yield chunkData;
      },
    };

    const postRes = await defaultGeminiHandler(legacyPostReq, mockRes);
    expect([400, 503]).toContain(postRes.status);
    expect([400, 503]).toContain(status);
    expect(endBody.length).toBeGreaterThan(0);
  });

  it('falls back to standard POST when res is omitted on defaultGeminiHandler', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'hi' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await defaultGeminiHandler(req);
    expect([400, 503]).toContain(res.status);
  });

  it('handles invalid prompt gracefully returning 400 or 422', async () => {
    const brokenReq = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ prompt: '' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await defaultGeminiHandler(brokenReq);
    expect([400, 422]).toContain(res.status);
  });
});
