import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockSelect = vi.fn()
const mockUpdate = vi.fn()
const mockFrom = vi.fn()
const mockWhere = vi.fn()
const mockOrderBy = vi.fn()
const mockLimit = vi.fn()
const mockSet = vi.fn()

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
            where: (...w: unknown[]) => {
              mockWhere(...w)
              return {
                limit: (...l: unknown[]) => mockLimit(...l),
                orderBy: (...o: unknown[]) => mockOrderBy(...o),
              }
            },
            orderBy: (...o: unknown[]) => mockOrderBy(...o),
          }
        },
      }
    },
    update: (...args: unknown[]) => {
      mockUpdate(...args)
      return {
        set: (...s: unknown[]) => {
          mockSet(...s)
          return { where: vi.fn().mockResolvedValue(undefined) }
        },
      }
    },
  },
}))

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('create inserts and returns formatted row', async () => {
    const row = {
      id: 'id-1',
      userId: 'u1',
      type: 'in-app' as const,
      message: 'hi',
      read: false,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    }
    mockLimit.mockResolvedValue([row])
    const { NotificationService } = await import('./notification.service')
    const result = await NotificationService.create({
      userId: 'u1',
      type: 'in-app',
      message: 'hi',
    })
    expect(result.id).toBeTruthy()
    expect(result.message).toBe('hi')
    expect(result.createdAt).toBe('2024-01-01T00:00:00.000Z')
    expect(mockInsert).toHaveBeenCalled()
  })

  it('getUserNotifications maps list', async () => {
    mockOrderBy.mockResolvedValue([
      {
        id: 'id-1',
        userId: 'u1',
        type: 'email',
        message: 'm',
        read: true,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      },
    ])
    const { NotificationService } = await import('./notification.service')
    const list = await NotificationService.getUserNotifications('u1')
    expect(list).toHaveLength(1)
    expect(list[0]?.type).toBe('email')
  })

  it('markAsRead returns null when missing', async () => {
    mockLimit.mockResolvedValue([])
    const { NotificationService } = await import('./notification.service')
    const result = await NotificationService.markAsRead('missing', 'u1')
    expect(result).toBeNull()
  })
})
