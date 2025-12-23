import { Elysia } from 'elysia'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/infra', () => ({
  checkMySqlConnection: vi.fn(),
  checkMongoConnection: vi.fn(),
  checkRedisConnection: vi.fn(),
}))

import {
  checkMySqlConnection,
  checkMongoConnection,
  checkRedisConnection,
} from '../../../src/infra'
import { healthRoutes } from './health.routes'

const mockMySql = vi.mocked(checkMySqlConnection)
const mockMongo = vi.mocked(checkMongoConnection)
const mockRedis = vi.mocked(checkRedisConnection)

describe('Health Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createApp() {
    return new Elysia().use(healthRoutes)
  }

  describe('GET /healthz', () => {
    it('should return 200 with status ok', async () => {
      const response = await createApp().handle(new Request('http://localhost/healthz'))
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body).toEqual({ status: 'ok' })
    })
  })

  describe('GET /readyz', () => {
    it('should return 200 when all checks pass', async () => {
      mockMySql.mockResolvedValue(true)
      mockMongo.mockResolvedValue(true)
      mockRedis.mockResolvedValue(true)

      const response = await createApp().handle(new Request('http://localhost/readyz'))
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.status).toBe('ok')
      expect(body.checks.mysql.status).toBe('ok')
      expect(body.checks.mongodb.status).toBe('ok')
      expect(body.checks.redis.status).toBe('ok')
    })

    it('should return 503 when MySQL fails', async () => {
      mockMySql.mockResolvedValue(false)
      mockMongo.mockResolvedValue(true)
      mockRedis.mockResolvedValue(true)

      const response = await createApp().handle(new Request('http://localhost/readyz'))
      expect(response.status).toBe(503)
      const body = await response.json()
      expect(body.status).toBe('fail')
      expect(body.checks.mysql.status).toBe('fail')
    })

    it('should return 503 when MongoDB fails', async () => {
      mockMySql.mockResolvedValue(true)
      mockMongo.mockResolvedValue(false)
      mockRedis.mockResolvedValue(true)

      const response = await createApp().handle(new Request('http://localhost/readyz'))
      expect(response.status).toBe(503)
      const body = await response.json()
      expect(body.status).toBe('fail')
      expect(body.checks.mongodb.status).toBe('fail')
    })

    it('should return 503 when Redis fails', async () => {
      mockMySql.mockResolvedValue(true)
      mockMongo.mockResolvedValue(true)
      mockRedis.mockResolvedValue(false)

      const response = await createApp().handle(new Request('http://localhost/readyz'))
      expect(response.status).toBe(503)
      const body = await response.json()
      expect(body.status).toBe('fail')
      expect(body.checks.redis.status).toBe('fail')
    })

    it('should handle timeout errors', async () => {
      mockMySql.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 10_000))
      )
      mockMongo.mockResolvedValue(true)
      mockRedis.mockResolvedValue(true)

      const response = await createApp().handle(new Request('http://localhost/readyz'))
      expect(response.status).toBe(503)
      const body = await response.json()
      expect(body.checks.mysql.status).toBe('fail')
    }, 10_000)

    it('should run checks in parallel', async () => {
      const callOrder: string[] = []
      mockMySql.mockImplementation(async () => {
        callOrder.push('mysql-start')
        await new Promise((r) => setTimeout(r, 50))
        callOrder.push('mysql-end')
        return true
      })
      mockMongo.mockImplementation(async () => {
        callOrder.push('mongo-start')
        await new Promise((r) => setTimeout(r, 50))
        callOrder.push('mongo-end')
        return true
      })
      mockRedis.mockImplementation(async () => {
        callOrder.push('redis-start')
        await new Promise((r) => setTimeout(r, 50))
        callOrder.push('redis-end')
        return true
      })

      await createApp().handle(new Request('http://localhost/readyz'))

      // All starts should happen before any ends (parallel execution)
      const startIndices = callOrder
        .map((c, i) => (c.endsWith('-start') ? i : -1))
        .filter((i) => i >= 0)
      const endIndices = callOrder
        .map((c, i) => (c.endsWith('-end') ? i : -1))
        .filter((i) => i >= 0)

      expect(Math.max(...startIndices)).toBeLessThan(Math.min(...endIndices))
    })

    it('should include latency in check results', async () => {
      mockMySql.mockResolvedValue(true)
      mockMongo.mockResolvedValue(true)
      mockRedis.mockResolvedValue(true)

      const response = await createApp().handle(new Request('http://localhost/readyz'))
      const body = await response.json()

      expect(typeof body.checks.mysql.latency).toBe('number')
      expect(typeof body.checks.mongodb.latency).toBe('number')
      expect(typeof body.checks.redis.latency).toBe('number')
    })
  })
})
