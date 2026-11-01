export const UPSTREAM_TIMEOUT_MS = 8000;

export interface UpstreamResult {
  ok: boolean;
  status?: number;
  error?: string;
  code?: string;
  text?: string;
}

export async function callGoogleGeminiApi(
  prompt: string,
  model: string,
  responseMimeType: string,
  activeKey: string
): Promise<UpstreamResult> {
  try {
    const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(activeKey)}`;
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': activeKey },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType },
      }),
    });

    if (!upstreamResponse.ok) {
      return {
        ok: false,
        status: upstreamResponse.status === 429 ? 429 : 502,
        error: 'Upstream AI provider error',
      };
    }

    const upstreamData = (await upstreamResponse.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText = upstreamData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (typeof rawText !== 'string') {
      return { ok: false, status: 502, error: 'Empty or invalid response from upstream AI provider' };
    }

    if (rawText.includes(activeKey)) {
      return { ok: false, status: 500, error: 'Redacted response due to security policy' };
    }

    return { ok: true, text: rawText };
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError');
    return {
      ok: false,
      status: isTimeout ? 504 : 502,
      error: isTimeout ? 'Upstream AI request timed out' : 'Upstream communication error',
    };
  }
}
