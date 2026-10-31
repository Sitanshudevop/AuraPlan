import { handleGeminiProxyRequest } from '../server/geminiProxy.js';

export default async function handler(req: Request): Promise<Response> {
  return handleGeminiProxyRequest(req);
}
