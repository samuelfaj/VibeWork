// modules/pubsub/publisher/services/publisher.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as infra from '../../../../src/infra'
import { PublisherService, PublisherError } from './publisher.service'

describe('PublisherService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('publish', () => {
    const validNotificationPayload = {
      id: 'notif-1',
      userId: 'user-1',
      type: 'in-app' as const,
      message: 'Hello!',
      createdAt: '2024-01-01T00:00:00.000Z',
    }

    it('should publish to notification-created topic with valid payload', async () => {
      const mockPublishMessage = vi.fn().mockResolvedValue('msg-123')
      vi.spyOn(infra.pubsub, 'topic').mockReturnValue({
        publishMessage: mockPublishMessage,
      } as never)

      const result = await PublisherService.publish(
        'notification-created',
        validNotificationPayload
      )

      expect(result).toEqual({
        messageId: 'msg-123',
        topic: 'notification-created',
      })
      expect(infra.pubsub.topic).toHaveBeenCalledWith('notification-created')
      expect(mockPublishMessage).toHaveBeenCalledWith({
        data: expect.any(Buffer),
      })
    })

    it('should throw PublisherError if topic not found', async () => {
      await expect(
        PublisherService.publish('unknown-topic', validNotificationPayload)
      ).rejects.toThrow(PublisherError)
    })

    it('should throw PublisherError if payload validation fails', async () => {
      const invalidPayload = {
        id: 'notif-1',
        // missing required fields
      }

      await expect(
        PublisherService.publish('notification-created', invalidPayload)
      ).rejects.toThrow(PublisherError)
    })

    it('should throw when required field is empty', async () => {
      const payloadWithEmptyField = {
        ...validNotificationPayload,
        message: '',
      }

      await expect(
        PublisherService.publish('notification-created', payloadWithEmptyField)
      ).rejects.toThrow(PublisherError)
    })

    it('should throw when type is invalid', async () => {
      const payloadWithInvalidType = {
        ...validNotificationPayload,
        type: 'sms',
      }

      await expect(
        PublisherService.publish('notification-created', payloadWithInvalidType)
      ).rejects.toThrow(PublisherError)
    })

    it('should allow extra fields when schema fields are valid', async () => {
      const mockPublishMessage = vi.fn().mockResolvedValue('msg-extra')
      vi.spyOn(infra.pubsub, 'topic').mockReturnValue({
        publishMessage: mockPublishMessage,
      } as never)

      const payloadWithExtra = {
        ...validNotificationPayload,
        meta: 'extra',
      }

      const result = await PublisherService.publish('notification-created', payloadWithExtra)

      expect(result).toEqual({
        messageId: 'msg-extra',
        topic: 'notification-created',
      })
    })

    it('should surface pubsub publish failures', async () => {
      vi.spyOn(infra.pubsub, 'topic').mockReturnValue({
        publishMessage: vi.fn().mockRejectedValue(new Error('Pub/Sub failed')),
      } as never)

      await expect(
        PublisherService.publish('notification-created', validNotificationPayload)
      ).rejects.toThrow('Pub/Sub failed')
    })
  })
})
