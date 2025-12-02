import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPing = vi.fn().mockResolvedValue('PONG')
const mockQuit = vi.fn().mockResolvedValue(undefined)
const mockOn = vi.fn()

vi.mock('ioredis', () => {
  return {
    default: class MockRedis {
      ping = mockPing
      quit = mockQuit
      on = mockOn
    },
  }
})

describe('Redis Cache Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env.REDIS_URL = 'redis://localhost:6379'
  })

  it('should export redis instance', async () => {
    const { redis } = await import('../cache')
    expect(redis).toBeDefined()
  })

  it('should check connection and return true on PONG', async () => {
    const { checkRedisConnection } = await import('../cache')
    const result = await checkRedisConnection()
    expect(result).toBe(true)
  })

  it('should close connection', async () => {
    const { closeRedisConnection } = await import('../cache')
    await expect(closeRedisConnection()).resolves.not.toThrow()
  })
})
