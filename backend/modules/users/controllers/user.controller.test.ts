import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UserController } from './user.controller'

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

describe('UserController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('getMe', () => {
    it('should return user data when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        emailVerified: true,
        image: null,
        role: 'client' as const,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }

      mockFindUserById.mockResolvedValue(mockUser)

      const ctx = {
        user: {
          id: 'user-123',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'client' as const,
          emailVerified: true,
          image: null,
        },
        request: new Request('http://localhost', {
          headers: { Cookie: 'session=abc123' },
        }),
        set: { status: 200 },
      }

      const result = await UserController.getMe(ctx)

      expect(result).toEqual({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'client',
        emailVerified: true,
        image: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      })
    })

    it('should return 404 when user not found', async () => {
      mockFindUserById.mockResolvedValue(null)

      const ctx = {
        user: {
          id: 'user-123',
          email: 'john@example.com',
          name: 'John',
          role: 'client' as const,
          emailVerified: true,
          image: null,
        },
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      const result = await UserController.getMe(ctx)

      expect(ctx.set.status).toBe(404)
      expect(result).toEqual({
        error: { code: 'NOT_FOUND', message: 'errors.generic.notFound' },
      })
    })
  })
})
