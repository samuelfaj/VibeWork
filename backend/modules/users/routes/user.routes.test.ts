import { Elysia } from 'elysia'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const authUser = {
  id: 'user-1',
  email: 'u@example.com',
  name: 'User',
  role: 'client' as const,
  emailVerified: true,
  image: null,
}

vi.mock('../../../src/infra/auth-guard', () => ({
  requireAuth: new Elysia({ name: 'mock-require-auth' })
    .resolve(() => ({ user: authUser }))
    .as('scoped'),
}))

const mockFindUserById = vi.fn()
vi.mock('../services/user.service', () => ({
  UserService: {
    findUserById: (id: string) => mockFindUserById(id),
  },
}))

vi.mock('../../../src/i18n', () => ({
  getLanguageFromHeader: () => 'en',
  getTranslation: (key: string) => key,
}))

describe('user routes', () => {
  let app: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { userRoutes } = await import('./user.routes')
    app = new Elysia().use(userRoutes)
  })

  it('GET /users/me returns profile for authenticated user', async () => {
    mockFindUserById.mockResolvedValue({
      id: 'user-1',
      email: 'u@example.com',
      name: 'User',
      role: 'client',
      emailVerified: true,
      image: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    })

    const response = await app.handle(new Request('http://localhost/users/me'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.email).toBe('u@example.com')
    expect(body.role).toBe('client')
  })

  it('GET /users/me returns 404 when user missing', async () => {
    mockFindUserById.mockResolvedValue(null)
    const response = await app.handle(new Request('http://localhost/users/me'))
    expect(response.status).toBe(404)
  })
})
