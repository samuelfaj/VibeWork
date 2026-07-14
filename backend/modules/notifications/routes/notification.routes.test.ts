import { Elysia } from 'elysia'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockCreate = vi.fn()
const mockGetUserNotifications = vi.fn()
const mockListAll = vi.fn()
const mockMarkAsRead = vi.fn()
const mockFindById = vi.fn()

const authUser = {
  id: 'user-456',
  email: 'user@example.com',
  name: 'User',
  role: 'client' as const,
  emailVerified: true,
  image: null,
}

vi.mock('../../../src/infra/auth-guard', () => ({
  requireAuth: new Elysia({ name: 'mock-require-auth' })
    .resolve(() => ({ user: authUser }))
    .as('scoped'),
  requireRole: () =>
    new Elysia({ name: 'mock-require-role' }).resolve(() => ({ user: authUser })).as('scoped'),
}))

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

describe('Notification Routes', () => {
  let app: any

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    const { notificationRoutes } = await import('./notification.routes')
    app = new Elysia().use(notificationRoutes)
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('POST /notifications creates via service', async () => {
    mockCreate.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-456',
      type: 'in-app',
      message: 'hello',
      read: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    })

    const response = await app.handle(
      new Request('http://localhost/notifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: 'user-456',
          type: 'in-app',
          message: 'hello',
        }),
      })
    )

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.id).toBe('notif-1')
    expect(mockCreate).toHaveBeenCalled()
  })

  it('POST /notifications forbids client creating for others', async () => {
    const response = await app.handle(
      new Request('http://localhost/notifications', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: 'other-user',
          type: 'in-app',
          message: 'nope',
        }),
      })
    )
    expect(response.status).toBe(403)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('GET /notifications lists own for client', async () => {
    mockGetUserNotifications.mockResolvedValue([])
    const response = await app.handle(new Request('http://localhost/notifications'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data).toEqual([])
    expect(mockGetUserNotifications).toHaveBeenCalledWith('user-456')
    expect(mockListAll).not.toHaveBeenCalled()
  })
})
