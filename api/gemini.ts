import { handleGeminiProxyRequest } from '../server/geminiProxy.js';

export default async function handler(req: Request): Promise<Response> {
  const envObj = (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const serverKey = envObj?.GEMINI_API_KEY;
  return handleGeminiProxyRequest(req, serverKey);
}

