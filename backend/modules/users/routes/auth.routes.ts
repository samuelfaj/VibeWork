import { Elysia, type Context } from 'elysia'
import { auth } from '../../../src/infra/auth'
import { checkRateLimit } from '../../../src/infra/rate-limit'
import { getLanguageFromHeader, getTranslation } from '../../../src/i18n'
import { logger } from '../../../src/infra/logger'

const AUTH_RATE_LIMIT = 20
const AUTH_RATE_WINDOW_SECONDS = 60

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

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export const authRoutes = new Elysia().all('/api/auth/*', async (context) => {
  const path = new URL(context.request.url).pathname
  const isSensitive =
    path.includes('sign-in') || path.includes('sign-up') || path.includes('forget-password')

  if (isSensitive) {
    const key = `auth:${clientKey(context.request)}`
    const result = await checkRateLimit(key, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW_SECONDS)
    context.set.headers['X-RateLimit-Remaining'] = String(result.remaining)
    if (!result.allowed) {
      const lang = getLanguageFromHeader(context.request.headers.get('accept-language'))
      context.set.status = 429
      context.set.headers['Retry-After'] = String(result.retryAfterSeconds)
      logger.warn('auth rate limit exceeded', {
        action: path,
        requestId: (context as { requestId?: string }).requestId,
      })
      return {
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: getTranslation('errors.generic.tooManyRequests', lang),
        },
      }
    }
  }

  return betterAuthView(context)
})
