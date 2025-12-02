## PROMPT
Complete backend i18n by adding error message translations (auth, validation, notification) for en and pt-BR. Create i18n middleware for Accept-Language header detection.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Modify
- `/backend/src/i18n/locales/en.json`
- `/backend/src/i18n/locales/pt-BR.json`
- `/backend/src/i18n/index.ts`

### Files This Task Will Create
- `/backend/src/i18n/middleware.ts`

### Error Message Categories

**Auth errors:**
```json
{
  "auth": {
    "invalidCredentials": "Invalid email or password",
    "userExists": "User already exists",
    "sessionExpired": "Session has expired"
  }
}
```

**Validation errors:**
```json
{
  "validation": {
    "invalidEmail": "Please enter a valid email address",
    "passwordTooShort": "Password must be at least 8 characters"
  }
}
```

**i18n middleware:**
```typescript
import { Elysia } from 'elysia'
import i18n from './index'

export const i18nMiddleware = new Elysia()
  .derive(({ request }) => {
    const acceptLanguage = request.headers.get('Accept-Language')
    const locale = parseAcceptLanguage(acceptLanguage) || 'en'
    return {
      t: (key: string) => i18n.t(key, { lng: locale })
    }
  })
```

## EXTRA DOCUMENTATION
- i18next: https://www.i18next.com/

## LAYER
3

## PARALLELIZATION
Parallel with: [TASK6, TASK7]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- No hardcoded error strings
- Fallback to 'en' locale
- Test with Accept-Language header
