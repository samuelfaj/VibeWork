import { Elysia } from 'elysia'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../src/infra', () => ({
  checkMySqlConnection: vi.fn(),
}))

import { checkMySqlConnection } from '../../../src/infra'
import { healthRoutes } from './health.routes'

const mockMySql = vi.mocked(checkMySqlConnection)

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
      expect(body.status).toBe('ok')
    })
  })

  describe('GET /readyz', () => {
    it('should return 200 when MySQL is ok', async () => {
      mockMySql.mockResolvedValue(true)
      const response = await createApp().handle(new Request('http://localhost/readyz'))
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.status).toBe('ok')
      expect(body.checks.mysql.status).toBe('ok')
    })

    it('should return 503 when MySQL fails', async () => {
      mockMySql.mockResolvedValue(false)
      const response = await createApp().handle(new Request('http://localhost/readyz'))
      expect(response.status).toBe(503)
      const body = await response.json()
      expect(body.status).toBe('fail')
      expect(body.checks.mysql.status).toBe('fail')
    })

    it('should handle timeout errors', async () => {
      mockMySql.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 10_000))
      )
      const response = await createApp().handle(new Request('http://localhost/readyz'))
      expect(response.status).toBe(503)
    }, 15_000)
  })
})
