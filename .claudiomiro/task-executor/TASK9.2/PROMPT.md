## PROMPT
Configure react-i18next with English and Brazilian Portuguese locales, including browser language detection.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack, architecture

**You MUST read AI_PROMPT.md before executing this task.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/frontend/src/i18n/index.ts`
- `/frontend/src/i18n/locales/en.json`
- `/frontend/src/i18n/locales/pt-BR.json`

### Patterns to Follow

**i18n setup (index.ts):**
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR }
    },
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: { escapeValue: false }
  })

export default i18n
```

**en.json structure:**
```json
{
  "auth": {
    "login": "Login",
    "signup": "Sign Up",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "submit": "Submit",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "errors": {
      "invalidEmail": "Invalid email format",
      "passwordTooShort": "Password must be at least 8 characters",
      "passwordMismatch": "Passwords do not match",
      "loginFailed": "Login failed. Check your credentials.",
      "signupFailed": "Signup failed. Please try again."
    }
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred"
  }
}
```

## LAYER
4

## PARALLELIZATION
Parallel with: [TASK9.1]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push
- Translation keys must be consistent between en and pt-BR
- No hardcoded strings in components (all use i18n)
