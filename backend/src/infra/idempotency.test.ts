import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('./cache', () => ({
  redis: {
    set: vi.fn().mockRejectedValue(new Error('redis unavailable in unit test')),
  },
}))

describe('claimIdempotencyKey', () => {
  beforeEach(async () => {
    vi.resetModules()
    const { clearMemoryIdempotencyKeys } = await import('./idempotency')
    clearMemoryIdempotencyKeys()
  })

  it('allows first claim and rejects duplicate for same key (memory fallback)', async () => {
    const { claimIdempotencyKey } = await import('./idempotency')
    const first = await claimIdempotencyKey('msg-unit-1', 60)
    const second = await claimIdempotencyKey('msg-unit-1', 60)
    expect(first).toBe(true)
    expect(second).toBe(false)
  })

  it('allows different keys independently', async () => {
    const { claimIdempotencyKey } = await import('./idempotency')
    const a = await claimIdempotencyKey('msg-unit-a', 60)
    const b = await claimIdempotencyKey('msg-unit-b', 60)
    expect(a).toBe(true)
    expect(b).toBe(true)
  })
})
