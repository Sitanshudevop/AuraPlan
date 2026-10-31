import { z } from 'zod';

export const ALLOWED_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash',
] as const;

export const proxyRequestSchema = z
  .object({
    prompt: z.string().min(1).max(30000),
    model: z.enum(ALLOWED_MODELS).default('gemini-1.5-flash'),
    responseMimeType: z.enum(['application/json', 'text/plain']).default('application/json'),
    systemInstruction: z.string().max(5000).optional(),
  })
  .strict();

export type ProxyRequestBody = z.infer<typeof proxyRequestSchema>;

const MAX_BODY_BYTES = 51200; // 50 KB max payload

/**
 * Best-effort in-memory sliding window rate limiter.
 * Note: In serverless environments, in-memory limits are per execution instance.
 */
interface RateLimitBucket {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 30;

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const bucket = rateLimitMap.get(clientIp);
  if (!bucket || now > bucket.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  bucket.count++;
  return true;
}

function extractClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown-client';
}

function makeJsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      ...extraHeaders,
    },
  });
}

/**
 * Pure Web Request -> Response handler for Gemini AI proxy.
 */
export async function handleGeminiProxyRequest(
  req: Request,
  serverApiKey?: string
): Promise<Response> {
  // 1. Method check: POST only
  if (req.method !== 'POST') {
    return makeJsonResponse({ error: 'Method Not Allowed' }, 405, { Allow: 'POST' });
  }

  // 2. Rate limiting check
  const clientIp = extractClientIp(req);
  if (!checkRateLimit(clientIp)) {
    return makeJsonResponse(
      { error: 'Too Many Requests', code: 'RATE_LIMITED' },
      429,
      { 'Retry-After': '60' }
    );
  }

  // 3. Body size check (Content-Length header)
  const contentLengthHeader = req.headers.get('content-length');
  if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_BODY_BYTES) {
    return makeJsonResponse({ error: 'Payload Too Large' }, 413);
  }

  // 4. Read body with byte size limit guard
  let rawBody: string;
  try {
    rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return makeJsonResponse({ error: 'Payload Too Large' }, 413);
    }
  } catch {
    return makeJsonResponse({ error: 'Failed to read request body' }, 400);
  }

  // 5. Parse and strictly validate JSON payload
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return makeJsonResponse({ error: 'Malformed JSON payload' }, 400);
  }

  const parseResult = proxyRequestSchema.safeParse(parsedJson);
  if (!parseResult.success) {
    return makeJsonResponse(
      { error: 'Invalid request body schema', details: parseResult.error.issues },
      422
    );
  }
  const { prompt, model, responseMimeType } = parseResult.data;

  // 6. Resolve API Key: Server env key takes precedence, followed by user-supplied custom key header
  const userKeyHeader = req.headers.get('x-gemini-api-key')?.trim();
  const envObj = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const activeKey = serverApiKey || envObj?.GEMINI_API_KEY || userKeyHeader;

  if (!activeKey || activeKey.length < 6 || activeKey === 'YOUR_GEMINI_API_KEY') {
    return makeJsonResponse(
      {
        error: 'Gemini service not configured. Falling back to deterministic local plan engine.',
        code: 'NO_API_KEY',
      },
      503
    );
  }

  // 7. Dispatch upstream to Google Gemini API with timeout
  try {
    const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(activeKey)}`;
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(9000),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType },
      }),
    });

    if (!upstreamResponse.ok) {
      return makeJsonResponse(
        { error: 'Upstream AI provider error', status: upstreamResponse.status },
        upstreamResponse.status === 429 ? 429 : 502
      );
    }

    const upstreamData = await upstreamResponse.json();
    const rawText = upstreamData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof rawText !== 'string') {
      return makeJsonResponse(
        { error: 'Empty or invalid response from upstream AI provider' },
        502
      );
    }

    // Invariant security defense: ensure the API key is never leaked in the response text
    if (rawText.includes(activeKey)) {
      return makeJsonResponse({ error: 'Redacted response due to security policy' }, 500);
    }

    return makeJsonResponse({ text: rawText });
  } catch (err: unknown) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError';
    return makeJsonResponse(
      { error: isTimeout ? 'Upstream AI request timed out' : 'Upstream communication error' },
      isTimeout ? 504 : 502
    );
  }
}
