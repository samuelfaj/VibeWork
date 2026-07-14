import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockFind = vi.fn()
const mockFindById = vi.fn()
const mockFindOneAndUpdate = vi.fn()
const mockPublishCreated = vi.fn().mockResolvedValue('msg-1')

vi.mock('../models/notification.model', () => ({
  NotificationModel: {
    create: (data: unknown) => mockCreate(data),
    find: (q: unknown) => ({
      sort: () => mockFind(q),
    }),
    findById: (id: string) => mockFindById(id),
    findOneAndUpdate: (...args: unknown[]) => mockFindOneAndUpdate(...args),
  },
}))

vi.mock('./notification-publisher.service', () => ({
  NotificationPublisherService: {
    publishCreated: (doc: unknown) => mockPublishCreated(doc),
  },
}))

vi.mock('./notification-formatter.service', () => ({
  NotificationFormatterService: {
    formatResponse: (doc: {
      _id: { toString: () => string }
      userId: string
      type: string
      message: string
      read: boolean
      createdAt: Date
    }) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      message: doc.message,
      read: doc.read,
      createdAt: doc.createdAt.toISOString(),
    }),
  },
}))

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create persists, publishes, and formats', async () => {
    const doc = {
      _id: { toString: () => 'id-1' },
      userId: 'u1',
      type: 'in-app',
      message: 'hi',
      read: false,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    }
    mockCreate.mockResolvedValue(doc)
    const { NotificationService } = await import('./notification.service')
    const result = await NotificationService.create({
      userId: 'u1',
      type: 'in-app',
      message: 'hi',
    })
    expect(result.id).toBe('id-1')
    expect(result.message).toBe('hi')
    expect(mockPublishCreated).toHaveBeenCalledWith(doc)
  })

  it('getUserNotifications maps list', async () => {
    mockFind.mockResolvedValue([
      {
        _id: { toString: () => 'id-1' },
        userId: 'u1',
        type: 'email',
        message: 'm',
        read: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ])
    const { NotificationService } = await import('./notification.service')
    const list = await NotificationService.getUserNotifications('u1')
    expect(list).toHaveLength(1)
    expect(list[0]?.type).toBe('email')
  })

  it('findById delegates to model', async () => {
    mockFindById.mockResolvedValue({ userId: 'u1' })
    const { NotificationService } = await import('./notification.service')
    const doc = await NotificationService.findById('abc')
    expect(doc).toEqual({ userId: 'u1' })
    expect(mockFindById).toHaveBeenCalledWith('abc')
  })

  it('markAsRead returns null when missing', async () => {
    mockFindOneAndUpdate.mockResolvedValue(null)
    const { NotificationService } = await import('./notification.service')
    const result = await NotificationService.markAsRead('507f1f77bcf86cd799439011', 'u1')
    expect(result).toBeNull()
  })
})
