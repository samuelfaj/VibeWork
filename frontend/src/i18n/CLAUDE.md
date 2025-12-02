# i18n - Internationalization

Frontend internationalization (i18n) configuration using i18next and react-i18next.

## Purpose

Provides multi-language support for the frontend application:

- **Automatic language detection**: Detects user's browser language
- **Translation management**: Centralized translation files
- **Component integration**: Easy-to-use React hooks for translations
- **Language persistence**: Stores user's language choice

## Supported Languages

- **en** - English
- **pt-BR** - Brazilian Portuguese
- **es** - Spanish

## Structure

```
i18n/
├── index.ts                  # i18next configuration
├── locales/
│   ├── en.json              # English translations
│   ├── pt-BR.json           # Portuguese (BR) translations
│   └── es.json              # Spanish translations
└── __tests__/               # Tests (if needed)
```

## Configuration

### `index.ts` - i18next Setup

```typescript
import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import ptBR from './locales/pt-BR.json'
import es from './locales/es.json'

i18next
  .use(LanguageDetector) // Detect browser language
  .use(initReactI18next) // React integration
  .init({
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR },
      es: { translation: es },
    },
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false, // Allow HTML in translations
    },
  })
```

**Key Configuration:**

- **LanguageDetector**: Automatically detects user's browser language
- **resources**: Translation files for each language
- **fallbackLng**: Language to use if detection fails or translation missing
- **interpolation**: Options for variable interpolation

**Detection Order:**

1. URL parameter (`/app?lng=pt-BR`)
2. Cookie value
3. HTML `lang` attribute
4. Browser navigator language
5. Fallback to English

**Persistence:**

Selected language is stored in localStorage under default detector key.

## Translation Files

### Structure

Translations are organized in a nested key structure:

```json
{
  "auth": {
    "login": "Login",
    "signup": "Sign Up",
    "errors": {
      "emailRequired": "Please enter your email",
      "passwordRequired": "Please enter your password"
    }
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred"
  }
}
```

### Adding Translations

1. Add key to `locales/en.json`:

   ```json
   {
     "dashboard": {
       "title": "Dashboard",
       "welcome": "Welcome, {{name}}"
     }
   }
   ```

2. Add same key to `locales/pt-BR.json`:

   ```json
   {
     "dashboard": {
       "title": "Painel",
       "welcome": "Bem-vindo, {{name}}"
     }
   }
   ```

3. Add same key to `locales/es.json`:
   ```json
   {
     "dashboard": {
       "title": "Panel",
       "welcome": "Bienvenido, {{name}}"
     }
   }
   ```

### Naming Conventions

- Use **dot notation** for nested keys: `auth.errors.emailRequired`
- Use **camelCase** for key names
- Group related translations by feature
- Keep keys descriptive but concise

**Good Examples:**

- `auth.login.submit` - Login button text
- `errors.validation.emailRequired` - Email validation error
- `common.loading` - Generic loading text

**Avoid:**

- `loginPageButtonText` - Too specific and long
- `s1` - Not descriptive
- `ALL_CAPS` - Use camelCase

## Using Translations in Components

### Basic Hook Usage

```typescript
import { useTranslation } from 'react-i18next'

export function LoginForm() {
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t('auth.login')}</h1>
      <input placeholder={t('auth.email')} />
      <button>{t('auth.submit')}</button>
    </div>
  )
}
```

### With Interpolation (Variables)

```typescript
const { t } = useTranslation()

// Translation key: "dashboard.welcome": "Welcome, {{name}}"
return <h1>{t('dashboard.welcome', { name: 'John' })}</h1>
// Renders: "Welcome, John"
```

### With Pluralization

```typescript
// Translation: "items": {
//   "one": "{{count}} item",
//   "other": "{{count}} items"
// }
return <p>{t('items', { count: 5 })}</p>
// Renders: "5 items"
```

### HTML in Translations

```typescript
// Enabled by escapeValue: false in config
const { t } = useTranslation()

// Translation key: "welcome": "Hello <b>{{name}}</b>"
return <p>{t('welcome', { name: 'John' })}</p>
// Renders: "Hello <b>John</b>"
```

## Changing Language

### Programmatically Switch Language

```typescript
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div>
      <button onClick={() => i18n.changeLanguage('en')}>English</button>
      <button onClick={() => i18n.changeLanguage('pt-BR')}>Português</button>
      <button onClick={() => i18n.changeLanguage('es')}>Español</button>
      <p>Current: {i18n.language}</p>
    </div>
  )
}
```

### Get Current Language

```typescript
import { useTranslation } from 'react-i18next'

export function LanguageDisplay() {
  const { i18n } = useTranslation()

  return <div>Language: {i18n.language}</div>
}
```

### List Supported Languages

```typescript
const { i18n } = useTranslation()

const languages = i18n.languages
// Returns: ['en', 'pt-BR', 'es']
```

## Complete Example

```typescript
import { useTranslation } from 'react-i18next'

export function App() {
  const { t, i18n } = useTranslation()

  return (
    <div>
      {/* Language Selector */}
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="pt-BR">Português</option>
        <option value="es">Español</option>
      </select>

      {/* Content using translations */}
      <h1>{t('common.title')}</h1>
      <p>{t('common.description', { name: 'John' })}</p>
    </div>
  )
}
```

## Best Practices

### Organization

- Group translations by feature or page
- Use consistent key naming across all languages
- Keep translation files in sync between languages

```json
// ✅ Good: Organized by feature
{
  "auth": { /* auth translations */ },
  "dashboard": { /* dashboard translations */ }
}

// ❌ Bad: Random organization
{
  "login": { },
  "p_desc": { },
  "s_btn": { }
}
```

### Completeness

- Always provide translations for all supported languages
- Use fallbackLng for missing translations
- Document where each translation is used

### Performance

- Lazy load translation files for large apps
- Use namespace splitting to reduce bundle size
- Avoid unnecessary interpolation complexity

## Common Patterns

### Conditional Translations

```typescript
const { t } = useTranslation()

const message = user.isAdmin ? t('admin.dashboard.title') : t('user.dashboard.title')
```

### Translation with Default

```typescript
const { t } = useTranslation()

// Falls back to key name if not found
return <p>{t('not_a_key_that_exists', { defaultValue: 'Default text' })}</p>
```

### Form Validation Errors

```typescript
const { t } = useTranslation()

const errors = {
  email: t('auth.errors.emailRequired'),
  password: t('auth.errors.passwordRequired'),
}
```

## Adding a New Language

1. Create new locale file: `locales/fr.json`
2. Add translations:
   ```json
   {
     "auth": {
       "login": "Connexion",
       "signup": "Inscription"
     }
   }
   ```
3. Register in `i18n/index.ts`:

   ```typescript
   import fr from './locales/fr.json'

   i18next.init({
     resources: {
       en: { translation: en },
       'pt-BR': { translation: ptBR },
       es: { translation: es },
       fr: { translation: fr },
     },
   })
   ```

4. Update language selector UI

## Testing with i18n

```typescript
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'

const mockI18n = i18next.createInstance()

test('renders translated text', () => {
  render(
    <I18nextProvider i18n={mockI18n}>
      <MyComponent />
    </I18nextProvider>
  )

  expect(screen.getByText('Expected translated text')).toBeInTheDocument()
})
```

## Related Documentation

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Browser Language Detector](https://github.com/i18next/i18next-browser-languageDetector)
