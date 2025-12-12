import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPublishMessage = vi.fn().mockResolvedValue('message-id-123')
const mockTopic = vi.fn().mockReturnValue({
  publishMessage: mockPublishMessage,
})

vi.mock('../../../src/infra/pubsub', () => ({
  pubsub: {
    topic: mockTopic,
  },
}))

describe('NotificationPublisherService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('publishCreated', () => {
    it('should publish notification to correct topic', async () => {
      const { NotificationPublisherService } = await import('./notification-publisher.service')

      const notification = {
        _id: { toString: () => 'notif-123' },
        userId: 'user-456',
        type: 'email' as const,
        message: 'Test notification',
        createdAt: new Date('2024-01-01T00:00:00Z'),
      }

      const result = await NotificationPublisherService.publishCreated(notification)

      expect(mockTopic).toHaveBeenCalledWith('notification-created')
      expect(mockPublishMessage).toHaveBeenCalledWith({
        data: expect.any(Buffer),
      })
      expect(result).toBe('message-id-123')
    })

    it('should serialize notification correctly', async () => {
      const { NotificationPublisherService } = await import('./notification-publisher.service')

      const notification = {
        _id: { toString: () => 'notif-456' },
        userId: 'user-789',
        type: 'in-app' as const,
        message: 'Another notification',
        createdAt: new Date('2024-06-15T12:30:00Z'),
      }

      await NotificationPublisherService.publishCreated(notification)

      const [callArgs] = mockPublishMessage.mock.calls
      const data = JSON.parse(callArgs[0].data.toString())

      expect(data).toEqual({
        id: 'notif-456',
        userId: 'user-789',
        type: 'in-app',
        message: 'Another notification',
        createdAt: '2024-06-15T12:30:00.000Z',
      })
    })
  })

  describe('backward compatibility', () => {
    it('publishNotificationCreated should work', async () => {
      const { publishNotificationCreated } = await import('./notification-publisher.service')

      const notification = {
        _id: { toString: () => 'notif-123' },
        userId: 'user-456',
        type: 'email' as const,
        message: 'Test notification',
        createdAt: new Date('2024-01-01T00:00:00Z'),
      }

      const result = await publishNotificationCreated(notification)

      expect(result).toBe('message-id-123')
    })
  })
})
