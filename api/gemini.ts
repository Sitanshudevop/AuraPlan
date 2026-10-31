import { handleGeminiProxyRequest } from '../server/geminiProxy';

export const runtime = 'edge';

export default async function handler(req: Request): Promise<Response> {
  return handleGeminiProxyRequest(req);
}

