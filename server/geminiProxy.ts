import {
  ALLOWED_MODELS,
  proxyRequestSchema,
  ProxyRequestBody,
  readRequestBodySafely,
  getResolvedModel,
} from './geminiValidation.js';
import {
  checkSlidingRateLimit,
  extractClientIp,
} from './geminiRateLimit.js';
import { callGoogleGeminiApi } from './geminiUpstream.js';

export {
  ALLOWED_MODELS,
  proxyRequestSchema,
  type ProxyRequestBody,
};

export function makeJsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      Pragma: 'no-cache',
      ...extraHeaders,
    },
  });
}

function resolveActiveKey(req: Request, serverApiKey?: string): string | undefined {
  const userKeyHeader = req.headers.get('x-gemini-api-key')?.trim();
  const envObj = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return serverApiKey || envObj?.GEMINI_API_KEY || userKeyHeader;
}

export async function handleGeminiProxyRequest(
  req: Request,
  serverApiKey?: string
): Promise<Response> {
  if (req.method !== 'POST') {
    return makeJsonResponse({ error: 'Method Not Allowed' }, 405, { Allow: 'POST' });
  }

  const clientIp = extractClientIp(req);
  if (!checkSlidingRateLimit(clientIp)) {
    return makeJsonResponse(
      { error: 'Too Many Requests', code: 'RATE_LIMITED' },
      429,
      { 'Retry-After': '60' }
    );
  }

  const readResult = await readRequestBodySafely(req);
  if (!readResult.ok) {
    return makeJsonResponse({ error: readResult.error }, readResult.status || 400);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(readResult.body || '{}');
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

  const { prompt, model: reqModel, responseMimeType } = parseResult.data;
  const activeKey = resolveActiveKey(req, serverApiKey);

  if (!activeKey || activeKey.length < 6 || activeKey === 'YOUR_GEMINI_API_KEY') {
    return makeJsonResponse(
      {
        error: 'Gemini service not configured. Falling back to deterministic local plan engine.',
        code: 'NO_API_KEY',
      },
      503
    );
  }

  const resolvedModel = getResolvedModel(reqModel);
  const upstreamResult = await callGoogleGeminiApi(prompt, resolvedModel, responseMimeType, activeKey);

  if (!upstreamResult.ok) {
    return makeJsonResponse(
      { error: upstreamResult.error, ...(upstreamResult.status ? { status: upstreamResult.status } : {}) },
      upstreamResult.status || 502
    );
  }

  return makeJsonResponse({ text: upstreamResult.text });
}
