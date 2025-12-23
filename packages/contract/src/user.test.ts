import { Value } from '@sinclair/typebox/value'
import { describe, it, expect } from 'vitest'
import { SignupSchema, LoginSchema, UserResponseSchema } from './user'

describe('SignupSchema', () => {
  it('validates correct input', () => {
    const valid = { email: 'test@example.com', password: 'password123' }
    expect(Value.Check(SignupSchema, valid)).toBe(true)
  })

  it('rejects invalid email', () => {
    const invalid = { email: 'invalid-email', password: 'password123' }
    expect(Value.Check(SignupSchema, invalid)).toBe(false)
  })

  it('rejects email without @ symbol', () => {
    const invalid = { email: 'testexample.com', password: 'password123' }
    expect(Value.Check(SignupSchema, invalid)).toBe(false)
  })

  it('rejects short password (<8 chars)', () => {
    const invalid = { email: 'test@example.com', password: '1234567' }
    expect(Value.Check(SignupSchema, invalid)).toBe(false)
  })

  it('accepts password with exactly 8 chars', () => {
    const valid = { email: 'test@example.com', password: '12345678' }
    expect(Value.Check(SignupSchema, valid)).toBe(true)
  })
})

describe('LoginSchema', () => {
  it('validates correct input', () => {
    const valid = { email: 'test@example.com', password: 'pass' }
    expect(Value.Check(LoginSchema, valid)).toBe(true)
  })

  it('accepts any password length', () => {
    const valid = { email: 'test@example.com', password: 'a' }
    expect(Value.Check(LoginSchema, valid)).toBe(true)
  })

  it('rejects missing fields', () => {
    const invalid = { email: 'test@example.com' }
    expect(Value.Check(LoginSchema, invalid)).toBe(false)
  })
})

describe('UserResponseSchema', () => {
  it('validates complete user object', () => {
    const valid = {
      id: '123',
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00Z',
    }
    expect(Value.Check(UserResponseSchema, valid)).toBe(true)
  })

  it('rejects missing id', () => {
    const invalid = {
      email: 'test@example.com',
      createdAt: '2024-01-01T00:00:00Z',
    }
    expect(Value.Check(UserResponseSchema, invalid)).toBe(false)
  })
})
