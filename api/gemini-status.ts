export async function GET(): Promise<Response> {
  try {
    const envObj = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    const serverKey = envObj?.GEMINI_API_KEY;
    const configured = typeof serverKey === 'string' && serverKey.trim().length > 5;

    return new Response(JSON.stringify({ configured }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}

export async function POST(): Promise<Response> {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      Allow: 'GET',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

interface LegacyServerResponse {
  statusCode?: number;
  setHeader?: (name: string, value: string) => void;
  end: (chunk?: string) => void;
}

interface LegacyServerRequest {
  method?: string;
}

export default async function handler(
  req?: Request | LegacyServerRequest,
  res?: LegacyServerResponse
): Promise<Response> {
  if (res && typeof res.end === 'function') {
    const method = req?.method || 'GET';
    const webRes = method === 'GET' ? await GET() : await POST();
    res.statusCode = webRes.status;
    if (res.setHeader) {
      webRes.headers.forEach((val: string, key: string) => res.setHeader!(key, val));
    }
    res.end(await webRes.text());
    return webRes;
  }

  const standardReq = req as Request | undefined;
  const method = standardReq?.method || 'GET';
  return method === 'GET' ? GET() : POST();
}
