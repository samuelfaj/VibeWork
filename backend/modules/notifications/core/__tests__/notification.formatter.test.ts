import { describe, it, expect } from 'vitest'
import { formatNotificationResponse } from '../notification.formatter'

describe('formatNotificationResponse', () => {
  it('converts _id to string id', () => {
    const doc = {
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      userId: 'user-123',
      type: 'in-app' as const,
      message: 'Test message',
      read: false,
      createdAt: new Date('2025-01-01T12:00:00Z'),
    }

    const result = formatNotificationResponse(doc)

    expect(result.id).toBe('507f1f77bcf86cd799439011')
  })

  it('formats createdAt as ISO string', () => {
    const doc = {
      _id: { toString: () => '507f1f77bcf86cd799439011' },
      userId: 'user-123',
      type: 'email' as const,
      message: 'Test message',
      read: true,
      createdAt: new Date('2025-01-01T12:00:00Z'),
    }

    const result = formatNotificationResponse(doc)

    expect(result.createdAt).toBe('2025-01-01T12:00:00.000Z')
  })

  it('preserves all properties in response', () => {
    const doc = {
      _id: { toString: () => 'abc123' },
      userId: 'user-456',
      type: 'in-app' as const,
      message: 'Hello world',
      read: true,
      createdAt: new Date('2025-06-15T08:30:00Z'),
    }

    const result = formatNotificationResponse(doc)

    expect(result).toEqual({
      id: 'abc123',
      userId: 'user-456',
      type: 'in-app',
      message: 'Hello world',
      read: true,
      createdAt: '2025-06-15T08:30:00.000Z',
    })
  })
})
