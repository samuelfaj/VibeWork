import i18next from 'i18next'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'
import es from './locales/es.json'

let initialized = false

export async function initI18n(): Promise<void> {
  if (initialized) return

  await i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR },
      es: { translation: es },
    },
    interpolation: {
      escapeValue: false,
    },
  })

  initialized = true
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, options)
}

export function getTranslation(
  key: string,
  locale: string,
  options?: Record<string, unknown>
): string {
  return i18next.t(key, { lng: locale, ...options })
}

export function getLanguageFromHeader(acceptLanguage: string | null | undefined): string {
  if (!acceptLanguage) return 'en'

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';q=')
      return {
        code: code.trim(),
        q: qValue ? parseFloat(qValue) : 1,
      }
    })
    .sort((a, b) => b.q - a.q)

  for (const { code } of languages) {
    if (code === 'pt-BR' || code.startsWith('pt')) return 'pt-BR'
    if (code === 'en' || code.startsWith('en')) return 'en'
    if (code === 'es' || code.startsWith('es')) return 'es'
  }

  return 'en'
}

export { i18nMiddleware } from './middleware'
