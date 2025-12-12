// modules/pubsub/receiver/routes/push.routes.test.ts
import { Elysia } from 'elysia'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HandlerService } from '../services/handler.service'
import { createPushMessage, createInvalidBase64Message } from '../test/push-message.factory'
import { pushRoutes } from './push.routes'

describe('Push Routes', () => {
  function createApp() {
    return new Elysia().use(pushRoutes)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return 200 and call handler for registered action', async () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true, message: 'processed' })
    vi.spyOn(HandlerService, 'findHandler').mockReturnValue({
      action: 'test-action',
      handler: mockHandler,
      description: 'Test handler',
    })

    const response = await createApp().handle(
      new Request('http://localhost/pubsub/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPushMessage({ action: 'test-action', body: { foo: 'bar' } })),
      })
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.handled).toBe(true)
    expect(mockHandler).toHaveBeenCalledWith(
      { foo: 'bar' },
      expect.objectContaining({ messageId: expect.any(String) })
    )
  })

  it('should return 200 with handled:false for unknown action', async () => {
    vi.spyOn(HandlerService, 'findHandler').mockReturnValue(undefined)

    const response = await createApp().handle(
      new Request('http://localhost/pubsub/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPushMessage({ action: 'unknown-action', body: {} })),
      })
    )

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.handled).toBe(false)
  })

  it('should return 400 for invalid payload', async () => {
    const response = await createApp().handle(
      new Request('http://localhost/pubsub/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createInvalidBase64Message()),
      })
    )

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error.code).toBe('INVALID_JSON')
  })

  it('should return 500 if handler throws', async () => {
    const mockHandler = vi.fn().mockRejectedValue(new Error('Handler failed'))
    vi.spyOn(HandlerService, 'findHandler').mockReturnValue({
      action: 'failing-action',
      handler: mockHandler,
      description: 'Failing handler',
    })

    const response = await createApp().handle(
      new Request('http://localhost/pubsub/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPushMessage({ action: 'failing-action', body: {} })),
      })
    )

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.error.code).toBe('HANDLER_ERROR')
  })
})
