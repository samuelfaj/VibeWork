import { Elysia } from 'elysia'
import { auth } from '../../../src/infra/auth'

export const authRoutes = new Elysia({ prefix: '/api/auth' }).all('/*', (ctx) =>
  auth.handler(ctx.request)
)
