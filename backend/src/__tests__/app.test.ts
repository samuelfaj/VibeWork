import { describe, it, expect } from 'vitest'
import { app } from '../app'

describe('app', () => {
  it('should create app instance', () => {
    expect(app).toBeDefined()
    expect(app.handle).toBeDefined()
  })

  it('should have swagger route registered', () => {
    const routes = app.routes
    const swaggerRoute = routes.find((r) => r.path === '/swagger')
    expect(swaggerRoute).toBeDefined()
  })

  it('should respond to root path', async () => {
    const response = await app.handle(new Request('http://localhost/'))
    const body = await response.json()
    expect(body).toEqual({ status: 'ok' })
  })
})
