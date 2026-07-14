import { redis } from './cache'
import { logger } from './logger'

const DEFAULT_TTL_SECONDS = 86_400
const memoryKeys = new Map<string, number>()

function memoryClaim(key: string, ttlSeconds: number): boolean {
  const now = Date.now()
  for (const [k, expiresAt] of memoryKeys) {
    if (expiresAt <= now) memoryKeys.delete(k)
  }
  const existing = memoryKeys.get(key)
  if (existing && existing > now) return false
  memoryKeys.set(key, now + ttlSeconds * 1000)
  return true
}

/**
 * Claims an idempotency key once. Returns true if this process should handle the work.
 * Uses Redis SET NX when available; falls back to process-local memory for tests/dev.
 */
export async function claimIdempotencyKey(
  key: string,
  ttlSeconds = DEFAULT_TTL_SECONDS
): Promise<boolean> {
  try {
    const result = await redis.set(`idempotency:${key}`, '1', 'EX', ttlSeconds, 'NX')
    return result === 'OK'
  } catch (error) {
    logger.warn('idempotency redis unavailable, using memory fallback', {
      action: 'claimIdempotencyKey',
      error: error instanceof Error ? error.message : String(error),
    })
    return memoryClaim(key, ttlSeconds)
  }
}

/** Test helper */
export function clearMemoryIdempotencyKeys(): void {
  memoryKeys.clear()
}
