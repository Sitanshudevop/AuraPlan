import { z } from 'zod';

export interface GeminiClientOptions {
  model?: string;
  customKey?: string;
  timeoutMs?: number;
  responseSchema?: Record<string, unknown>;
  systemInstruction?: string;
}

export type WithGeminiSource<T> = T & {
  source?: 'gemini';
  model?: string;
  [key: string]: unknown;
};

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
 * Implements structured output enforcement and a 1-time retry on validation failure.
 */
export async function callGeminiProxy<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options: GeminiClientOptions = {}
): Promise<WithGeminiSource<T>> {
  const {
    model = 'gemini-flash-lite-latest',
    customKey,
    timeoutMs = 12000,
    responseSchema,
    systemInstruction,
  } = options;
  const headers = buildProxyHeaders(customKey);

  const fetchAttempt = async (attemptPrompt: string) => {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        prompt: attemptPrompt,
        model,
        responseMimeType: 'application/json',
        responseSchema,
        systemInstruction,
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    const rawText = extractRawResponseText(data);
    const parsed = JSON.parse(rawText);
    const validated = schema.parse(parsed);
    const resModel = (typeof data.model === 'string' ? data.model : model);
    return { ...validated, source: 'gemini' as const, model: resModel };
  };

  try {
    return await fetchAttempt(prompt);
  } catch (initialErr) {
    // If parsing or schema validation failed, retry ONCE with stricter prompt before falling back
    try {
      const stricterPrompt = `${prompt}\n\nCRITICAL: Return ONLY valid JSON adhering strictly to the schema without markdown formatting or conversational commentary.`;
      return await fetchAttempt(stricterPrompt);
    } catch {
      throw initialErr;
    }
  }
}
