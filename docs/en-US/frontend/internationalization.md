# Frontend Internationalization Guide

Guide to setting up and using multi-language support (i18n).

## Overview

VibeWork supports multiple languages:

- **English** (en) - Default
- **Portuguese (Brazil)** (pt-BR)

Easy to add more languages.

## i18next Setup

### Configuration

**Location:** `src/i18n/index.ts`

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ptBr from './locales/pt-BR.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBr },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
```

### Initialization

**In `main.tsx`:**

```typescript
import i18n from '@/i18n'

// Initialize before rendering
await i18n.init()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
)
```

## Translation Files

### Structure

```
src/i18n/locales/
├── en.json          # English translations
└── pt-BR.json       # Portuguese (Brazil) translations
```

### Format

Use hierarchical JSON structure:

```json
{
  "auth": {
    "login": "Login",
    "signup": "Sign Up",
    "email": "Email",
    "password": "Password",
    "email_required": "Email is required",
    "password_required": "Password is required"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading..."
  }
}
```

### Translation File Example

**en.json:**

```json
{
  "auth": {
    "welcome": "Welcome to VibeWork",
    "login_title": "Log In",
    "login_success": "Logged in successfully",
    "signup_title": "Create Account",
    "signup_success": "Account created successfully"
  }
}
```

**pt-BR.json:**

```json
{
  "auth": {
    "welcome": "Bem-vindo ao VibeWork",
    "login_title": "Entrar",
    "login_success": "Entrado com sucesso",
    "signup_title": "Criar Conta",
    "signup_success": "Conta criada com sucesso"
  }
}
```

## Using Translations in Components

### useTranslation Hook

```typescript
import { useTranslation } from 'react-i18next'

export const LoginForm = () => {
  const { t } = useTranslation()

  return (
    <form>
      <label>{t('auth.email')}</label>
      <input placeholder={t('auth.email')} />

      <label>{t('auth.password')}</label>
      <input type="password" placeholder={t('auth.password')} />

      <button>{t('auth.login')}</button>
    </form>
  )
}
```

### With Namespace

```typescript
const { t } = useTranslation('auth')

// Now use without prefix
<label>{t('email')}</label>
```

### Interpolation

For dynamic content:

```json
{
  "greeting": "Hello, {{name}}!"
}
```

```typescript
const { t } = useTranslation()

<p>{t('greeting', { name: user.name })}</p>
// Renders: "Hello, John!"
```

### Pluralization

For singular/plural forms:

```json
{
  "items_count": "You have {{count}} item",
  "items_count_plural": "You have {{count}} items"
}
```

```typescript
const { t } = useTranslation()

<p>{t('items_count', { count: 1 })}</p>
// Renders: "You have 1 item"

<p>{t('items_count', { count: 5 })}</p>
// Renders: "You have 5 items"
```

## Language Switching

### Get/Set Language

```typescript
import { useTranslation } from 'react-i18next'

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation()

  return (
    <select value={i18n.language} onChange={(e) => {
      i18n.changeLanguage(e.target.value)
    }}>
      <option value="en">English</option>
      <option value="pt-BR">Português</option>
    </select>
  )
}
```

### Detect Language Automatically

Language is detected from:

1. User's browser `Accept-Language` header
2. localStorage (if previously set)
3. Default (English)

Configure detection:

```typescript
i18n.use(LanguageDetector).init({
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
})
```

## Adding New Language

### Steps

1. Create translation file:

   ```bash
   cp src/i18n/locales/en.json src/i18n/locales/es.json
   ```

2. Translate strings in `es.json`

3. Add to i18n config:

   ```typescript
   import es from './locales/es.json'

   i18n.init({
     resources: {
       en: { translation: en },
       'pt-BR': { translation: ptBr },
       es: { translation: es },
     },
   })
   ```

4. Add to language switcher UI

## Translation Management

### Best Practices

- Use hierarchical keys
- Keep strings in code, not components
- Don't hardcode strings
- Use consistent naming
- Translate complete sentences (not words)

### Example: Bad vs Good

```typescript
// Bad: Hardcoded string
<button>Login</button>

// Good: Translated
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
<button>{t('auth.login')}</button>
```

### Translation Tools

Consider using:

- **i18n-ally** (VS Code extension) - Translation management
- **Weblate** - Collaborative translation platform
- **Crowdin** - Professional translation service
- **Lokalise** - Translation management platform

## Backend Internationalization

### Error Messages

Backend errors should include locale:

```typescript
// Backend
function getErrorMessage(code: string, locale: string) {
  const messages = {
    en: {
      INVALID_EMAIL: 'Invalid email address',
      PASSWORD_TOO_SHORT: 'Password must be 8+ characters',
    },
    'pt-BR': {
      INVALID_EMAIL: 'Endereço de email inválido',
      PASSWORD_TOO_SHORT: 'Senha deve ter 8+ caracteres',
    },
  }
  return messages[locale]?.[code] || messages.en[code]
}
```

### Request Localization

Include locale in request:

```typescript
const headers = {
  'Accept-Language': i18n.language,
}

const response = await client.api.endpoint.post(data, { headers })
```

## Format and Date Localization

### i18next-parser

Extract translatable strings:

```bash
bun add -D i18next-parser
```

### Format Numbers and Dates

```typescript
import { useTranslation } from 'react-i18next'

export const DateDisplay = ({ date }) => {
  const { i18n } = useTranslation()

  return (
    <span>
      {new Intl.DateTimeFormat(i18n.language).format(date)}
    </span>
  )
}
```

## Testing Translations

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { LoginForm } from './LoginForm'

it('should render English labels', () => {
  i18n.changeLanguage('en')
  render(
    <I18nextProvider i18n={i18n}>
      <LoginForm />
    </I18nextProvider>
  )

  expect(screen.getByText('Email')).toBeInTheDocument()
})

it('should render Portuguese labels', () => {
  i18n.changeLanguage('pt-BR')
  render(
    <I18nextProvider i18n={i18n}>
      <LoginForm />
    </I18nextProvider>
  )

  expect(screen.getByText('Email')).toBeInTheDocument()
})
```

### Key Existence Tests

Verify all keys are translated:

```typescript
import en from '@/i18n/locales/en.json'
import ptBr from '@/i18n/locales/pt-BR.json'

function getKeys(obj, prefix = '') {
  const keys = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object') {
      keys.push(...getKeys(value, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

describe('Translations', () => {
  it('should have all keys translated', () => {
    const enKeys = getKeys(en)
    const ptBrKeys = getKeys(ptBr)

    expect(new Set(ptBrKeys)).toEqual(new Set(enKeys))
  })
})
```

## SEO Considerations

### Hreflang Tags

For multi-language SEO:

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/" />
<link rel="alternate" hreflang="pt-BR" href="https://example.com/pt-BR/" />
```

### Language in HTML

```html
<html lang="en">
  <!-- or -->
  <html lang="pt-BR"></html>
</html>
```

Update with current language:

```typescript
useEffect(() => {
  document.documentElement.lang = i18n.language
}, [i18n.language])
```

## Performance Optimization

### Lazy Load Translations

For large apps with many languages:

```typescript
i18n.init({
  ns: ['auth', 'common'],
  defaultNS: 'common',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
})
```

### Code Splitting

Load only needed language:

```typescript
import en from './locales/en.json'
import ptBr from './locales/pt-BR.json?raw'

// Parse only when needed
const ptBrTranslations = JSON.parse(ptBr)
```

## Common Issues

### Missing Translations

Check console for missing keys:

```
i18next::translator: key "auth.invalid_email" for language "pt-BR" does not exist
```

### Language Not Changing

Ensure language is valid ISO code (en, pt-BR, etc.)

### Performance Issues

- Limit translation file size
- Use lazy loading
- Cache translations in localStorage

## Documentation

- [i18next Official Docs](https://www.i18next.com/)
- [React i18next](https://react.i18next.com/)
- [Translation File Structure](https://www.i18next.com/misc/json-format)

---

**Last Updated**: December 2024
