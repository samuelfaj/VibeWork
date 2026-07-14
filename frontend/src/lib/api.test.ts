import { describe, it, expect } from 'vitest'
import { AppError } from './errors'
import { unwrapEden } from './api'

describe('unwrapEden', () => {
  it('returns data on success', async () => {
    const data = await unwrapEden(Promise.resolve({ data: { id: '1' }, error: null }))
    expect(data).toEqual({ id: '1' })
  })

  it('throws AppError when eden error is set', async () => {
    await expect(
      unwrapEden(
        Promise.resolve({
          data: null,
          error: { message: 'nope', code: 'X' },
          status: 500,
        })
      )
    ).rejects.toBeInstanceOf(AppError)
  })

  it('throws when body contains error field', async () => {
    await expect(
      unwrapEden(
        Promise.resolve({
          data: { error: { code: 'FORBIDDEN', message: 'no' } },
          error: null,
          status: 403,
        })
      )
    ).rejects.toMatchObject({ code: 'FORBIDDEN', message: 'no' })
  })

  it('throws EMPTY_RESPONSE when data is null without error', async () => {
    await expect(
      unwrapEden(Promise.resolve({ data: null, error: null, status: 204 }))
    ).rejects.toMatchObject({ code: 'EMPTY_RESPONSE' })
  })
})
