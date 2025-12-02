import { describe, it, expect } from 'vitest'
import { Value } from '@sinclair/typebox/value'
import {
  NotificationTypeSchema,
  CreateNotificationSchema,
  NotificationSchema,
} from '../notification'

describe('NotificationTypeSchema', () => {
  it('accepts in-app', () => {
    expect(Value.Check(NotificationTypeSchema, 'in-app')).toBe(true)
  })

  it('accepts email', () => {
    expect(Value.Check(NotificationTypeSchema, 'email')).toBe(true)
  })

  it('rejects invalid type', () => {
    expect(Value.Check(NotificationTypeSchema, 'sms')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(Value.Check(NotificationTypeSchema, '')).toBe(false)
  })
})

describe('CreateNotificationSchema', () => {
  it('validates complete input', () => {
    const valid = {
      userId: 'user-123',
      type: 'in-app',
      message: 'Hello world',
    }
    expect(Value.Check(CreateNotificationSchema, valid)).toBe(true)
  })

  it('accepts email type', () => {
    const valid = {
      userId: 'user-123',
      type: 'email',
      message: 'Hello world',
    }
    expect(Value.Check(CreateNotificationSchema, valid)).toBe(true)
  })

  it('rejects missing required fields', () => {
    const invalid = { userId: 'user-123' }
    expect(Value.Check(CreateNotificationSchema, invalid)).toBe(false)
  })

  it('rejects invalid type', () => {
    const invalid = {
      userId: 'user-123',
      type: 'push',
      message: 'Hello',
    }
    expect(Value.Check(CreateNotificationSchema, invalid)).toBe(false)
  })
})

describe('NotificationSchema', () => {
  it('validates complete notification with read: false', () => {
    const valid = {
      id: 'notif-123',
      userId: 'user-123',
      type: 'in-app',
      message: 'You have a new message',
      read: false,
      createdAt: '2024-01-01T00:00:00Z',
    }
    expect(Value.Check(NotificationSchema, valid)).toBe(true)
  })

  it('validates complete notification with read: true', () => {
    const valid = {
      id: 'notif-123',
      userId: 'user-123',
      type: 'email',
      message: 'Welcome!',
      read: true,
      createdAt: '2024-01-01T00:00:00Z',
    }
    expect(Value.Check(NotificationSchema, valid)).toBe(true)
  })

  it('rejects missing read field', () => {
    const invalid = {
      id: 'notif-123',
      userId: 'user-123',
      type: 'in-app',
      message: 'Hello',
      createdAt: '2024-01-01T00:00:00Z',
    }
    expect(Value.Check(NotificationSchema, invalid)).toBe(false)
  })
})
