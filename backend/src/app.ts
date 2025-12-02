import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { initI18n, getTranslation, getLanguageFromHeader, i18nMiddleware } from './i18n'
import { healthModule } from '../modules/health'
import { usersModule } from '../modules/users'
import { notificationsModule } from '../modules/notifications'
import { connectMongo } from './infra'

await initI18n()
await connectMongo()

export const app = new Elysia()
  .use(swagger({ path: '/swagger' }))
  .use(cors())
  .use(i18nMiddleware)
  .onError(({ error, code, request }) => {
    const lang = getLanguageFromHeader(request.headers.get('accept-language'))
    console.error(`[backend] Error: ${code}`, error)

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
  .use(healthModule)
  .use(usersModule)
  .use(notificationsModule)
  .get('/', () => ({ status: 'ok' }))

export type App = typeof app
