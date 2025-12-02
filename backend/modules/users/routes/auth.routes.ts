import { Elysia, Context } from 'elysia'
import { auth } from '../../../src/infra/auth'

const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET']
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request)
  } else {
    context.set.status = 405
    return { error: 'Method not allowed' }
  }
}

export const authRoutes = new Elysia().all('/api/auth/*', betterAuthView)
