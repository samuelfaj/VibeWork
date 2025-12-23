// modules/pubsub/receiver/controllers/push.controller.test.ts
import * as i18nModule from '@i18n'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { PubSubPushMessage, HandlerMetadata } from '@modules/pubsub/core/pubsub.types'
import { HandlerService } from '../services/handler.service'
import { PayloadDecoderService, PayloadDecodingError } from '../services/payload-decoder.service'
import { PushController } from './push.controller'

describe('PushController', () => {
  const mockPushMessage: PubSubPushMessage = {
    message: {
      data: Buffer.from(JSON.stringify({ action: 'test-action', body: { foo: 'bar' } })).toString(
        'base64'
      ),
      messageId: 'msg-123',
      publishTime: '2025-01-01T00:00:00.000Z',
    },
    subscription: 'projects/test/subscriptions/test-sub',
  }

  const mockMetadata: HandlerMetadata = {
    messageId: 'msg-123',
    publishTime: new Date('2025-01-01T00:00:00.000Z'),
    subscription: 'projects/test/subscriptions/test-sub',
  }

  const createMockContext = (body: PubSubPushMessage) => ({
    body,
    set: { status: 200 },
    request: {
      headers: {
        get: vi.fn().mockReturnValue('en'),
      },
    },
  })

  beforeEach(() => {
    vi.spyOn(i18nModule, 'getLanguageFromHeader').mockReturnValue('en')
    vi.spyOn(i18nModule, 'getTranslation').mockImplementation((key: string) => `translated:${key}`)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handlePush', () => {
    it('should successfully handle message with registered handler', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ success: true, message: 'processed' })
      vi.spyOn(PayloadDecoderService, 'decode').mockReturnValue({
        payload: { action: 'test-action', body: { foo: 'bar' } },
        metadata: mockMetadata,
      })
      vi.spyOn(HandlerService, 'findHandler').mockReturnValue({
        action: 'test-action',
        handler: mockHandler,
        description: 'Test handler',
      })

      const context = createMockContext(mockPushMessage)
      const result = await PushController.handlePush(context as never)

      expect(result).toEqual({
        success: true,
        handled: true,
        result: { success: true, message: 'processed' },
      })
      expect(mockHandler).toHaveBeenCalledWith({ foo: 'bar' }, mockMetadata)
    })

    it('should return handled:false for unknown action', async () => {
      vi.spyOn(PayloadDecoderService, 'decode').mockReturnValue({
        payload: { action: 'unknown-action', body: {} },
        metadata: mockMetadata,
      })
      vi.spyOn(HandlerService, 'findHandler').mockReturnValue(undefined)

      const context = createMockContext(mockPushMessage)
      const result = await PushController.handlePush(context as never)

      expect(result).toEqual({ success: true, handled: false })
    })

    it('should return 400 for PayloadDecodingError', async () => {
      vi.spyOn(PayloadDecoderService, 'decode').mockImplementation(() => {
        throw new PayloadDecodingError('Invalid JSON', 'INVALID_JSON')
      })

      const context = createMockContext(mockPushMessage)
      const result = await PushController.handlePush(context as never)

      expect(context.set.status).toBe(400)
      expect(result).toEqual({
        error: {
          code: 'INVALID_JSON',
          message: 'translated:errors.pubsub.INVALID_JSON',
        },
      })
    })

    it('should return 400 for INVALID_BASE64 error', async () => {
      vi.spyOn(PayloadDecoderService, 'decode').mockImplementation(() => {
        throw new PayloadDecodingError('Invalid base64', 'INVALID_BASE64')
      })

      const context = createMockContext(mockPushMessage)
      const result = await PushController.handlePush(context as never)

      expect(context.set.status).toBe(400)
      expect(result).toEqual({
        error: {
          code: 'INVALID_BASE64',
          message: 'translated:errors.pubsub.INVALID_BASE64',
        },
      })
    })

    it('should return 400 for MISSING_ACTION error', async () => {
      vi.spyOn(PayloadDecoderService, 'decode').mockImplementation(() => {
        throw new PayloadDecodingError('Missing action', 'MISSING_ACTION')
      })

      const context = createMockContext(mockPushMessage)
      const result = await PushController.handlePush(context as never)

      expect(context.set.status).toBe(400)
      expect(result).toEqual({
        error: {
          code: 'MISSING_ACTION',
          message: 'translated:errors.pubsub.MISSING_ACTION',
        },
      })
    })

    it('should return 500 when handler throws error', async () => {
      const mockHandler = vi.fn().mockRejectedValue(new Error('Handler failed'))
      vi.spyOn(PayloadDecoderService, 'decode').mockReturnValue({
        payload: { action: 'test-action', body: {} },
        metadata: mockMetadata,
      })
      vi.spyOn(HandlerService, 'findHandler').mockReturnValue({
        action: 'test-action',
        handler: mockHandler,
        description: 'Test handler',
      })

      const context = createMockContext(mockPushMessage)
      const result = await PushController.handlePush(context as never)

      expect(context.set.status).toBe(500)
      expect(result).toEqual({
        error: {
          code: 'HANDLER_ERROR',
          message: 'translated:errors.pubsub.handlerFailed',
        },
      })
    })

    it('should rethrow non-PayloadDecodingError errors', async () => {
      vi.spyOn(PayloadDecoderService, 'decode').mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const context = createMockContext(mockPushMessage)

      await expect(PushController.handlePush(context as never)).rejects.toThrow('Unexpected error')
    })

    it('should call PayloadDecoderService.decode with body', async () => {
      const decodeSpy = vi.spyOn(PayloadDecoderService, 'decode').mockReturnValue({
        payload: { action: 'test-action', body: {} },
        metadata: mockMetadata,
      })
      vi.spyOn(HandlerService, 'findHandler').mockReturnValue(undefined)

      const context = createMockContext(mockPushMessage)
      await PushController.handlePush(context as never)

      expect(decodeSpy).toHaveBeenCalledWith(mockPushMessage)
    })

    it('should call HandlerService.findHandler with action', async () => {
      vi.spyOn(PayloadDecoderService, 'decode').mockReturnValue({
        payload: { action: 'my-action', body: {} },
        metadata: mockMetadata,
      })
      const findHandlerSpy = vi.spyOn(HandlerService, 'findHandler').mockReturnValue(undefined)

      const context = createMockContext(mockPushMessage)
      await PushController.handlePush(context as never)

      expect(findHandlerSpy).toHaveBeenCalledWith('my-action')
    })
  })
})
