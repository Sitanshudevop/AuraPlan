export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'GET' },
    });
  }

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
}
