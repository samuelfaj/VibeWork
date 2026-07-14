import { Elysia, type Context } from 'elysia'
import { auth } from '../../../src/infra/auth'

const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ['POST', 'GET']
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request)
  }
  context.set.status = 405
  return {
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed',
    },
  }
}

/** Better-Auth session endpoints. No Redis rate-limit — keep auth path simple. */
export const authRoutes = new Elysia().all('/api/auth/*', (context) => betterAuthView(context))
