import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('validateEnv', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('allows development without full secrets', async () => {
    const { validateEnv } = await import('./env')
    expect(() => validateEnv({ NODE_ENV: 'development' })).not.toThrow()
  })

  it('requires production secrets', async () => {
    const { validateEnv } = await import('./env')
    expect(() => validateEnv({ NODE_ENV: 'production' })).toThrow(/Missing required/)
  })

  it('passes production with required vars', async () => {
    const { validateEnv } = await import('./env')
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        BETTER_AUTH_SECRET: 'secret',
        MYSQL_HOST: 'localhost',
        MYSQL_DATABASE: 'db',
        MYSQL_USER: 'root',
        FRONTEND_URL: 'https://app.example.com',
      })
    ).not.toThrow()
  })
})
