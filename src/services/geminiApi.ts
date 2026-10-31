import { z } from 'zod';
import { callGeminiProxy } from './geminiClient';

export async function callGeminiJson<T>(
  apiKey: string,
  prompt: string,
  schema: z.ZodSchema<T>
): Promise<T> {
  return callGeminiProxy(prompt, schema, { customKey: apiKey });
}
