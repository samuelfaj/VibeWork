import { describe, it, expect, beforeAll } from 'vitest'
import { initI18n } from './i18n'
import { createApp } from './app'

/**
 * Lightweight app integration smoke (no external DBs required for healthz).
 */
describe('app integration smoke', () => {
  beforeAll(async () => {
    await initI18n()
  })

  it('healthz is live without dependency checks', async () => {
    const app = createApp()
    const response = await app.handle(new Request('http://localhost/healthz'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('ok')
  })
})
