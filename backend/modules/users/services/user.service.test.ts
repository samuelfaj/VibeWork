import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()
const mockWhere = vi.fn()

vi.mock('../../../src/infra/database/mysql', () => ({
  db: {
    insert: (...args: unknown[]) => {
      mockInsert(...args)
      return { values: vi.fn().mockResolvedValue(undefined) }
    },
    select: (...args: unknown[]) => {
      mockSelect(...args)
      return {
        from: (...a: unknown[]) => {
          mockFrom(...a)
          return {
            where: (...w: unknown[]) => mockWhere(...w),
          }
        },
      }
    },
  },
}))

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('findUserById returns user or null', async () => {
    mockWhere.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
        role: 'client',
        emailVerified: true,
        image: null,
      },
    ])
    const { UserService } = await import('./user.service')
    const user = await UserService.findUserById('u1')
    expect(user?.email).toBe('a@b.com')

    mockWhere.mockResolvedValue([])
    const missing = await UserService.findUserById('missing')
    expect(missing).toBeNull()
  })

  it('findUserByEmail returns user or null', async () => {
    mockWhere.mockResolvedValue([
      {
        id: 'u1',
        email: 'a@b.com',
        name: 'A',
        role: 'client',
        emailVerified: true,
        image: null,
      },
    ])
    const { UserService } = await import('./user.service')
    expect((await UserService.findUserByEmail('a@b.com'))?.id).toBe('u1')
    mockWhere.mockResolvedValue([])
    expect(await UserService.findUserByEmail('none@b.com')).toBeNull()
  })

  it('createUser inserts and returns created row', async () => {
    mockWhere.mockResolvedValue([
      {
        id: 'new-1',
        email: 'n@b.com',
        name: 'N',
        role: 'client',
        emailVerified: false,
        image: null,
      },
    ])
    const { UserService } = await import('./user.service')
    const created = await UserService.createUser({
      id: 'new-1',
      email: 'n@b.com',
      name: 'N',
      emailVerified: false,
      role: 'client',
    } as never)
    expect(created.id).toBe('new-1')
    expect(mockInsert).toHaveBeenCalled()
  })
})
