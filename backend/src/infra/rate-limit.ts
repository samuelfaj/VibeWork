import { redis } from './cache'
import { logger } from './logger'

const memoryCounters = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now()
  const entry = memoryCounters.get(key)
  if (!entry || entry.resetAt <= now) {
    memoryCounters.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: windowSeconds }
  }
  entry.count += 1
  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
  if (entry.count > limit) {
    return { allowed: false, remaining: 0, retryAfterSeconds }
  }
  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSeconds,
  }
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const redisKey = `ratelimit:${key}`
  try {
    const count = await redis.incr(redisKey)
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds)
    }
    const ttl = await redis.ttl(redisKey)
    const retryAfterSeconds = ttl > 0 ? ttl : windowSeconds
    if (count > limit) {
      return { allowed: false, remaining: 0, retryAfterSeconds }
    }
    return {
      allowed: true,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds,
    }
  } catch (error) {
    logger.warn('rate limit redis unavailable, using memory fallback', {
      action: 'checkRateLimit',
      error: error instanceof Error ? error.message : String(error),
    })
    return memoryLimit(key, limit, windowSeconds)
  }
}

export function clearMemoryRateLimits(): void {
  memoryCounters.clear()
}
