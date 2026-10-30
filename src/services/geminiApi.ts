import { z } from 'zod';

export async function callGeminiJson<T>(
  apiKey: string,
  prompt: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8500),
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = JSON.parse(rawText);
  return schema.parse(parsed);
}
