interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Use a secret salt so attackers can't easily bypass rate limits by IP manipulation
const RATE_LIMIT_SECRET = process.env.RATE_LIMIT_SECRET || process.env.AUTH_SECRET;

function hashKey(key: string): string {
  if (!RATE_LIMIT_SECRET) return key;
  let hash = 0;
  const combined = key + RATE_LIMIT_SECRET;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  req: Request,
  options: { windowMs?: number; maxRequests?: number } = {}
): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000; // 1 minute
  const maxRequests = options.maxRequests ?? 30;

  const key = hashKey(getClientIP(req));
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + windowMs };
    store.set(key, newEntry);
    return { allowed: true, limit: maxRequests, remaining: maxRequests - 1, resetAt: newEntry.resetAt };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, limit: maxRequests, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, limit: maxRequests, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 300_000);
