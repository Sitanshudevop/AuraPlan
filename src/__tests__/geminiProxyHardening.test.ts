import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleGeminiProxyRequest } from '../../server/geminiProxy';
import {
  readRequestBodySafely,
  MAX_BODY_BYTES,
  getResolvedModel,
  DEFAULT_GEMINI_MODEL,
} from '../../server/geminiValidation';
import {
  checkSlidingRateLimit,
  resetRateLimitStore,
  extractClientIp,
  MAX_REQUESTS_PER_WINDOW,
  MAX_RATE_LIMIT_ENTRIES,
  getRateLimitStoreSize,
} from '../../server/geminiRateLimit';

describe('F2 Hardening: Body Limits & Stream Reading', () => {
  it('rejects with 413 when Content-Length header is declared oversize BEFORE reading', async () => {
    const getReaderSpy = vi.fn();
    const mockReq = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Content-Length': String(MAX_BODY_BYTES + 100),
      }),
      body: {
        getReader: getReaderSpy,
      },
    } as unknown as Request;

    const res = await handleGeminiProxyRequest(mockReq);
    expect(res.status).toBe(413);
    expect(getReaderSpy).not.toHaveBeenCalled();
    const json = await res.json();
    expect(json.error).toBe('Payload Too Large');
  });

  it('rejects with 413 when Content-Length is missing or misstated and stream exceeds cap', async () => {
    const chunk = new Uint8Array(20000);
    const bodyStream = new ReadableStream({
      start(controller) {
        controller.enqueue(chunk);
        controller.enqueue(chunk);
        controller.enqueue(chunk); // total 60000 > 51200
        controller.close();
      },
    });

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // missing Content-Length
      body: bodyStream,
      // @ts-expect-error duplex
      duplex: 'half',
    });

    const result = await readRequestBodySafely(req);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(413);
  });

  it('decodes multibyte UTF-8 characters split across chunk boundaries without corruption', async () => {
    // Rupee symbol '₹' is 3 bytes: 0xE2, 0x82, 0xB9
    const part1 = new Uint8Array([0xE2, 0x82]);
    const part2 = new Uint8Array([0xB9]);

    const bodyStream = new ReadableStream({
      start(controller) {
        controller.enqueue(part1);
        controller.enqueue(part2);
        controller.close();
      },
    });

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      body: bodyStream,
      // @ts-expect-error duplex
      duplex: 'half',
    });

    const result = await readRequestBodySafely(req);
    expect(result.ok).toBe(true);
    expect(result.body).toBe('₹');
  });

  it('handles empty body gracefully', async () => {
    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
    });
    const result = await readRequestBodySafely(req);
    expect(result.ok).toBe(true);
    expect(result.body).toBe('');
  });

  it('accepts exact-limit body (51200 bytes)', async () => {
    const exactBytes = new Uint8Array(MAX_BODY_BYTES);
    exactBytes.fill(32); // spaces

    const bodyStream = new ReadableStream({
      start(controller) {
        controller.enqueue(exactBytes);
        controller.close();
      },
    });

    const req = new Request('http://localhost:3000/api/gemini', {
      method: 'POST',
      headers: { 'Content-Length': String(MAX_BODY_BYTES) },
      body: bodyStream,
      // @ts-expect-error duplex
      duplex: 'half',
    });

    const result = await readRequestBodySafely(req);
    expect(result.ok).toBe(true);
    expect(result.body?.length).toBe(MAX_BODY_BYTES);
  });
});

describe('F2 Hardening: True Sliding Window Rate Limiter & Memory Bound', () => {
  beforeEach(() => {
    resetRateLimitStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetRateLimitStore();
  });

  it('enforces true sliding window: allows up to MAX_REQUESTS_PER_WINDOW, then blocks', () => {
    const ip = '198.51.100.1';
    const now = 1000000;

    for (let i = 0; i < MAX_REQUESTS_PER_WINDOW; i++) {
      expect(checkSlidingRateLimit(ip, now + i * 100)).toBe(true);
    }

    // 31st request in the same window fails
    expect(checkSlidingRateLimit(ip, now + 3500)).toBe(false);

    // After window slides forward (61 seconds), new requests are allowed
    expect(checkSlidingRateLimit(ip, now + 61000)).toBe(true);
  });

  it('caps map size at MAX_RATE_LIMIT_ENTRIES and prevents unbounded memory growth', () => {
    const now = 2000000;
    // Fill up to the cap
    for (let i = 0; i < MAX_RATE_LIMIT_ENTRIES; i++) {
      checkSlidingRateLimit(`10.0.0.${i}`, now);
    }
    expect(getRateLimitStoreSize()).toBeLessThanOrEqual(MAX_RATE_LIMIT_ENTRIES);

    // Adding more does not exceed cap
    checkSlidingRateLimit('99.99.99.99', now);
    expect(getRateLimitStoreSize()).toBeLessThanOrEqual(MAX_RATE_LIMIT_ENTRIES);
  });

  it('extracts client IP from platform headers with proper precedence', () => {
    // 1. x-real-ip
    const req1 = new Request('http://localhost', {
      headers: { 'x-real-ip': '203.0.113.195', 'x-forwarded-for': '198.51.100.2' },
    });
    expect(extractClientIp(req1)).toBe('203.0.113.195');

    // 2. x-vercel-forwarded-for
    const req2 = new Request('http://localhost', {
      headers: { 'x-vercel-forwarded-for': '198.51.100.5, 10.0.0.1' },
    });
    expect(extractClientIp(req2)).toBe('198.51.100.5');

    // 3. x-forwarded-for
    const req3 = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '192.0.2.1, 10.0.0.2' },
    });
    expect(extractClientIp(req3)).toBe('192.0.2.1');

    // 4. fallback
    const req4 = new Request('http://localhost');
    expect(extractClientIp(req4)).toBe('127.0.0.1');
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
