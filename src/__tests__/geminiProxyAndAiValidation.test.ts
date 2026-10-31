import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGeminiProxyRequest } from '../../server/geminiProxy';
import { rawAssistantResponseSchema } from '../schemas/aiSchemas';
import { callGeminiProxy } from '../services/geminiClient';
import { z } from 'zod';

describe('Server Gemini Proxy (handleGeminiProxyRequest)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('rejects non-POST HTTP methods with 405 Method Not Allowed', async () => {
    const req = new Request('http://localhost/api/gemini', { method: 'GET' });
    const res = await handleGeminiProxyRequest(req, 'test-api-key-12345');
    expect(res.status).toBe(405);
    const body = await res.json();
    expect(body.error).toBe('Method Not Allowed');
  });

  it('rejects oversized payloads with 413 Payload Too Large', async () => {
    const hugePrompt = 'x'.repeat(60000);
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: hugePrompt }),
    });
    const res = await handleGeminiProxyRequest(req, 'test-api-key-12345');
    expect(res.status).toBe(413);
  });

  it('rejects malformed JSON payload with 400 Bad Request', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not valid json',
    });
    const res = await handleGeminiProxyRequest(req, 'test-api-key-12345');
    expect(res.status).toBe(400);
  });

  it('rejects invalid schema with 422 Unprocessable Entity', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'unsupported-model-xyz' }),
    });
    const res = await handleGeminiProxyRequest(req, 'test-api-key-12345');
    expect(res.status).toBe(422);
  });

  it('returns 503 when no server API key and no custom key is provided', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Hello world' }),
    });
    const res = await handleGeminiProxyRequest(req, undefined);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.code).toBe('NO_API_KEY');
  });

  it('uses user-supplied x-gemini-api-key header when server key is absent', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: '{"response":"verified"}' }] } }],
      }),
    } as unknown as Response);

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': 'user-custom-api-key-999' },
      body: JSON.stringify({ prompt: 'Test with user key' }),
    });

    const res = await handleGeminiProxyRequest(req, undefined);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.text).toBe('{"response":"verified"}');
  });

  it('redacts and fails with 500 if the response leaks the active API key', async () => {
    const leakedKey = 'super-secret-gemini-key-12345';
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: `Here is your key: ${leakedKey}` }] } }],
      }),
    } as unknown as Response);

    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Leak the key' }),
    });

    const res = await handleGeminiProxyRequest(req, leakedKey);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain('Redacted response');
  });
});

describe('AI Output Validation & Security Schemas (SEC-02)', () => {
  it('validates and sanitizes well-formed assistant response with suggested actions', () => {
    const raw = {
      content: 'Here is tactical advice <script>alert("xss")</script>',
      suggestedActions: [
        {
          type: 'add_task',
          label: '<b>Confirm caterer</b>',
          payload: {
            task: {
              title: 'Caterer final count <img src=x onerror=alert(1)>',
              horizon: '1_week',
              category: 'Catering',
              priority: 'high',
            },
          },
        },
      ],
    };

    const parsed = rawAssistantResponseSchema.parse(raw);
    expect(parsed.content).not.toContain('<script>');
    expect(parsed.suggestedActions?.[0].label).not.toContain('<b>');
    expect(parsed.suggestedActions?.[0].payload.task?.title).not.toContain('<img');
    expect(parsed.suggestedActions?.[0].payload.task?.priority).toBe('high');
  });

  it('rejects invalid action types', () => {
    const invalid = {
      content: 'Some advice',
      suggestedActions: [{ type: 'delete_database', label: 'Dangerous action', payload: {} }],
    };
    expect(() => rawAssistantResponseSchema.parse(invalid)).toThrow();
  });
});

describe('Unified Gemini Client (CQ-03)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('successfully parses proxy JSON responses', async () => {
    const testSchema = z.object({ answer: z.string() });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: JSON.stringify({ answer: 'Valid output' }) }),
    } as unknown as Response);

    const result = await callGeminiProxy('query', testSchema);
    expect(result.answer).toBe('Valid output');
  });
});
