import 'reflect-metadata'
import { MongoDBContainer, type StartedMongoDBContainer } from '@testcontainers/mongodb'
import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import type { AuthUser } from '../../src/infra/auth-guard'

/**
 * Integration tests use the real notification routes + services against MongoDB,
 * with requireAuth mocked to a fixed session user (session cookie auth only).
 */
const sessionUser: AuthUser = {
  id: 'list-user',
  email: 'list@example.com',
  name: 'List User',
  role: 'client',
  emailVerified: true,
  image: null,
}

vi.mock('../../src/infra/auth-guard', async () => {
  const { Elysia: E } = await import('elysia')
  return {
    requireAuth: new E({ name: 'test-require-auth' })
      .resolve(() => ({ user: sessionUser }))
      .as('scoped'),
    requireRole: () =>
      new E({ name: 'test-require-role' }).resolve(() => ({ user: sessionUser })).as('scoped'),
    authContext: new E({ name: 'test-auth-context' })
      .derive(() => ({ user: sessionUser }))
      .as('scoped'),
  }
})

vi.mock('./services/notification-publisher.service', () => ({
  NotificationPublisherService: {
    publishCreated: vi.fn().mockResolvedValue('mock-message-id'),
  },
}))

vi.mock('./models/notification.model', () => {
  // Will be replaced after mongoose connects — use getter via factory
  return {
    NotificationModel: {
      create: (...args: unknown[]) => (globalThis as any).__NotifModel.create(...args),
      find: (...args: unknown[]) => (globalThis as any).__NotifModel.find(...args),
      findOneAndUpdate: (...args: unknown[]) =>
        (globalThis as any).__NotifModel.findOneAndUpdate(...args),
      findById: (...args: unknown[]) => (globalThis as any).__NotifModel.findById(...args),
      deleteMany: (...args: unknown[]) => (globalThis as any).__NotifModel.deleteMany(...args),
    },
  }
})

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['in-app', 'email'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

describe('Notification Module Integration Tests', () => {
  let container: StartedMongoDBContainer
  let NotificationModel: mongoose.Model<any>

  let app: any

  beforeAll(async () => {
    container = await new MongoDBContainer('mongo:7.0').withStartupTimeout(60_000).start()
    await mongoose.connect(container.getConnectionString(), { directConnection: true })

    NotificationModel =
      mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
    ;(globalThis as any).__NotifModel = NotificationModel

    const { notificationRoutes } = await import('./routes/notification.routes')
    app = new Elysia().use(notificationRoutes)
  }, 120_000)

  afterAll(async () => {
    await mongoose.disconnect()
    await container.stop()
  })

  beforeEach(async () => {
    sessionUser.id = 'list-user'
    sessionUser.role = 'client'
    await NotificationModel.deleteMany({})
  })

  describe('with authenticated session (requireAuth mock)', () => {
    it('creates notification for self', async () => {
      sessionUser.id = 'user-123'
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
      expect(data.read).toBe(false)
    })

    it('rejects client creating for another user', async () => {
      sessionUser.id = 'user-123'
      const response = await app.handle(
        new Request('http://localhost/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'other-user',
            type: 'in-app',
            message: 'Nope',
          }),
        })
      )

      expect(response.status).toBe(403)
    })

    it('lists only session user notifications', async () => {
      sessionUser.id = 'list-user'
      await NotificationModel.create([
        { userId: 'list-user', type: 'in-app', message: 'Notification 1' },
        { userId: 'list-user', type: 'email', message: 'Notification 2' },
        { userId: 'other-user', type: 'in-app', message: 'Other' },
      ])

      const response = await app.handle(new Request('http://localhost/notifications'))
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.data).toHaveLength(2)
      expect(data.total).toBe(2)
    })

    it('marks own notification as read', async () => {
      sessionUser.id = 'read-user'
      const notification = await NotificationModel.create({
        userId: 'read-user',
        type: 'in-app',
        message: 'Unread',
        read: false,
      })

      const response = await app.handle(
        new Request(`http://localhost/notifications/${notification._id}/read`, {
          method: 'PATCH',
        })
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.read).toBe(true)
    })

    it('returns 404 when marking another users notification', async () => {
      sessionUser.id = 'other-user'
      const notification = await NotificationModel.create({
        userId: 'owner-user',
        type: 'in-app',
        message: 'Owner',
        read: false,
      })

      const response = await app.handle(
        new Request(`http://localhost/notifications/${notification._id}/read`, {
          method: 'PATCH',
        })
      )

      expect(response.status).toBe(404)
    })
  })
})
