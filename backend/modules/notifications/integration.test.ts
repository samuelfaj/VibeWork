import { MySqlContainer, type StartedMySqlContainer } from '@testcontainers/mysql'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

let testDb: any = null
let pool: ReturnType<typeof mysql.createPool> | null = null
let container: StartedMySqlContainer

vi.mock('../../src/infra/database/mysql', () => ({
  get db() {
    if (!testDb) throw new Error('test db not ready')
    return testDb
  },
  checkMySqlConnection: async () => true,
  closeMySqlConnection: async () => undefined,
}))

describe('Notification Module Integration Tests', () => {
  beforeAll(async () => {
    container = await new MySqlContainer('mysql:8.0')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withUserPassword('testpass')
      .withStartupTimeout(120_000)
      .start()

    pool = mysql.createPool({
      host: container.getHost(),
      port: container.getPort(),
      user: container.getUsername(),
      password: container.getUserPassword(),
      database: container.getDatabase(),
      connectionLimit: 5,
    })
    testDb = drizzle(pool)

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS notification (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type VARCHAR(16) NOT NULL,
        message TEXT NOT NULL,
        \`read\` BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        INDEX notification_user_created_idx (user_id, created_at)
      )
    `)
  }, 180_000)

  afterAll(async () => {
    await pool?.end()
    await container?.stop()
  })

  beforeEach(async () => {
    await pool!.execute('DELETE FROM notification')
  })

  it('creates, lists, and marks as read', async () => {
    const { NotificationService } = await import('./services/notification.service')

    const created = await NotificationService.create({
      userId: 'user-1',
      type: 'in-app',
      message: 'hello',
    })
    expect(created.id).toBeTruthy()
    expect(created.message).toBe('hello')
    expect(created.read).toBe(false)

    const list = await NotificationService.getUserNotifications('user-1')
    expect(list).toHaveLength(1)

    const read = await NotificationService.markAsRead(created.id, 'user-1')
    expect(read?.read).toBe(true)
  })
})
