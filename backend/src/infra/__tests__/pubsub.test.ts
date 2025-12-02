import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetTopics = vi.fn().mockResolvedValue([[]])
const mockClose = vi.fn().mockResolvedValue(undefined)

vi.mock('@google-cloud/pubsub', () => {
  return {
    PubSub: class MockPubSub {
      getTopics = mockGetTopics
      close = mockClose
    },
  }
})

describe('PubSub Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env.PUBSUB_PROJECT_ID = 'test-project'
  })

  it('should export pubsub instance', async () => {
    const { pubsub } = await import('../pubsub')
    expect(pubsub).toBeDefined()
  })

  it('should check connection and return true on success', async () => {
    const { checkPubSubConnection } = await import('../pubsub')
    const result = await checkPubSubConnection()
    expect(result).toBe(true)
  })

  it('should use emulator when PUBSUB_EMULATOR_HOST is set', async () => {
    process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085'
    const { pubsub } = await import('../pubsub')
    expect(pubsub).toBeDefined()
  })

  it('should close connection', async () => {
    const { closePubSubConnection } = await import('../pubsub')
    await expect(closePubSubConnection()).resolves.not.toThrow()
  })
})
