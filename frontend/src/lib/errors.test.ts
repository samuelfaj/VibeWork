import { describe, it, expect } from 'vitest'
import { AppError, hasErrorField, isRecord, toAppError } from './errors'

describe('errors helpers', () => {
  it('isRecord / hasErrorField', () => {
    expect(isRecord({ a: 1 })).toBe(true)
    expect(isRecord(null)).toBe(false)
    expect(hasErrorField({ error: { code: 'X' } })).toBe(true)
    expect(hasErrorField({ ok: true })).toBe(false)
  })

  it('toAppError wraps unknown values', () => {
    expect(toAppError(new AppError('a', 'A'))).toMatchObject({ code: 'A' })
    expect(toAppError(new Error('boom')).message).toBe('boom')
    expect(toAppError({ message: 'm', code: 'C' })).toMatchObject({ message: 'm', code: 'C' })
    expect(toAppError(42).message).toBe('Request failed')
  })
})
