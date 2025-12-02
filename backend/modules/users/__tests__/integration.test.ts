import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql'
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { sql } from 'drizzle-orm'
import { users } from '../schema/user.schema'
import { sessions, accounts, verifications } from '../schema/auth.schema'

describe('User Module Integration Tests', () => {
  let container: StartedMySqlContainer
  let pool: ReturnType<typeof mysql.createPool>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let db: any

  beforeAll(async () => {
    console.log('[Integration] Starting MySQL container...')
    container = await new MySqlContainer('mysql:8.0')
      .withDatabase('testdb')
      .withUsername('testuser')
      .withUserPassword('testpass')
      .withStartupTimeout(60000)
      .start()

    console.log(`[Integration] MySQL container started on port ${container.getPort()}`)

    pool = mysql.createPool({
      host: container.getHost(),
      port: container.getPort(),
      user: container.getUsername(),
      password: container.getUserPassword(),
      database: container.getDatabase(),
      connectionLimit: 5,
    })

    db = drizzle(pool)

    // Create tables matching production schema (Better-Auth stores password in account table)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        image TEXT,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `)

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS session (
        id VARCHAR(36) PRIMARY KEY,
        expires_at TIMESTAMP(3) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        ip_address VARCHAR(45),
        user_agent TEXT,
        user_id VARCHAR(36) NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `)

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS account (
        id VARCHAR(36) PRIMARY KEY,
        account_id VARCHAR(255) NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        access_token_expires_at TIMESTAMP(3),
        refresh_token_expires_at TIMESTAMP(3),
        scope TEXT,
        password VARCHAR(255),
        created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      )
    `)

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS verification (
        id VARCHAR(36) PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP(3) NOT NULL,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3),
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `)

    console.log('[Integration] Tables created')
  }, 120000)

  afterAll(async () => {
    console.log('[Integration] Cleaning up...')
    await pool.end()
    await container.stop()
    console.log('[Integration] MySQL container stopped')
  })

  beforeEach(async () => {
    // Truncate tables in correct order (respecting foreign keys)
    await db.delete(sessions)
    await db.delete(accounts)
    await db.delete(verifications)
    await db.delete(users)
  })

  describe('User Schema Operations', () => {
    it('should create a user successfully', async () => {
      const userId = crypto.randomUUID()
      const testUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
      }

      await db.insert(users).values(testUser)
      const [result] = await db
        .select()
        .from(users)
        .where(sql`id = ${userId}`)

      expect(result).toBeDefined()
      expect(result.id).toBe(userId)
      expect(result.name).toBe('Test User')
      expect(result.email).toBe('test@example.com')
      expect(result.emailVerified).toBe(false)
    })

    it('should enforce unique email constraint', async () => {
      const user1 = {
        id: crypto.randomUUID(),
        name: 'User 1',
        email: 'duplicate@example.com',
        emailVerified: false,
      }

      const user2 = {
        id: crypto.randomUUID(),
        name: 'User 2',
        email: 'duplicate@example.com',
        emailVerified: false,
      }

      await db.insert(users).values(user1)

      await expect(db.insert(users).values(user2)).rejects.toThrow()
    })

    it('should find user by email', async () => {
      const userId = crypto.randomUUID()
      const testUser = {
        id: userId,
        name: 'Findable User',
        email: 'findme@example.com',
        emailVerified: false,
      }

      await db.insert(users).values(testUser)
      const [result] = await db
        .select()
        .from(users)
        .where(sql`email = ${'findme@example.com'}`)

      expect(result).toBeDefined()
      expect(result.id).toBe(userId)
    })

    it('should return empty for non-existent email', async () => {
      const result = await db
        .select()
        .from(users)
        .where(sql`email = ${'nonexistent@example.com'}`)

      expect(result).toHaveLength(0)
    })
  })

  describe('Session Schema Operations', () => {
    it('should create a session for a user', async () => {
      const userId = crypto.randomUUID()
      const sessionId = crypto.randomUUID()

      await db.insert(users).values({
        id: userId,
        name: 'Session User',
        email: 'session@example.com',
        emailVerified: false,
      })

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      await db.insert(sessions).values({
        id: sessionId,
        expiresAt,
        token: 'test-session-token-123',
        userId,
      })

      const [result] = await db
        .select()
        .from(sessions)
        .where(sql`id = ${sessionId}`)

      expect(result).toBeDefined()
      expect(result.userId).toBe(userId)
      expect(result.token).toBe('test-session-token-123')
    })

    it('should cascade delete sessions when user is deleted', async () => {
      const userId = crypto.randomUUID()
      const sessionId = crypto.randomUUID()

      await db.insert(users).values({
        id: userId,
        name: 'Cascade User',
        email: 'cascade@example.com',
        emailVerified: false,
      })

      await db.insert(sessions).values({
        id: sessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        token: 'cascade-session-token',
        userId,
      })

      // Delete user
      await db.delete(users).where(sql`id = ${userId}`)

      // Session should be deleted too
      const sessionsResult = await db
        .select()
        .from(sessions)
        .where(sql`id = ${sessionId}`)
      expect(sessionsResult).toHaveLength(0)
    })
  })

  describe('Account Schema Operations', () => {
    it('should create an account linked to user', async () => {
      const userId = crypto.randomUUID()
      const accountId = crypto.randomUUID()

      await db.insert(users).values({
        id: userId,
        name: 'Account User',
        email: 'account@example.com',
        emailVerified: false,
      })

      await db.insert(accounts).values({
        id: accountId,
        accountId: 'credential-account-id',
        providerId: 'credential',
        userId,
        password: '$argon2id$v=19$m=65536,t=3,p=4$accountpasshash',
      })

      const [result] = await db
        .select()
        .from(accounts)
        .where(sql`id = ${accountId}`)

      expect(result).toBeDefined()
      expect(result.userId).toBe(userId)
      expect(result.providerId).toBe('credential')
    })

    it('should store password hash in account table (Better-Auth pattern)', async () => {
      const userId = crypto.randomUUID()
      const accountId = crypto.randomUUID()
      const hashedPassword = '$argon2id$v=19$m=65536,t=3,p=4$somesalt$hashedvalue'

      await db.insert(users).values({
        id: userId,
        name: 'Secure User',
        email: 'secure@example.com',
        emailVerified: false,
      })

      await db.insert(accounts).values({
        id: accountId,
        accountId: 'credential-account-id',
        providerId: 'credential',
        userId,
        password: hashedPassword,
      })

      const [result] = await db
        .select()
        .from(accounts)
        .where(sql`id = ${accountId}`)

      // Password should be stored as hash in account table
      expect(result.password).toBe(hashedPassword)
      expect(result.password).toMatch(/^\$argon2/)
      expect(result.password).not.toBe('plaintext123')
    })
  })
})
