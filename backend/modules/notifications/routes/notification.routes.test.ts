import { Elysia } from 'elysia'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock MongoDB model
const mockCreate = vi.fn()

vi.mock('../models/notification.model', () => ({
  NotificationModel: {
    create: (data: unknown) => mockCreate(data),
  },
}))

// Mock notification service
const mockGetUserNotifications = vi.fn()
const mockMarkAsRead = vi.fn()

vi.mock('../services/notification.service', () => ({
  NotificationService: {
    getUserNotifications: (userId: string) => mockGetUserNotifications(userId),
    markAsRead: (id: string, userId: string) => mockMarkAsRead(id, userId),
  },
  getUserNotifications: (userId: string) => mockGetUserNotifications(userId),
  markAsRead: (id: string, userId: string) => mockMarkAsRead(id, userId),
}))

// Mock Pub/Sub publisher
const mockPublishCreated = vi.fn().mockResolvedValue('message-id')
vi.mock('../services/notification-publisher.service', () => ({
  NotificationPublisherService: {
    publishCreated: (notification: unknown) => mockPublishCreated(notification),
  },
}))

describe('Notification Routes', () => {
  let app: any

  beforeEach(async () => {
    vi.clearAllMocks()

    const { notificationRoutes } = await import('./notification.routes')
    app = new Elysia().use(notificationRoutes)
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('POST /notifications', () => {
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

      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': 'user-456',
          },
          body: JSON.stringify({
            userId: 'user-456',
            type: 'in-app',
            message: 'Test notification',
          }),
        })
      )

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toEqual({
        id: 'notif-123',
        userId: 'user-456',
        type: 'in-app',
        message: 'Test notification',
        read: false,
        createdAt: '2024-01-01T00:00:00.000Z',
      })
      expect(mockPublishCreated).toHaveBeenCalledWith(mockDoc)
    })

    it('should return 422 for invalid type', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': 'user-456',
          },
          body: JSON.stringify({
            userId: 'user-456',
            type: 'sms',
            message: 'Test notification',
          }),
        })
      )

      expect(response.status).toBe(422)
    })

    it('should return 422 for missing required fields', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': 'user-456',
          },
          body: JSON.stringify({
            userId: 'user-456',
          }),
        })
      )

      expect(response.status).toBe(422)
    })
  })

  describe('GET /notifications', () => {
    it('should return user notifications with pagination', async () => {
      const mockDocs = [
        {
          id: 'notif-1',
          userId: 'user-123',
          type: 'in-app',
          message: 'Notification 1',
          read: false,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'notif-2',
          userId: 'user-123',
          type: 'email',
          message: 'Notification 2',
          read: true,
          createdAt: '2024-01-02T00:00:00.000Z',
        },
      ]
      mockGetUserNotifications.mockResolvedValue(mockDocs)

      const response = await app.handle(
        new Request('http://localhost/notifications?page=1&limit=20', {
          method: 'GET',
          headers: { 'X-User-Id': 'user-123' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual({
        data: mockDocs,
        total: 2,
        page: 1,
        limit: 20,
      })
    })

    it('should return empty array when no notifications', async () => {
      mockGetUserNotifications.mockResolvedValue([])

      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'GET',
          headers: { 'X-User-Id': 'user-456' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toEqual([])
      expect(data.total).toBe(0)
    })

    it('should return error when X-User-Id header missing', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'GET',
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should paginate correctly', async () => {
      const mockDocs = Array.from({ length: 25 }, (_, i) => ({
        id: `notif-${i}`,
        userId: 'user-123',
        type: 'in-app',
        message: `Notification ${i}`,
        read: false,
        createdAt: '2024-01-01T00:00:00.000Z',
      }))
      mockGetUserNotifications.mockResolvedValue(mockDocs)

      const response = await app.handle(
        new Request('http://localhost/notifications?page=2&limit=10', {
          method: 'GET',
          headers: { 'X-User-Id': 'user-123' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data.length).toBe(10)
      expect(data.page).toBe(2)
      expect(data.limit).toBe(10)
      expect(data.total).toBe(25)
    })
  })

  describe('PATCH /notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const mockResult = {
        id: 'notif-123',
        userId: 'user-456',
        type: 'in-app',
        message: 'Test notification',
        read: true,
        createdAt: '2024-01-01T00:00:00.000Z',
      }
      mockMarkAsRead.mockResolvedValue(mockResult)

      const response = await app.handle(
        new Request('http://localhost/notifications/507f1f77bcf86cd799439011/read', {
          method: 'PATCH',
          headers: { 'X-User-Id': 'user-456' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.read).toBe(true)
    })

    it('should return 404 for non-existent notification', async () => {
      mockMarkAsRead.mockResolvedValue(null)

      const response = await app.handle(
        new Request('http://localhost/notifications/507f1f77bcf86cd799439011/read', {
          method: 'PATCH',
          headers: { 'X-User-Id': 'user-456' },
        })
      )

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Notification not found')
    })

    it('should return 401 when X-User-Id header missing', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications/507f1f77bcf86cd799439011/read', {
          method: 'PATCH',
        })
      )

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid ObjectId format', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications/invalid-id/read', {
          method: 'PATCH',
          headers: { 'X-User-Id': 'user-456' },
        })
      )

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid notification ID format')
    })
  })
})
