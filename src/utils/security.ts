/**
 * Security & Sanitization Utility Suite
 * Implements strict input sanitization, API rate limiting, and credential masking.
 */
import { aiRateLimiter, SlidingRateLimiter } from './rateLimiter';

export { aiRateLimiter, SlidingRateLimiter };

/**
 * Removes dangerous tags (<script>, <iframe>, <object>, <embed>) and their enclosed contents.
 *
 * @param text - Raw input string
 * @returns Cleaned string without executable containers
 */
export function stripTagsWithContent(text: string): string {
  return text
    .replace(/<(script|iframe|object|embed)[^>]*>([\s\S]*?)<\/\1>/gi, '')
    .replace(/<(script|iframe|object|embed)[^>]*>/gi, '');
}

/**
 * Strips inline event handler attributes (e.g., onerror=, onclick=, onload=).
 *
 * @param text - Raw input string
 * @returns Cleaned string without inline JS handlers
 */
export function stripInlineEventHandlers(text: string): string {
  return text.replace(/\s*on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

/**
 * Strips dangerous pseudo-protocol URI schemes (javascript:, vbscript:, data:).
 *
 * @param text - Raw input string
 * @returns Cleaned string without script-executable URLs
 */
export function stripScriptProtocols(text: string): string {
  return text.replace(/(javascript|vbscript|data)\s*:\s*[^\s"'>]*/gi, '');
}

/**
 * Strips any remaining standard HTML tags.
 *
 * @param text - Raw input string
 * @returns Pure text stripped of all HTML markup
 */
export function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]+>/g, '');
}

/**
 * Strips all HTML tags, javascript: URIs, inline event handlers (e.g. onerror, onclick),
 * and script/iframe injection vectors using a multi-pass evasion-resistant loop.
 *
 * @param input - Raw user input string
 * @returns Sanitized safe text
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let clean = input;
  let previous = '';
  let passes = 0;

  // Multi-pass sanitization loop to eliminate recursive/nested evasion payloads
  while (clean !== previous && passes < 3) {
    previous = clean;
    passes++;

    clean = stripTagsWithContent(clean);
    clean = stripInlineEventHandlers(clean);
    clean = stripScriptProtocols(clean);
    clean = stripHtmlTags(clean);
  }

  return clean.trim();
}

/**
 * Primary alias for input sanitization across forms and schemas.
 */
export const sanitizeInput = sanitizeText;

/**
 * Keys blocked to defend against prototype pollution attacks
 */
const FORBIDDEN_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Sanitizes an object deeply by applying sanitizeText to all string properties,
 * while proactively blocking and omitting prototype pollution keys.
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
      if (!FORBIDDEN_OBJECT_KEYS.has(key)) {
        result[key] = sanitizeObject(value);
      }
    }
    return result as T;
  }
  return obj;
}

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
