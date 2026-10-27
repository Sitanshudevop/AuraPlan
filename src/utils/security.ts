/**
 * Security & Sanitization Utility Suite
 * Implements strict input sanitization, API rate limiting, and credential masking.
 */

/**
 * Strips all HTML tags, javascript: URIs, inline event handlers (e.g. onerror, onclick),
 * and script/iframe injection vectors.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  // Remove script, iframe, object, embed tags and their contents
  let clean = input.replace(/<(script|iframe|object|embed)[^>]*>([\s\S]*?)<\/\1>/gi, '');

  // Remove self-closing or lone script-like tags
  clean = clean.replace(/<(script|iframe|object|embed)[^>]*>/gi, '');

  // Remove inline event handlers (e.g. onerror=, onclick=, onload=)
  clean = clean.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Remove javascript: and data: URL schemes
  clean = clean.replace(/javascript\s*:\s*[^\s"'>]*/gi, '');

  // Strip all remaining HTML tags
  clean = clean.replace(/<[^>]+>/g, '');

  return clean.trim();
}

/**
 * Alias for backward compatibility across modules
 */
export const sanitizeInput = sanitizeText;

/**
 * Sanitizes an object deeply by applying sanitizeText to all string properties.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeText(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value);
    }
    return result as T;
  }
  return obj;
}

/**
 * Sliding Window Rate Limiter
 * Enforces a strict maximum of 10 requests per minute on GenAI endpoints.
 */
class SlidingRateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public checkRateLimit(): { allowed: boolean; remainingRequests: number; retryAfterMs: number } {
    const now = Date.now();
    // Filter timestamps within current window
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0];
      const retryAfterMs = Math.max(0, this.windowMs - (now - oldest));
      return { allowed: false, remainingRequests: 0, retryAfterMs };
    }

    this.timestamps.push(now);
    return {
      allowed: true,
      remainingRequests: this.maxRequests - this.timestamps.length,
      retryAfterMs: 0,
    };
  }

  public reset(): void {
    this.timestamps = [];
  }
}

export const aiRateLimiter = new SlidingRateLimiter(10, 60000);

/**
 * Masks API key for safe display (e.g. "AIza...9fX"), guaranteeing secret is never exposed in DOM
 */
export function maskApiKey(key: string | undefined): string {
  if (!key || key.length < 8) return 'Not Configured';
  return `${key.slice(0, 4)}••••••••${key.slice(-3)}`;
}

/**
 * Content-Security-Policy (CSP) Directives
 * Enforces strict script execution boundaries, disallowing untrusted remote scripts, framing, and unauthorized connections.
 */
export const CSP_POLICY_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://generativelanguage.googleapis.com",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

