import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'
import { initI18n, t, getLanguageFromHeader } from './i18n'
import { healthRoutes } from './routes/health'

await initI18n()

export const app = new Elysia()
  .use(swagger({ path: '/swagger' }))
  .use(cors())
  .onError(({ error, code, request }) => {
    const lang = getLanguageFromHeader(request.headers.get('accept-language'))
    console.error(`[backend] Error: ${code}`, error)

    const errorMessages: Record<string, string> = {
      VALIDATION: t('errors.validation', { lng: lang }),
      NOT_FOUND: t('errors.notFound', { lng: lang }),
      INTERNAL_SERVER_ERROR: t('errors.serverError', { lng: lang }),
      INVALID_COOKIE_SIGNATURE: t('errors.unauthorized', { lng: lang }),
    }

    return { error: errorMessages[code] || t('errors.serverError', { lng: lang }) }
  })
  .use(healthRoutes)
  .get('/', () => ({ status: 'ok' }))

export type App = typeof app
