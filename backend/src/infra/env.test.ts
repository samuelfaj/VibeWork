import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('validateEnv', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('allows incomplete env outside production', async () => {
    const { validateEnv } = await import('./env')
    expect(() => validateEnv({ NODE_ENV: 'development' })).not.toThrow()
  })

  it('throws in production when secrets are missing', async () => {
    const { validateEnv } = await import('./env')
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
      })
    ).toThrow(/BETTER_AUTH_SECRET/)
  })

  it('passes production when required vars are set', async () => {
    const { validateEnv } = await import('./env')
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        BETTER_AUTH_SECRET: 'x'.repeat(32),
        MYSQL_HOST: 'db',
        MYSQL_DATABASE: 'vibe',
        MYSQL_USER: 'app',
        FRONTEND_URL: 'https://app.example.com',
      })
    ).not.toThrow()
  })
})
