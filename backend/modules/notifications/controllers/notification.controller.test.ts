import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NotificationController } from './notification.controller'

const mockCreate = vi.fn()
const mockGetUserNotifications = vi.fn()
const mockListAll = vi.fn()
const mockMarkAsRead = vi.fn()
const mockFindById = vi.fn()

vi.mock('../services/notification.service', () => ({
  NotificationService: {
    create: (data: unknown) => mockCreate(data),
    getUserNotifications: (userId: string) => mockGetUserNotifications(userId),
    listAll: () => mockListAll(),
    markAsRead: (id: string, userId: string) => mockMarkAsRead(id, userId),
    findById: (id: string) => mockFindById(id),
  },
}))

vi.mock('../../../src/i18n', () => ({
  getLanguageFromHeader: () => 'en',
  getTranslation: (key: string) => key,
}))

const clientUser = {
  id: 'user-456',
  email: 'c@example.com',
  name: 'Client',
  role: 'client' as const,
  emailVerified: true,
  image: null,
}

const adminUser = {
  ...clientUser,
  id: 'admin-1',
  role: 'admin' as const,
}

describe('NotificationController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('create', () => {
    it('should create notification and return 201 for own userId', async () => {
      mockCreate.mockResolvedValue({
        id: 'notif-123',
        userId: 'user-456',
        type: 'in-app',
        message: 'Test notification',
        read: false,
        createdAt: '2024-01-01T00:00:00.000Z',
      })

      const ctx = {
        body: { userId: 'user-456', type: 'in-app' as const, message: 'Test notification' },
        user: clientUser,
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      const result = await NotificationController.create(ctx)

      expect(ctx.set.status).toBe(201)
      expect(result).toMatchObject({
        id: 'notif-123',
        userId: 'user-456',
        type: 'in-app',
        message: 'Test notification',
      })
      expect(mockCreate).toHaveBeenCalledWith(ctx.body)
    })

    it('should return 403 when client creates for another user', async () => {
      const ctx = {
        body: { userId: 'other-user', type: 'in-app' as const, message: 'Nope' },
        user: clientUser,
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      const result = await NotificationController.create(ctx)

      expect(ctx.set.status).toBe(403)
      expect(result).toEqual({
        error: { code: 'FORBIDDEN', message: 'errors.notification.unauthorized' },
      })
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('should allow admin to create for another user', async () => {
      mockCreate.mockResolvedValue({
        id: 'notif-999',
        userId: 'other-user',
        type: 'email',
        message: 'Staff note',
        read: false,
        createdAt: '2024-01-01T00:00:00.000Z',
      })

      const ctx = {
        body: { userId: 'other-user', type: 'email' as const, message: 'Staff note' },
        user: adminUser,
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      await NotificationController.create(ctx)
      expect(ctx.set.status).toBe(201)
      expect(mockCreate).toHaveBeenCalled()
    })
  })

  describe('list', () => {
    it('lists only own notifications for client', async () => {
      mockGetUserNotifications.mockResolvedValue([])
      const ctx = {
        query: {},
        user: clientUser,
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      await NotificationController.list(ctx)
      expect(mockGetUserNotifications).toHaveBeenCalledWith('user-456')
      expect(mockListAll).not.toHaveBeenCalled()
    })

    it('lists all notifications for admin', async () => {
      mockListAll.mockResolvedValue([])
      const ctx = {
        query: {},
        user: adminUser,
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      await NotificationController.list(ctx)
      expect(mockListAll).toHaveBeenCalled()
    })
  })

  describe('markAsRead', () => {
    it('returns 400 for invalid id', async () => {
      const ctx = {
        params: { id: 'bad-id' },
        user: clientUser,
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      const result = await NotificationController.markAsRead(ctx)
      expect(ctx.set.status).toBe(400)
      expect(result).toMatchObject({ error: { code: 'BAD_REQUEST' } })
    })

    it('marks own notification as read', async () => {
      const id = '507f1f77bcf86cd799439011'
      mockMarkAsRead.mockResolvedValue({
        id,
        userId: 'user-456',
        type: 'in-app',
        message: 'x',
        read: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      })

      const ctx = {
        params: { id },
        user: clientUser,
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      const result = await NotificationController.markAsRead(ctx)
      expect(mockMarkAsRead).toHaveBeenCalledWith(id, 'user-456')
      expect(result).toMatchObject({ read: true })
    })
  })
})
