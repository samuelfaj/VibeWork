import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('mysql2/promise', () => ({
  default: {
    createPool: vi.fn(() => ({
      getConnection: vi.fn().mockResolvedValue({
        ping: vi.fn().mockResolvedValue(undefined),
        release: vi.fn(),
      }),
      end: vi.fn().mockResolvedValue(undefined),
    })),
  },
}))

vi.mock('drizzle-orm/mysql2', () => ({
  drizzle: vi.fn(() => ({})),
}))

describe('MySQL Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.MYSQL_HOST = 'localhost'
    process.env.MYSQL_USER = 'test'
    process.env.MYSQL_PASSWORD = 'test'
    process.env.MYSQL_DATABASE = 'test'
  })

  it('should export db instance', async () => {
    const { db } = await import('./mysql')
    expect(db).toBeDefined()
  })

  it('should check connection and return true on success', async () => {
    const { checkMySqlConnection } = await import('./mysql')
    const result = await checkMySqlConnection()
    expect(result).toBe(true)
  })

  it('should close connection', async () => {
    const { closeMySqlConnection } = await import('./mysql')
    await expect(closeMySqlConnection()).resolves.not.toThrow()
  })
})
