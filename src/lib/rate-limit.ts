// Simple in-memory rate limiter
// For production, consider using Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig = { windowMs: 60 * 1000, maxRequests: 100 }
): RateLimitResult {
  const now = Date.now()
  const { windowMs, maxRequests } = config

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupExpiredEntries(now)
  }

  const existing = rateLimitStore.get(identifier)

  if (!existing || now > existing.resetTime) {
    // First request or window expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitStore.set(identifier, newEntry)

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime
    }
  }

  // Within existing window
  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existing.resetTime,
      retryAfter: Math.ceil((existing.resetTime - now) / 1000)
    }
  }

  // Increment count
  existing.count++
  
  return {
    allowed: true,
    remaining: maxRequests - existing.count,
    resetTime: existing.resetTime
  }
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Standard API endpoints
  standard: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 requests per minute
  
  // More restrictive for write operations
  write: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 requests per minute
  
  // Very restrictive for admin operations
  admin: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
} as const
