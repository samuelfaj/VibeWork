import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NotificationController } from './notification.controller'

// Mock dependencies
const mockCreate = vi.fn()
const mockPublishCreated = vi.fn().mockResolvedValue('message-id')
const mockGetUserNotifications = vi.fn()
const mockMarkAsRead = vi.fn()

vi.mock('../models/notification.model', () => ({
  NotificationModel: {
    create: (data: unknown) => mockCreate(data),
  },
}))

vi.mock('../services/notification-publisher.service', () => ({
  NotificationPublisherService: {
    publishCreated: (notification: unknown) => mockPublishCreated(notification),
  },
}))

vi.mock('../services/notification.service', () => ({
  NotificationService: {
    getUserNotifications: (userId: string) => mockGetUserNotifications(userId),
    markAsRead: (id: string, userId: string) => mockMarkAsRead(id, userId),
  },
}))

describe('NotificationController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('create', () => {
    it('should create notification and return 201', async () => {
      const mockDoc = {
        _id: { toString: () => 'notif-123' },
        userId: 'user-456',
        type: 'in-app' as const,
        message: 'Test notification',
        read: false,
        createdAt: new Date('2024-01-01T00:00:00Z'),
      }
      mockCreate.mockResolvedValue(mockDoc)

      const ctx = {
        body: { userId: 'user-456', type: 'in-app' as const, message: 'Test notification' },
        headers: { 'x-user-id': 'user-456' },
        set: { status: 200 },
      }

      const result = await NotificationController.create(ctx)

      expect(ctx.set.status).toBe(201)
      expect(result).toEqual({
        id: 'notif-123',
        userId: 'user-456',
        type: 'in-app',
        message: 'Test notification',
        read: false,
        createdAt: '2024-01-01T00:00:00.000Z',
      })
      expect(mockPublishCreated).toHaveBeenCalledWith(mockDoc)
    })

    it('should return 401 when X-User-Id header missing', async () => {
      const ctx = {
        body: { userId: 'user-456', type: 'in-app' as const, message: 'Test notification' },
        headers: {},
        set: { status: 200 },
      }

      const result = await NotificationController.create(ctx)

      expect(ctx.set.status).toBe(401)
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should return 403 when creating notification for other user', async () => {
      const ctx = {
        body: { userId: 'user-456', type: 'in-app' as const, message: 'Test notification' },
        headers: { 'x-user-id': 'different-user' },
        set: { status: 200 },
      }

      const result = await NotificationController.create(ctx)

      expect(ctx.set.status).toBe(403)
      expect(result).toEqual({ error: 'Cannot create notifications for other users' })
    })
  })

  describe('list', () => {
    it('should return user notifications with pagination', async () => {
      const mockNotifications = [
        { id: 'notif-1', userId: 'user-123', type: 'in-app', message: 'Test 1', read: false },
        { id: 'notif-2', userId: 'user-123', type: 'email', message: 'Test 2', read: true },
      ]
      mockGetUserNotifications.mockResolvedValue(mockNotifications)

      const ctx = {
        query: { page: '1', limit: '20' },
        headers: { 'x-user-id': 'user-123' },
      }

      const result = await NotificationController.list(ctx)

      expect(result).toEqual({
        data: mockNotifications,
        total: 2,
        page: 1,
        limit: 20,
      })
    })

    it('should return error when X-User-Id header missing', async () => {
      const ctx = {
        query: {},
        headers: {},
      }

      const result = await NotificationController.list(ctx)

      expect(result).toEqual({ error: 'Unauthorized', data: [], total: 0, page: 1, limit: 20 })
    })
  })

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'in-app',
        message: 'Test',
        read: true,
      }
      mockMarkAsRead.mockResolvedValue(mockNotification)

      const ctx = {
        params: { id: '507f1f77bcf86cd799439011' },
        headers: { 'x-user-id': 'user-456' },
        set: { status: 200 },
      }

      const result = await NotificationController.markAsRead(ctx)

      expect(result).toEqual(mockNotification)
    })

    it('should return 401 when X-User-Id header missing', async () => {
      const ctx = {
        params: { id: '507f1f77bcf86cd799439011' },
        headers: {},
        set: { status: 200 },
      }

      const result = await NotificationController.markAsRead(ctx)

      expect(ctx.set.status).toBe(401)
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const ctx = {
        params: { id: 'invalid-id' },
        headers: { 'x-user-id': 'user-456' },
        set: { status: 200 },
      }

      const result = await NotificationController.markAsRead(ctx)

      expect(ctx.set.status).toBe(400)
      expect(result).toEqual({ error: 'Invalid notification ID format' })
    })

    it('should return 404 for non-existent notification', async () => {
      mockMarkAsRead.mockResolvedValue(null)

      const ctx = {
        params: { id: '507f1f77bcf86cd799439011' },
        headers: { 'x-user-id': 'user-456' },
        set: { status: 200 },
      }

      const result = await NotificationController.markAsRead(ctx)

      expect(ctx.set.status).toBe(404)
      expect(result).toEqual({ error: 'Notification not found' })
    })
  })
})
