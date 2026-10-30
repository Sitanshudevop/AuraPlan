/**
 * Sliding Window Rate Limiter
 * Enforces a strict maximum of requests within a defined time window.
 */
export class SlidingRateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  public checkRateLimit(): { allowed: boolean; remainingRequests: number; retryAfterMs: number } {
    const now = Date.now();
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
