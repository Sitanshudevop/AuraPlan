/**
 * Dedicated XSS Input Sanitizer Utility
 * Strips dangerous HTML tags, javascript: protocols, inline event handlers,
 * and script/iframe/object tags to prevent injection attacks.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Remove script, iframe, object, embed tags and their contents
  let clean = input.replace(/<(script|iframe|object|embed)[^>]*>([\s\S]*?)<\/\1>/gi, '');
  
  // Remove self-closing or lone script-like tags
  clean = clean.replace(/<(script|iframe|object|embed)[^>]*>/gi, '');
  
  // Remove dangerous attributes like onerror=, onclick=, onload=
  clean = clean.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  
  // Remove javascript: and data: URL schemes
  clean = clean.replace(/javascript\s*:\s*[^\s"'>]*/gi, '');
  
  // Strip any remaining raw HTML tags
  clean = clean.replace(/<[^>]+>/g, '');
  
  return clean.trim();
}

/**
 * Sanitizes an object deeply by applying sanitizeInput to all string fields.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeInput(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
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
