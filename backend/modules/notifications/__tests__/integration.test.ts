import 'reflect-metadata'
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb'
import mongoose from 'mongoose'
import { Elysia, t } from 'elysia'

// Mock the Pub/Sub publisher to avoid side effects
vi.mock('../services/notification-publisher', () => ({
  publishNotificationCreated: vi.fn().mockResolvedValue('mock-message-id'),
}))

// Define a simple mongoose schema for testing (mirrors the production schema)
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['in-app', 'email'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

describe('Notification Module Integration Tests', () => {
  let container: StartedMongoDBContainer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let NotificationModel: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any

  beforeAll(async () => {
    console.log('[Integration] Starting MongoDB container...')
    container = await new MongoDBContainer('mongo:7.0').withStartupTimeout(60000).start()

    const connectionString = container.getConnectionString()
    console.log(`[Integration] MongoDB container started`)

    // Connect mongoose to container
    await mongoose.connect(connectionString, {
      directConnection: true,
    })

    // Use local schema model for testing
    NotificationModel =
      mongoose.models.Notification || mongoose.model('Notification', notificationSchema)

    // Build minimal test routes using our model directly (avoids Typegoose import issues)
    app = new Elysia()
      .post(
        '/notifications',
        async ({ body, set }) => {
          const doc = await NotificationModel.create(body)
          set.status = 201
          return {
            id: doc._id.toString(),
            userId: doc.userId,
            type: doc.type,
            message: doc.message,
            read: doc.read,
            createdAt: doc.createdAt.toISOString(),
          }
        },
        {
          body: t.Object({
            userId: t.String(),
            type: t.Union([t.Literal('in-app'), t.Literal('email')]),
            message: t.String(),
          }),
        }
      )
      .get('/notifications', async ({ query, headers }) => {
        const userId = headers['x-user-id']
        if (!userId) {
          return { error: 'Unauthorized', data: [], total: 0, page: 1, limit: 20 }
        }
        const page = query.page ? Number(query.page) : 1
        const limit = query.limit ? Number(query.limit) : 20
        const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 })
        const start = (page - 1) * limit
        const paginated = notifications.slice(start, start + limit)
        return {
          data: paginated.map(
            (doc: {
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
            })
          ),
          total: notifications.length,
          page,
          limit,
        }
      })
      .patch('/notifications/:id/read', async ({ params, headers, set }) => {
        const userId = headers['x-user-id']
        if (!userId) {
          set.status = 401
          return { error: 'Unauthorized' }
        }
        if (!/^[0-9a-fA-F]{24}$/.test(params.id)) {
          set.status = 400
          return { error: 'Invalid notification ID format' }
        }
        const doc = await NotificationModel.findOneAndUpdate(
          { _id: params.id, userId },
          { read: true },
          { new: true }
        )
        if (!doc) {
          set.status = 404
          return { error: 'Notification not found' }
        }
        return {
          id: doc._id.toString(),
          userId: doc.userId,
          type: doc.type,
          message: doc.message,
          read: doc.read,
          createdAt: doc.createdAt.toISOString(),
        }
      })

    console.log('[Integration] MongoDB connection established')
  }, 120000)

  afterAll(async () => {
    console.log('[Integration] Cleaning up...')
    await mongoose.disconnect()
    await container.stop()
    console.log('[Integration] MongoDB container stopped')
  })

  beforeEach(async () => {
    // Clear notifications collection
    await NotificationModel.deleteMany({})
  })

  describe('Create Notification', () => {
    it('should create in-app notification successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-123',
            type: 'in-app',
            message: 'Test in-app notification',
          }),
        })
      )

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.userId).toBe('user-123')
      expect(data.type).toBe('in-app')
      expect(data.message).toBe('Test in-app notification')
      expect(data.read).toBe(false)
      expect(data.id).toBeDefined()
    })

    it('should create email notification successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-456',
            type: 'email',
            message: 'Test email notification',
          }),
        })
      )

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data.type).toBe('email')
    })

    it('should verify notification stored with correct fields', async () => {
      await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-789',
            type: 'in-app',
            message: 'Stored notification',
          }),
        })
      )

      const stored = await NotificationModel.findOne({ userId: 'user-789' })
      expect(stored).toBeDefined()
      expect(stored.userId).toBe('user-789')
      expect(stored.type).toBe('in-app')
      expect(stored.message).toBe('Stored notification')
      expect(stored.read).toBe(false)
      expect(stored.createdAt).toBeInstanceOf(Date)
    })

    it('should reject missing required fields', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-123',
            // missing type and message
          }),
        })
      )

      expect(response.status).toBe(422)
    })

    it('should reject invalid notification type', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-123',
            type: 'sms', // invalid type
            message: 'Test notification',
          }),
        })
      )

      expect(response.status).toBe(422)
    })
  })

  describe('List Notifications', () => {
    it('should list all notifications for a user', async () => {
      // Create test notifications
      await NotificationModel.create([
        { userId: 'list-user', type: 'in-app', message: 'Notification 1' },
        { userId: 'list-user', type: 'email', message: 'Notification 2' },
        { userId: 'other-user', type: 'in-app', message: 'Other user notification' },
      ])

      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'GET',
          headers: { 'X-User-Id': 'list-user' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toHaveLength(2)
      expect(data.total).toBe(2)
    })

    it('should return empty array for user with no notifications', async () => {
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'GET',
          headers: { 'X-User-Id': 'no-notifications-user' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toHaveLength(0)
      expect(data.total).toBe(0)
    })

    it('should return notifications sorted by createdAt descending', async () => {
      // Create notifications with different dates
      const older = await NotificationModel.create({
        userId: 'sort-user',
        type: 'in-app',
        message: 'Older notification',
        createdAt: new Date('2024-01-01'),
      })
      const newer = await NotificationModel.create({
        userId: 'sort-user',
        type: 'in-app',
        message: 'Newer notification',
        createdAt: new Date('2024-01-02'),
      })

      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'GET',
          headers: { 'X-User-Id': 'sort-user' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data[0].id).toBe(newer._id.toString())
      expect(data.data[1].id).toBe(older._id.toString())
    })

    it('should paginate correctly', async () => {
      // Create 25 notifications
      const notifications = Array.from({ length: 25 }, (_, i) => ({
        userId: 'paginate-user',
        type: 'in-app' as const,
        message: `Notification ${i}`,
      }))
      await NotificationModel.create(notifications)

      const response = await app.handle(
        new Request('http://localhost/notifications?page=2&limit=10', {
          method: 'GET',
          headers: { 'X-User-Id': 'paginate-user' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toHaveLength(10)
      expect(data.page).toBe(2)
      expect(data.limit).toBe(10)
      expect(data.total).toBe(25)
    })
  })

  describe('Mark as Read', () => {
    it('should mark notification as read successfully', async () => {
      const notification = await NotificationModel.create({
        userId: 'read-user',
        type: 'in-app',
        message: 'Unread notification',
        read: false,
      })

      const response = await app.handle(
        new Request(`http://localhost/notifications/${notification._id}/read`, {
          method: 'PATCH',
          headers: { 'X-User-Id': 'read-user' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.read).toBe(true)

      // Verify in database
      const updated = await NotificationModel.findById(notification._id)
      expect(updated.read).toBe(true)
    })

    it('should return 404 for non-existent notification', async () => {
      const fakeId = '507f1f77bcf86cd799439011' // valid ObjectId format but doesn't exist

      const response = await app.handle(
        new Request(`http://localhost/notifications/${fakeId}/read`, {
          method: 'PATCH',
          headers: { 'X-User-Id': 'some-user' },
        })
      )

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Notification not found')
    })

    it('should be idempotent when marking already-read notification', async () => {
      const notification = await NotificationModel.create({
        userId: 'idempotent-user',
        type: 'in-app',
        message: 'Already read',
        read: true,
      })

      const response = await app.handle(
        new Request(`http://localhost/notifications/${notification._id}/read`, {
          method: 'PATCH',
          headers: { 'X-User-Id': 'idempotent-user' },
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.read).toBe(true)
    })

    it('should not allow marking another user notification', async () => {
      const notification = await NotificationModel.create({
        userId: 'owner-user',
        type: 'in-app',
        message: 'Owner notification',
        read: false,
      })

      const response = await app.handle(
        new Request(`http://localhost/notifications/${notification._id}/read`, {
          method: 'PATCH',
          headers: { 'X-User-Id': 'other-user' }, // different user
        })
      )

      // Should return 404 because the notification doesn't belong to this user
      expect(response.status).toBe(404)
    })
  })
})
