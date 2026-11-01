import { z } from 'zod';

export const ALLOWED_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-3.8-flash',
] as const;

export type AllowedModel = (typeof ALLOWED_MODELS)[number];
export const DEFAULT_GEMINI_MODEL: AllowedModel = 'gemini-3.5-flash';

export function getResolvedModel(requestedModel?: string): AllowedModel {
  const envModel = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.GEMINI_MODEL;
  if (envModel && (ALLOWED_MODELS as readonly string[]).includes(envModel)) {
    return envModel as AllowedModel;
  }
  if (requestedModel && (ALLOWED_MODELS as readonly string[]).includes(requestedModel)) {
    return requestedModel as AllowedModel;
  }
  return DEFAULT_GEMINI_MODEL;
}

export const proxyRequestSchema = z
  .object({
    prompt: z.string().min(1).max(30000),
    model: z.enum(ALLOWED_MODELS).optional(),
    responseMimeType: z.enum(['application/json', 'text/plain']).default('application/json'),
    systemInstruction: z.string().max(5000).optional(),
  })
  .strict();

export type ProxyRequestBody = z.infer<typeof proxyRequestSchema>;

export const MAX_BODY_BYTES = 51200; // 50 KB max payload

export interface ReadBodyResult {
  ok: boolean;
  status?: 400 | 413;
  error?: string;
  body?: string;
}

export async function readRequestBodySafely(
  req: Request,
  maxBytes = MAX_BODY_BYTES
): Promise<ReadBodyResult> {
  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader) {
    const declaredLength = parseInt(contentLengthHeader, 10);
    if (!Number.isNaN(declaredLength) && declaredLength > maxBytes) {
      return { ok: false, status: 413, error: 'Payload Too Large' };
    }
  }

  if (!req.body) {
    return { ok: true, body: '' };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          try { await reader.cancel(); } catch { /* ignore */ }
          return { ok: false, status: 413, error: 'Payload Too Large' };
        }
        chunks.push(value);
      }
    }
  } catch {
    return { ok: false, status: 400, error: 'Failed to read request body stream' };
  }

  if (chunks.length === 0) {
    return { ok: true, body: '' };
  }

  const combined = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const decoder = new TextDecoder('utf-8', { fatal: false });
  return { ok: true, body: decoder.decode(combined) };
}
