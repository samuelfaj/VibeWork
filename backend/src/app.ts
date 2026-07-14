import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { Elysia } from 'elysia'
import { healthModule } from '../modules/health'
import { notificationsModule } from '../modules/notifications'
import { usersModule } from '../modules/users'
import { getTranslation, getLanguageFromHeader } from './i18n'
import { i18nMiddleware } from './i18n/middleware'
import { logger } from './infra/logger'
import { requestContext } from './infra/request-context'

const isProduction = process.env.NODE_ENV === 'production'
const enableSwagger =
  process.env.ENABLE_SWAGGER === 'true' || (!isProduction && process.env.ENABLE_SWAGGER !== 'false')

const corsOrigins = (
  process.env.CORS_ORIGINS ??
  process.env.FRONTEND_URL ??
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

/** Builds the HTTP app. One process, MySQL only. */
export function createApp() {
  const baseApp = new Elysia()
    .use(requestContext)
    .use(
      cors({
        origin: corsOrigins,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-Request-Id'],
      })
    )
    .use(i18nMiddleware)
    .onError(({ error, code, request, requestId }) => {
      const lang = getLanguageFromHeader(request.headers.get('accept-language'))
      logger.error('unhandled error', {
        requestId,
        code: String(code),
        error: error instanceof Error ? error.message : String(error),
      })

      const errorMessages: Record<string, string> = {
        VALIDATION: getTranslation('errors.validation.invalidFormat', lang),
        NOT_FOUND: getTranslation('errors.generic.notFound', lang),
        INTERNAL_SERVER_ERROR: getTranslation('errors.generic.serverError', lang),
        INVALID_COOKIE_SIGNATURE: getTranslation('errors.auth.unauthorized', lang),
      }

      return {
        error: {
          code,
          message: errorMessages[code] || getTranslation('errors.generic.serverError', lang),
        },
      }
    })

  const withOptionalSwagger = enableSwagger ? baseApp.use(swagger({ path: '/swagger' })) : baseApp

  return withOptionalSwagger
    .use(healthModule)
    .use(usersModule)
    .use(notificationsModule)
    .get('/', () => ({ status: 'ok' }))
}

export const app = createApp()

export type App = ReturnType<typeof createApp>
