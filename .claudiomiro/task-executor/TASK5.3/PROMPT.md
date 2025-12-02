## PROMPT
Configure i18next for backend internationalization with English and Brazilian Portuguese locales. Integrate with Elysia error handler for localized responses.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack and conventions

**You MUST read AI_PROMPT.md before executing this task.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/src/i18n/index.ts`
- `/backend/src/i18n/locales/en.json`
- `/backend/src/i18n/locales/pt-BR.json`
- `/backend/src/i18n/__tests__/i18n.test.ts`

### Files This Task Will Modify
- `/backend/src/app.ts` - Add i18n error handler integration

### Patterns to Follow

**i18n setup (index.ts):**
```typescript
import i18next from 'i18next'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'

export async function initI18n(): Promise<void> {
  await i18next.init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR }
    }
  })
  console.log('[i18n] Initialized with languages: en, pt-BR')
}

export function t(key: string, options?: { lng?: string }): string {
  return i18next.t(key, options)
}

export function getLanguageFromHeader(acceptLanguage: string): string {
  if (acceptLanguage.includes('pt-BR') || acceptLanguage.includes('pt')) {
    return 'pt-BR'
  }
  return 'en'
}
```

**Locale structure (en.json):**
```json
{
  "errors": {
    "validation": "Validation failed",
    "unauthorized": "Unauthorized access",
    "forbidden": "Access forbidden",
    "notFound": "Resource not found",
    "serverError": "Internal server error",
    "badRequest": "Bad request",
    "conflict": "Resource conflict",
    "timeout": "Request timeout",
    "tooManyRequests": "Too many requests",
    "serviceUnavailable": "Service unavailable"
  },
  "health": {
    "ok": "Service is healthy",
    "ready": "Service is ready",
    "notReady": "Service is not ready"
  }
}
```

## LAYER
2

## PARALLELIZATION
Parallel with: [TASK5.2]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Support en and pt-BR locales
- Detect Accept-Language header
- Fallback to 'en' for unknown languages
