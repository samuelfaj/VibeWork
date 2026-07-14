import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from './logger'

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('writes structured JSON info logs with requestId', () => {
    logger.info('request completed', { requestId: 'req-1', action: 'GET /users/me' })

    expect(logSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0]))
    expect(payload.level).toBe('info')
    expect(payload.message).toBe('request completed')
    expect(payload.requestId).toBe('req-1')
    expect(payload.action).toBe('GET /users/me')
    expect(typeof payload.ts).toBe('string')
  })

  it('writes error logs to console.error', () => {
    logger.error('boom', { requestId: 'req-2' })

    expect(errorSpy).toHaveBeenCalledTimes(1)
    const payload = JSON.parse(String(errorSpy.mock.calls[0]?.[0]))
    expect(payload.level).toBe('error')
    expect(payload.requestId).toBe('req-2')
  })
})
