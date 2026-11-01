import { handleGeminiProxyRequest } from '../server/geminiProxy.js';

const HANDLER_DEADLINE_MS = 9000;

function createTimeoutResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Overall handler deadline exceeded', code: 'GATEWAY_TIMEOUT' }),
    {
      status: 504,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function POST(req: Request): Promise<Response> {
  try {
    const envObj = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    const serverKey = envObj?.GEMINI_API_KEY;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<Response>((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(createTimeoutResponse());
      }, HANDLER_DEADLINE_MS);
    });

    const executionPromise = handleGeminiProxyRequest(req, serverKey).finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    return await Promise.race([executionPromise, timeoutPromise]);
  } catch {
    return new Response(
      JSON.stringify({ error: 'Internal server error in AI proxy handler' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({ error: 'Method Not Allowed' }),
    {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        Allow: 'POST',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

interface LegacyServerResponse {
  statusCode?: number;
  setHeader?: (name: string, value: string) => void;
  end: (chunk?: string) => void;
}

interface LegacyServerRequest {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  url?: string;
  [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array>;
}

export default async function handler(
  req: Request | LegacyServerRequest,
  res?: LegacyServerResponse
): Promise<Response> {
  if (res && typeof res.end === 'function') {
    const legacyReq = req as LegacyServerRequest;
    const method = legacyReq.method || 'POST';
    let webRes: Response;
    if (method === 'POST') {
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      if (typeof legacyReq[Symbol.asyncIterator] === 'function') {
        for await (const chunk of legacyReq as AsyncIterable<Uint8Array>) {
          const u8 = chunk instanceof Uint8Array ? chunk : new TextEncoder().encode(String(chunk));
          chunks.push(u8);
          totalBytes += u8.byteLength;
        }
      }
      const bodyBuffer = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        bodyBuffer.set(chunk, offset);
        offset += chunk.byteLength;
      }

      const host = legacyReq.headers?.host || 'localhost';
      const url = `http://${host}${legacyReq.url || '/api/gemini'}`;
      const webHeaders = new Headers();
      if (legacyReq.headers) {
        for (const [key, val] of Object.entries(legacyReq.headers)) {
          if (val) {
            if (Array.isArray(val)) {
              val.forEach((v) => webHeaders.append(key, v));
            } else {
              webHeaders.set(key, val);
            }
          }
        }
      }

      const webReq = new Request(url, {
        method: 'POST',
        headers: webHeaders,
        body: bodyBuffer.length > 0 ? bodyBuffer : undefined,
      });
      webRes = await POST(webReq);
    } else {
      webRes = await GET();
    }
    res.statusCode = webRes.status;
    if (res.setHeader) {
      webRes.headers.forEach((val: string, key: string) => res.setHeader!(key, val));
    }
    res.end(await webRes.text());
    return webRes;
  }

  const standardReq = req as Request;
  const method = standardReq.method || 'POST';
  return method === 'POST' ? POST(standardReq) : GET();
}
