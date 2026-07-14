import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Elysia } from 'elysia'

const mockGetSession = vi.fn()
const mockFindUserById = vi.fn()

vi.mock('./auth', () => ({
  auth: {
    api: {
      getSession: (args: unknown) => mockGetSession(args),
    },
  },
}))

vi.mock('../../modules/users/services/user.service', () => ({
  UserService: {
    findUserById: (id: string) => mockFindUserById(id),
  },
}))

vi.mock('../i18n', () => ({
  getLanguageFromHeader: () => 'en',
  getTranslation: (key: string) => key,
}))

describe('auth guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('requireAuth returns 401 when unauthenticated', async () => {
    mockGetSession.mockResolvedValue(null)
    const { requireAuth } = await import('./auth-guard')

    const app = new Elysia().use(requireAuth).get('/secure', () => ({ ok: true }))
    const response = await app.handle(new Request('http://localhost/secure'))

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('requireAuth attaches non-null user when session is valid', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    mockFindUserById.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      role: 'client',
      emailVerified: true,
      image: null,
    })
    const { requireAuth } = await import('./auth-guard')

    const app = new Elysia()
      .use(requireAuth)
      .get('/secure', ({ user }) => ({ id: user.id, role: user.role }))
    const response = await app.handle(new Request('http://localhost/secure'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ id: 'u1', role: 'client' })
  })

  it('requireRole returns 403 when role is not allowed', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    mockFindUserById.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      name: 'A',
      role: 'client',
      emailVerified: true,
      image: null,
    })
    const { requireRole } = await import('./auth-guard')

    const app = new Elysia().use(requireRole(['admin'])).get('/admin', () => ({ ok: true }))
    const response = await app.handle(new Request('http://localhost/admin'))

    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error.code).toBe('FORBIDDEN')
  })

  it('requireRole allows matching role with typed user', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'u1' } })
    mockFindUserById.mockResolvedValue({
      id: 'u1',
      email: 'admin@b.com',
      name: 'Admin',
      role: 'admin',
      emailVerified: true,
      image: null,
    })
    const { requireRole } = await import('./auth-guard')

    const app = new Elysia()
      .use(requireRole(['admin', 'manager']))
      .get('/admin', ({ user }) => ({ role: user.role }))
    const response = await app.handle(new Request('http://localhost/admin'))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ role: 'admin' })
  })
})
