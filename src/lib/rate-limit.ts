// A simple fixed-window rate limiter, kept in memory.
//
// LIMITATION: this only works correctly on a single running server
// process. If this app is ever deployed across multiple instances
// (common on serverless platforms), each instance has its own separate
// counter — someone could get more requests than intended by hitting
// different instances. If that becomes a real concern, replace this
// with a shared store (e.g. Upstash Redis) instead of in-memory Maps.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}

// Best-effort client identifier from request headers (works behind most
// reverse proxies/hosts that set x-forwarded-for; falls back to a shared
// bucket if nothing is available, which is still better than nothing).
export function clientKeyFromHeaders(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
