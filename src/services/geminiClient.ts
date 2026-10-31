import { z } from 'zod';

export interface GeminiClientOptions {
  model?: 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-2.0-flash';
  customKey?: string;
  timeoutMs?: number;
}

function buildProxyHeaders(customKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (customKey && customKey.trim().length > 5) {
    headers['x-gemini-api-key'] = customKey.trim();
  }
  return headers;
}

interface UpstreamCandidatePayload {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

function extractRawResponseText(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Gemini API error: Invalid response format');
  }
  const record = data as Record<string, unknown> & UpstreamCandidatePayload;
  if (typeof record.text === 'string' && record.text.trim().length > 0) {
    return record.text;
  }
  const candidateText = record.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof candidateText === 'string' && candidateText.trim().length > 0) {
    return candidateText;
  }
  throw new Error('Gemini API error: Invalid response text');
}

/**
 * Unified client caller for the AuraPlan Gemini serverless proxy (/api/gemini).
 */
export async function callGeminiProxy<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options: GeminiClientOptions = {}
): Promise<T> {
  const { model = 'gemini-1.5-flash', customKey, timeoutMs = 9000 } = options;
  const headers = buildProxyHeaders(customKey);

  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers,
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      prompt,
      model,
      responseMimeType: 'application/json',
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const rawText = extractRawResponseText(data);
  const parsed = JSON.parse(rawText);
  return schema.parse(parsed);
}
