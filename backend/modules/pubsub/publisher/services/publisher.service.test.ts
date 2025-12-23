// modules/pubsub/publisher/services/publisher.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as infra from '../../../../src/infra'
import { PublisherService, PublisherError } from './publisher.service'

describe('PublisherService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('publish', () => {
    const validWhatsAppPayload = {
      countryPhone: '5551992265039',
      message: 'Hello!',
      leadId: 'lead-123',
      step: 'initial',
    }

    it('should publish to send-whatsapp-message topic with valid payload', async () => {
      const mockPublishMessage = vi.fn().mockResolvedValue('msg-123')
      vi.spyOn(infra.pubsub, 'topic').mockReturnValue({
        publishMessage: mockPublishMessage,
      } as any)

      const result = await PublisherService.publish('send-whatsapp-message', validWhatsAppPayload)

      expect(result).toEqual({
        messageId: 'msg-123',
        topic: 'send-whatsapp-message',
      })
      expect(infra.pubsub.topic).toHaveBeenCalledWith('send-whatsapp-message')
      expect(mockPublishMessage).toHaveBeenCalledWith({
        data: expect.any(Buffer),
      })
    })

    it('should throw PublisherError if topic not found', async () => {
      await expect(PublisherService.publish('unknown-topic', validWhatsAppPayload)).rejects.toThrow(
        PublisherError
      )
    })

    it('should throw PublisherError if payload validation fails', async () => {
      const invalidPayload = {
        countryPhone: '5551992265039',
        // missing: message, leadId, step
      }

      await expect(
        PublisherService.publish('send-whatsapp-message', invalidPayload)
      ).rejects.toThrow(PublisherError)
    })

    it('should include topic in error', async () => {
      try {
        await PublisherService.publish('unknown-topic', validWhatsAppPayload)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(PublisherError)
        expect((error as PublisherError).topic).toBe('unknown-topic')
        expect((error as PublisherError).code).toBe('PUBLISHER_NOT_FOUND')
      }
    })

    it('should include required fields in validation error message', async () => {
      const invalidPayload = {
        countryPhone: '5551992265039',
      }

      try {
        await PublisherService.publish('send-whatsapp-message', invalidPayload)
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(PublisherError)
        expect((error as PublisherError).message).toContain('countryPhone')
        expect((error as PublisherError).message).toContain('message')
        expect((error as PublisherError).message).toContain('leadId')
        expect((error as PublisherError).message).toContain('step')
      }
    })

    it('should reject empty strings for required fields', async () => {
      const payloadWithEmptyField = {
        countryPhone: '',
        message: 'Hello!',
        leadId: 'lead-123',
        step: 'initial',
      }

      await expect(
        PublisherService.publish('send-whatsapp-message', payloadWithEmptyField)
      ).rejects.toThrow(PublisherError)
    })

    it('should reject non-string values for required fields', async () => {
      const payloadWithInvalidType = {
        countryPhone: 5_551_992_265_039,
        message: 'Hello!',
        leadId: 'lead-123',
        step: 'initial',
      }

      await expect(
        PublisherService.publish('send-whatsapp-message', payloadWithInvalidType)
      ).rejects.toThrow(PublisherError)
    })

    it('should allow additional fields in payload', async () => {
      const payloadWithExtra = {
        ...validWhatsAppPayload,
        extraField: 'should be allowed',
        anotherField: 123,
      }

      const mockPublishMessage = vi.fn().mockResolvedValue('msg-123')
      vi.spyOn(infra.pubsub, 'topic').mockReturnValue({
        publishMessage: mockPublishMessage,
      } as any)

      const result = await PublisherService.publish('send-whatsapp-message', payloadWithExtra)

      expect(result).toEqual({
        messageId: 'msg-123',
        topic: 'send-whatsapp-message',
      })
      expect(infra.pubsub.topic).toHaveBeenCalledWith('send-whatsapp-message')
      expect(mockPublishMessage).toHaveBeenCalledWith({
        data: expect.any(Buffer),
      })
    })

    it('should propagate PubSubPublisher errors', async () => {
      const mockPublishMessage = vi.fn().mockRejectedValue(new Error('Pub/Sub failed'))
      vi.spyOn(infra.pubsub, 'topic').mockReturnValue({
        publishMessage: mockPublishMessage,
      } as any)

      await expect(
        PublisherService.publish('send-whatsapp-message', validWhatsAppPayload)
      ).rejects.toThrow('Pub/Sub failed')
    })
  })
})
