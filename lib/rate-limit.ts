/**
 * Rate limiting utilities for API protection
 *
 * Uses in-memory storage (production should use Redis or similar)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpires?: number;
}

// In-memory rate limit storage
// Note: In production, use Redis or a distributed cache
const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries periodically (every 5 minutes)
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      // Remove entries that are expired and not blocked
      if (now > entry.resetTime && !entry.blocked) {
        rateLimitMap.delete(key);
      }
      // Remove expired blocks
      if (entry.blocked && entry.blockExpires && now > entry.blockExpires) {
        rateLimitMap.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Block duration in milliseconds after exceeding limit */
  blockDurationMs?: number;
  /** Identifier prefix for different rate limit types */
  prefix?: string;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in window */
  remaining: number;
  /** Time until window resets (ms) */
  resetIn: number;
  /** Whether the IP is blocked */
  blocked: boolean;
  /** Time until block expires (ms) */
  blockExpiresIn?: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000, // 5 minutes block after exceeding
  prefix: 'default',
};

/**
 * Check and update rate limit for an identifier (usually IP)
 */
export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): RateLimitResult {
  const now = Date.now();
  const { maxRequests, windowMs, blockDurationMs, prefix } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const key = `${prefix}:${identifier}`;
  let entry = rateLimitMap.get(key);

  // Check if blocked
  if (entry?.blocked) {
    if (entry.blockExpires && now < entry.blockExpires) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: entry.resetTime - now,
        blocked: true,
        blockExpiresIn: entry.blockExpires - now,
      };
    }
    // Block expired, reset
    entry = undefined;
  }

  // Create new entry or reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + windowMs,
      blocked: false,
    };
    rateLimitMap.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetIn: windowMs,
      blocked: false,
    };
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    // Block the identifier
    if (blockDurationMs) {
      entry.blocked = true;
      entry.blockExpires = now + blockDurationMs;
      rateLimitMap.set(key, entry);

      return {
        allowed: false,
        remaining: 0,
        resetIn: entry.resetTime - now,
        blocked: true,
        blockExpiresIn: blockDurationMs,
      };
    }

    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetTime - now,
      blocked: false,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitMap.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetTime - now,
    blocked: false,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  const headers: HeadersInit = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };

  if (result.blocked && result.blockExpiresIn) {
    headers['Retry-After'] = Math.ceil(result.blockExpiresIn / 1000).toString();
  }

  return headers;
}

/**
 * Comment-specific rate limit configuration
 */
export const COMMENT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 3, // 3 comments per minute
  windowMs: 60 * 1000, // 1 minute window
  blockDurationMs: 10 * 60 * 1000, // 10 minute block
  prefix: 'comment',
};

/**
 * Check rate limit specifically for comments
 */
export function checkCommentRateLimit(ip: string): RateLimitResult {
  return checkRateLimit(ip, COMMENT_RATE_LIMIT);
}
