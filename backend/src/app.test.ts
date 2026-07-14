import { describe, it, expect, beforeAll } from 'vitest'
import { initI18n } from './i18n'
import { createApp } from './app'

describe('app', () => {
  beforeAll(async () => {
    await initI18n()
  })

  it('should create app instance', () => {
    const app = createApp()
    expect(app).toBeDefined()
    expect(app.handle).toBeDefined()
  })

  it('should have swagger route registered in non-production', () => {
    const app = createApp()
    const routes = app.routes
    const swaggerRoute = routes.find((r) => r.path === '/swagger' || r.path.startsWith('/swagger'))
    expect(swaggerRoute).toBeDefined()
  })

  it('should respond to root path', async () => {
    const app = createApp()
    const response = await app.handle(new Request('http://localhost/'))
    const body = await response.json()
    expect(body).toEqual({ status: 'ok' })
  })

  it('should respond to healthz with mode', async () => {
    const app = createApp()
    const response = await app.handle(new Request('http://localhost/healthz'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.status).toBe('ok')
    expect(typeof body.mode).toBe('string')
  })
})
