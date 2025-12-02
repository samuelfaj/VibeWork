import { Elysia } from 'elysia'
import { t, getLanguageFromHeader } from './index'

export const SUPPORTED_LOCALES = ['en', 'pt-BR'] as const
export const DEFAULT_LOCALE = 'en'

export function parseAcceptLanguage(header: string | null): string {
  return getLanguageFromHeader(header)
}

export const i18nMiddleware = new Elysia({ name: 'i18n-middleware' }).derive(
  { as: 'global' },
  ({ request }) => {
    const acceptLanguage = request.headers.get('accept-language')
    const locale = parseAcceptLanguage(acceptLanguage)

    return {
      locale,
      t: (key: string, options?: Record<string, unknown>) => t(key, { lng: locale, ...options }),
    }
  }
)

export default i18nMiddleware
