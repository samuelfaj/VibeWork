// modules/pubsub/receiver/services/payload-decoder.service.test.ts
import { describe, it, expect } from 'vitest'
import type { PubSubPushMessage } from '../../core/pubsub.types'
import { PayloadDecoderService, PayloadDecodingError } from './payload-decoder.service'

describe('PayloadDecoderService', () => {
  function createValidMessage(payload: object): PubSubPushMessage {
    return {
      message: {
        data: Buffer.from(JSON.stringify(payload)).toString('base64'),
        messageId: 'test-message-id',
        publishTime: '2024-01-01T00:00:00Z',
        attributes: { key: 'value' },
      },
      subscription: 'projects/test/subscriptions/test-sub',
    }
  }

  it('should decode valid base64 payload with action and body', () => {
    const message = createValidMessage({ action: 'test-action', body: { foo: 'bar' } })
    const result = PayloadDecoderService.decode(message)
    expect(result.payload.action).toBe('test-action')
    expect(result.payload.body).toEqual({ foo: 'bar' })
  })

  it('should throw INVALID_BASE64 for non-base64 data', () => {
    const message: PubSubPushMessage = {
      message: {
        data: '!!!invalid-base64!!!',
        messageId: 'test',
        publishTime: '2024-01-01T00:00:00Z',
      },
      subscription: 'test-sub',
    }
    expect(() => PayloadDecoderService.decode(message)).toThrow(PayloadDecodingError)
    try {
      PayloadDecoderService.decode(message)
    } catch (error) {
      expect((error as PayloadDecodingError).code).toMatch(/INVALID_BASE64|INVALID_JSON/)
    }
  })

  it('should throw INVALID_JSON for invalid JSON', () => {
    const message: PubSubPushMessage = {
      message: {
        data: Buffer.from('not valid json').toString('base64'),
        messageId: 'test',
        publishTime: '2024-01-01T00:00:00Z',
      },
      subscription: 'test-sub',
    }
    expect(() => PayloadDecoderService.decode(message)).toThrow(PayloadDecodingError)
    try {
      PayloadDecoderService.decode(message)
    } catch (error) {
      expect((error as PayloadDecodingError).code).toBe('INVALID_JSON')
    }
  })

  it('should throw MISSING_ACTION if action field missing', () => {
    const message = createValidMessage({ body: { foo: 'bar' } })
    expect(() => PayloadDecoderService.decode(message)).toThrow(PayloadDecodingError)
    try {
      PayloadDecoderService.decode(message)
    } catch (error) {
      expect((error as PayloadDecodingError).code).toBe('MISSING_ACTION')
    }
  })

  it('should throw MISSING_ACTION if action field is empty string', () => {
    const message = createValidMessage({ action: '', body: { foo: 'bar' } })
    expect(() => PayloadDecoderService.decode(message)).toThrow(PayloadDecodingError)
    try {
      PayloadDecoderService.decode(message)
    } catch (error) {
      expect((error as PayloadDecodingError).code).toBe('MISSING_ACTION')
    }
  })

  it('should throw INVALID_STRUCTURE for non-object payload', () => {
    const message: PubSubPushMessage = {
      message: {
        data: Buffer.from('"just a string"').toString('base64'),
        messageId: 'test',
        publishTime: '2024-01-01T00:00:00Z',
      },
      subscription: 'test-sub',
    }
    expect(() => PayloadDecoderService.decode(message)).toThrow(PayloadDecodingError)
    try {
      PayloadDecoderService.decode(message)
    } catch (error) {
      expect((error as PayloadDecodingError).code).toBe('INVALID_STRUCTURE')
    }
  })

  it('should extract correct metadata from message', () => {
    const message = createValidMessage({ action: 'test-action' })
    const result = PayloadDecoderService.decode(message)
    expect(result.metadata.messageId).toBe('test-message-id')
    expect(result.metadata.publishTime).toBeInstanceOf(Date)
    expect(result.metadata.subscription).toBe('projects/test/subscriptions/test-sub')
    expect(result.metadata.attributes).toEqual({ key: 'value' })
  })

  it('should throw INVALID_STRUCTURE if body is not an object', () => {
    const message = createValidMessage({ action: 'test-action', body: 'not an object' })
    expect(() => PayloadDecoderService.decode(message)).toThrow(PayloadDecodingError)
    try {
      PayloadDecoderService.decode(message)
    } catch (error) {
      expect((error as PayloadDecodingError).code).toBe('INVALID_STRUCTURE')
    }
  })

  it('should throw INVALID_STRUCTURE if body is null', () => {
    const message = createValidMessage({ action: 'test-action', body: null })
    expect(() => PayloadDecoderService.decode(message)).toThrow(PayloadDecodingError)
    try {
      PayloadDecoderService.decode(message)
    } catch (error) {
      expect((error as PayloadDecodingError).code).toBe('INVALID_STRUCTURE')
    }
  })

  it('should allow undefined body (will use entire payload as body)', () => {
    const message = createValidMessage({ action: 'test-action' })
    const result = PayloadDecoderService.decode(message)
    expect(result.payload.action).toBe('test-action')
    expect(result.payload.body).toEqual({ action: 'test-action' })
  })
})
