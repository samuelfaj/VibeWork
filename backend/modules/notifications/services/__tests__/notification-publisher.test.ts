import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPublishMessage = vi.fn().mockResolvedValue('message-id-123')
const mockTopic = vi.fn().mockReturnValue({
  publishMessage: mockPublishMessage,
})

const mockOn = vi.fn()
const mockRemoveAllListeners = vi.fn()
const mockClose = vi.fn().mockResolvedValue(undefined)
const mockSubscription = vi.fn().mockReturnValue({
  on: mockOn,
  removeAllListeners: mockRemoveAllListeners,
  close: mockClose,
})

vi.mock('../../../../src/infra/pubsub', () => ({
  pubsub: {
    topic: mockTopic,
    subscription: mockSubscription,
  },
}))

const mockSendEmail = vi.fn().mockResolvedValue(undefined)
vi.mock('../email.service', () => ({
  createEmailService: () => ({
    sendEmail: mockSendEmail,
  }),
}))

describe('Notification Publisher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should publish notification to correct topic', async () => {
    const { publishNotificationCreated } = await import('../notification-publisher')

    const notification = {
      _id: { toString: () => 'notif-123' },
      userId: 'user-456',
      type: 'email' as const,
      message: 'Test notification',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    }

    const result = await publishNotificationCreated(notification)

    expect(mockTopic).toHaveBeenCalledWith('notification-created')
    expect(mockPublishMessage).toHaveBeenCalledWith({
      data: expect.any(Buffer),
    })
    expect(result).toBe('message-id-123')
  })

  it('should serialize notification correctly', async () => {
    const { publishNotificationCreated } = await import('../notification-publisher')

    const notification = {
      _id: { toString: () => 'notif-456' },
      userId: 'user-789',
      type: 'in-app' as const,
      message: 'Another notification',
      createdAt: new Date('2024-06-15T12:30:00Z'),
    }

    await publishNotificationCreated(notification)

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

describe('Notification Subscriber', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('isValidPayload', () => {
    it('should return true for valid email payload', async () => {
      const { isValidPayload } = await import('../notification-subscriber')

      const payload = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'email',
        message: 'Test message',
        createdAt: '2024-01-01T00:00:00Z',
      }

      expect(isValidPayload(payload)).toBe(true)
    })

    it('should return true for valid in-app payload', async () => {
      const { isValidPayload } = await import('../notification-subscriber')

      const payload = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'in-app',
        message: 'Test message',
        createdAt: '2024-01-01T00:00:00Z',
      }

      expect(isValidPayload(payload)).toBe(true)
    })

    it('should return false for invalid type', async () => {
      const { isValidPayload } = await import('../notification-subscriber')

      const payload = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'sms',
        message: 'Test message',
        createdAt: '2024-01-01T00:00:00Z',
      }

      expect(isValidPayload(payload)).toBe(false)
    })

    it('should return false for missing fields', async () => {
      const { isValidPayload } = await import('../notification-subscriber')

      expect(isValidPayload(null)).toBe(false)
      expect(isValidPayload({})).toBe(false)
      expect(isValidPayload({ id: 'test' })).toBe(false)
    })
  })

  describe('handleMessage', () => {
    it('should process email type and call EmailService', async () => {
      const { handleMessage, startNotificationSubscriber, stopNotificationSubscriber } =
        await import('../notification-subscriber')
      await startNotificationSubscriber()

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

      await handleMessage(message as any)

      expect(mockSendEmail).toHaveBeenCalledWith(
        'user@example.com',
        'New Notification',
        'Test email notification'
      )
      expect(mockAck).toHaveBeenCalled()
      expect(mockNack).not.toHaveBeenCalled()

      await stopNotificationSubscriber()
    })

    it('should ignore in-app type and acknowledge', async () => {
      const { handleMessage, startNotificationSubscriber, stopNotificationSubscriber } =
        await import('../notification-subscriber')
      await startNotificationSubscriber()

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

      await handleMessage(message as any)

      expect(mockSendEmail).not.toHaveBeenCalled()
      expect(mockAck).toHaveBeenCalled()
      expect(mockNack).not.toHaveBeenCalled()

      await stopNotificationSubscriber()
    })

    it('should nack on EmailService error', async () => {
      mockSendEmail.mockRejectedValueOnce(new Error('Email send failed'))

      const { handleMessage, startNotificationSubscriber, stopNotificationSubscriber } =
        await import('../notification-subscriber')
      await startNotificationSubscriber()

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

      await handleMessage(message as any)

      expect(mockNack).toHaveBeenCalled()
      expect(mockAck).not.toHaveBeenCalled()

      await stopNotificationSubscriber()
    })

    it('should ack invalid payload to prevent retry', async () => {
      const { handleMessage, startNotificationSubscriber, stopNotificationSubscriber } =
        await import('../notification-subscriber')
      await startNotificationSubscriber()

      const mockAck = vi.fn()
      const mockNack = vi.fn()
      const message = {
        id: 'msg-invalid',
        data: Buffer.from(JSON.stringify({ invalid: 'payload' })),
        ack: mockAck,
        nack: mockNack,
      }

      await handleMessage(message as any)

      expect(mockAck).toHaveBeenCalled()
      expect(mockNack).not.toHaveBeenCalled()
      expect(mockSendEmail).not.toHaveBeenCalled()

      await stopNotificationSubscriber()
    })
  })

  describe('startNotificationSubscriber', () => {
    it('should start subscriber and listen on subscription', async () => {
      const { startNotificationSubscriber, stopNotificationSubscriber } =
        await import('../notification-subscriber')

      await startNotificationSubscriber()

      expect(mockSubscription).toHaveBeenCalledWith('notification-created-sub')
      expect(mockOn).toHaveBeenCalledWith('message', expect.any(Function))
      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function))

      await stopNotificationSubscriber()
    })
  })

  describe('stopNotificationSubscriber', () => {
    it('should stop subscriber and cleanup', async () => {
      const { startNotificationSubscriber, stopNotificationSubscriber } =
        await import('../notification-subscriber')

      await startNotificationSubscriber()
      await stopNotificationSubscriber()

      expect(mockRemoveAllListeners).toHaveBeenCalled()
      expect(mockClose).toHaveBeenCalled()
    })
  })
})
