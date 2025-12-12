import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockOn = vi.fn()
const mockRemoveAllListeners = vi.fn()
const mockClose = vi.fn().mockResolvedValue(undefined)
const mockSubscription = vi.fn().mockReturnValue({
  on: mockOn,
  removeAllListeners: mockRemoveAllListeners,
  close: mockClose,
})

vi.mock('../../../src/infra/pubsub', () => ({
  pubsub: {
    subscription: mockSubscription,
  },
}))

const mockSendEmail = vi.fn().mockResolvedValue(undefined)
vi.mock('./email.service', () => ({
  createEmailService: () => ({
    sendEmail: mockSendEmail,
  }),
}))

describe('NotificationSubscriberService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('isValidPayload', () => {
    it('should return true for valid email payload', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')

      const payload = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'email',
        message: 'Test message',
        createdAt: '2024-01-01T00:00:00Z',
      }

      expect(NotificationSubscriberService.isValidPayload(payload)).toBe(true)
    })

    it('should return true for valid in-app payload', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')

      const payload = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'in-app',
        message: 'Test message',
        createdAt: '2024-01-01T00:00:00Z',
      }

      expect(NotificationSubscriberService.isValidPayload(payload)).toBe(true)
    })

    it('should return false for invalid type', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')

      const payload = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'sms',
        message: 'Test message',
        createdAt: '2024-01-01T00:00:00Z',
      }

      expect(NotificationSubscriberService.isValidPayload(payload)).toBe(false)
    })

    it('should return false for missing fields', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')

      expect(NotificationSubscriberService.isValidPayload(null)).toBe(false)
      expect(NotificationSubscriberService.isValidPayload({})).toBe(false)
      expect(NotificationSubscriberService.isValidPayload({ id: 'test' })).toBe(false)
    })
  })

  describe('handleMessage', () => {
    it('should process email type and call EmailService', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')
      await NotificationSubscriberService.start()

      const mockAck = vi.fn()
      const mockNack = vi.fn()
      const message = {
        id: 'msg-123',
        data: Buffer.from(
          JSON.stringify({
            id: 'notif-123',
            userId: 'user@example.com',
            type: 'email',
            message: 'Test email notification',
            createdAt: '2024-01-01T00:00:00Z',
          })
        ),
        ack: mockAck,
        nack: mockNack,
      }

      await NotificationSubscriberService.handleMessage(message as never)

      expect(mockSendEmail).toHaveBeenCalledWith(
        'user@example.com',
        'New Notification',
        'Test email notification'
      )
      expect(mockAck).toHaveBeenCalled()
      expect(mockNack).not.toHaveBeenCalled()

      await NotificationSubscriberService.stop()
    })

    it('should ignore in-app type and acknowledge', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')
      await NotificationSubscriberService.start()

      const mockAck = vi.fn()
      const mockNack = vi.fn()
      const message = {
        id: 'msg-456',
        data: Buffer.from(
          JSON.stringify({
            id: 'notif-456',
            userId: 'user-789',
            type: 'in-app',
            message: 'Test in-app notification',
            createdAt: '2024-01-01T00:00:00Z',
          })
        ),
        ack: mockAck,
        nack: mockNack,
      }

      await NotificationSubscriberService.handleMessage(message as never)

      expect(mockSendEmail).not.toHaveBeenCalled()
      expect(mockAck).toHaveBeenCalled()
      expect(mockNack).not.toHaveBeenCalled()

      await NotificationSubscriberService.stop()
    })

    it('should nack on EmailService error', async () => {
      mockSendEmail.mockRejectedValueOnce(new Error('Email send failed'))

      const { NotificationSubscriberService } = await import('./notification-subscriber.service')
      await NotificationSubscriberService.start()

      const mockAck = vi.fn()
      const mockNack = vi.fn()
      const message = {
        id: 'msg-789',
        data: Buffer.from(
          JSON.stringify({
            id: 'notif-789',
            userId: 'user@example.com',
            type: 'email',
            message: 'Test email',
            createdAt: '2024-01-01T00:00:00Z',
          })
        ),
        ack: mockAck,
        nack: mockNack,
      }

      await NotificationSubscriberService.handleMessage(message as never)

      expect(mockNack).toHaveBeenCalled()
      expect(mockAck).not.toHaveBeenCalled()

      await NotificationSubscriberService.stop()
    })

    it('should ack invalid payload to prevent retry', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')
      await NotificationSubscriberService.start()

      const mockAck = vi.fn()
      const mockNack = vi.fn()
      const message = {
        id: 'msg-invalid',
        data: Buffer.from(JSON.stringify({ invalid: 'payload' })),
        ack: mockAck,
        nack: mockNack,
      }

      await NotificationSubscriberService.handleMessage(message as never)

      expect(mockAck).toHaveBeenCalled()
      expect(mockNack).not.toHaveBeenCalled()
      expect(mockSendEmail).not.toHaveBeenCalled()

      await NotificationSubscriberService.stop()
    })
  })

  describe('start', () => {
    it('should start subscriber and listen on subscription', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')

      await NotificationSubscriberService.start()

      expect(mockSubscription).toHaveBeenCalledWith('notification-created-sub')
      expect(mockOn).toHaveBeenCalledWith('message', expect.any(Function))
      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function))

      await NotificationSubscriberService.stop()
    })
  })

  describe('stop', () => {
    it('should stop subscriber and cleanup', async () => {
      const { NotificationSubscriberService } = await import('./notification-subscriber.service')

      await NotificationSubscriberService.start()
      await NotificationSubscriberService.stop()

      expect(mockRemoveAllListeners).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })
  })

  describe('backward compatibility', () => {
    it('deprecated functions should work', async () => {
      const { isValidPayload, startNotificationSubscriber, stopNotificationSubscriber } =
        await import('./notification-subscriber.service')

      expect(
        isValidPayload({
          id: 'test',
          userId: 'user',
          type: 'email',
          message: 'msg',
          createdAt: '2024-01-01',
        })
      ).toBe(true)

      await startNotificationSubscriber()
      await stopNotificationSubscriber()
    })
  })
})
