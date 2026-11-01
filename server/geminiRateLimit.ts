export const RATE_LIMIT_WINDOW_MS = 60000;
export const MAX_REQUESTS_PER_WINDOW = 30;
export const MAX_RATE_LIMIT_ENTRIES = 5000;

interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function pruneStaleEntries(now: number): void {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  for (const [ip, entry] of rateLimitStore.entries()) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(ip);
    }
  }
}

export function checkSlidingRateLimit(clientIp: string, now = Date.now()): boolean {
  pruneStaleEntries(now);

  const entry = rateLimitStore.get(clientIp);
  if (!entry) {
    if (rateLimitStore.size >= MAX_RATE_LIMIT_ENTRIES) {
      const firstKey = rateLimitStore.keys().next().value;
      if (firstKey) rateLimitStore.delete(firstKey);
    }
    rateLimitStore.set(clientIp, { timestamps: [now] });
    return true;
  }

  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  entry.timestamps.push(now);
  return true;
}

export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}

export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

export function extractClientIp(req: Request): string {
  const realIp = req.headers.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  const vercelForwarded = req.headers.get('x-vercel-forwarded-for');
  if (vercelForwarded && vercelForwarded.trim()) {
    return vercelForwarded.split(',')[0].trim();
  }

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return '127.0.0.1';
}
