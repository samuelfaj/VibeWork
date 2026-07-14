import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./cache', () => ({
  redis: {
    incr: vi.fn().mockRejectedValue(new Error('redis unavailable in unit test')),
    expire: vi.fn(),
    ttl: vi.fn(),
  },
}))

describe('checkRateLimit', () => {
  beforeEach(async () => {
    vi.resetModules()
    const { clearMemoryRateLimits } = await import('./rate-limit')
    clearMemoryRateLimits()
  })

  it('allows requests under the limit and blocks when exceeded (memory fallback)', async () => {
    const { checkRateLimit } = await import('./rate-limit')
    const key = `auth-test-${Date.now()}`
    const first = await checkRateLimit(key, 2, 60)
    const second = await checkRateLimit(key, 2, 60)
    const third = await checkRateLimit(key, 2, 60)

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(true)
    expect(third.allowed).toBe(false)
  })
})
