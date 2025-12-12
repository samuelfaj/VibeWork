import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UserController } from './user.controller'

// Mock auth
const mockGetSession = vi.fn()
vi.mock('../../../src/infra/auth', () => ({
  auth: {
    api: {
      getSession: ({ headers }: { headers: Headers }) => mockGetSession(headers),
    },
  },
}))

// Mock user service
const mockFindUserById = vi.fn()
vi.mock('../services/user.service', () => ({
  userService: {
    findUserById: (id: string) => mockFindUserById(id),
  },
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
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }

      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } })
      mockFindUserById.mockResolvedValue(mockUser)

      const ctx = {
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
        emailVerified: true,
        image: null,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      })
    })

    it('should return 401 when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null)

      const ctx = {
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      const result = await UserController.getMe(ctx)

      expect(ctx.set.status).toBe(401)
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('should return 404 when user not found', async () => {
      mockGetSession.mockResolvedValue({ user: { id: 'user-123' } })
      mockFindUserById.mockResolvedValue(null)

      const ctx = {
        request: new Request('http://localhost'),
        set: { status: 200 },
      }

      const result = await UserController.getMe(ctx)

      expect(ctx.set.status).toBe(404)
      expect(result).toEqual({ error: 'User not found' })
    })
  })
})
