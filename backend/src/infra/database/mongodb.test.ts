import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockConnection = {
  readyState: 1,
  db: {
    admin: vi.fn(() => ({
      ping: vi.fn().mockResolvedValue({ ok: 1 }),
    })),
  },
  close: vi.fn().mockResolvedValue(undefined),
}

vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn().mockResolvedValue(undefined),
    connection: mockConnection,
  },
}))

describe('MongoDB Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
  })

  it('should connect to MongoDB', async () => {
    const { connectMongo } = await import('./mongodb')
    await expect(connectMongo()).resolves.not.toThrow()
  })

  it('should check connection and return true when connected', async () => {
    const { checkMongoConnection } = await import('./mongodb')
    const result = await checkMongoConnection()
    expect(result).toBe(true)
  })

  it('should close connection', async () => {
    const { closeMongoConnection } = await import('./mongodb')
    await expect(closeMongoConnection()).resolves.not.toThrow()
  })
})
