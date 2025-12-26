# Guia de Internacionalização do Frontend

Guia para setup e uso de suporte multi-idioma (i18n).

## Visão Geral

VibeWork suporta múltiplos idiomas:

- **English** (en) - Padrão
- **Portuguese (Brazil)** (pt-BR)

Fácil adicionar mais idiomas.

## Setup do i18next

### Configuração

**Localização:** `src/i18n/index.ts`

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

### Inicialização

**Em `main.tsx`:**

```typescript
import i18n from '@/i18n'

// Inicialize antes de renderizar
await i18n.init()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
)
```

## Arquivos de Tradução

### Estrutura

```
src/i18n/locales/
├── en.json          # Traduções em Inglês
└── pt-BR.json       # Traduções em Português (Brasil)
```

### Formato

Use estrutura JSON hierárquica:

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

### Exemplo de Arquivo de Tradução

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

## Usando Traduções em Componentes

### Hook useTranslation

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

### Com Namespace

```typescript
const { t } = useTranslation('auth')

// Agora use sem prefixo
<label>{t('email')}</label>
```

### Interpolação

Para conteúdo dinâmico:

```json
{
  "greeting": "Hello, {{name}}!"
}
```

```typescript
const { t } = useTranslation()

<p>{t('greeting', { name: user.name })}</p>
// Renderiza: "Hello, John!"
```

### Pluralização

Para formas singular/plural:

```json
{
  "items_count": "You have {{count}} item",
  "items_count_plural": "You have {{count}} items"
}
```

```typescript
const { t } = useTranslation()

<p>{t('items_count', { count: 1 })}</p>
// Renderiza: "You have 1 item"

<p>{t('items_count', { count: 5 })}</p>
// Renderiza: "You have 5 items"
```

## Troca de Idioma

### Get/Set de Idioma

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

### Detectar Idioma Automaticamente

Idioma é detectado de:

1. Header `Accept-Language` do navegador do usuário
2. localStorage (se previamente definido)
3. Padrão (Inglês)

Configure detecção:

```typescript
i18n.use(LanguageDetector).init({
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
})
```

## Adicionando Novo Idioma

### Passos

1. Crie arquivo de tradução:

   ```bash
   cp src/i18n/locales/en.json src/i18n/locales/es.json
   ```

2. Traduza strings em `es.json`

3. Adicione à config do i18n:

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

4. Adicione ao UI do seletor de idioma

## Gerenciamento de Tradução

### Melhores Práticas

- Use chaves hierárquicas
- Mantenha strings no código, não em componentes
- Não hardcode strings
- Use nomeação consistente
- Traduza frases completas (não palavras)

### Exemplo: Ruim vs Bom

```typescript
// Ruim: String hardcoded
<button>Login</button>

// Bom: Traduzido
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
<button>{t('auth.login')}</button>
```

### Ferramentas de Tradução

Considere usar:

- **i18n-ally** (Extensão VS Code) - Gerenciamento de tradução
- **Weblate** - Plataforma de tradução colaborativa
- **Crowdin** - Serviço de tradução profissional
- **Lokalise** - Plataforma de gerenciamento de tradução

## Internacionalização do Backend

### Mensagens de Erro

Erros do backend devem incluir locale:

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

### Localização de Requisição

Inclua locale em requisição:

```typescript
const headers = {
  'Accept-Language': i18n.language,
}

const response = await client.api.endpoint.post(data, { headers })
```

## Localização de Formato e Data

### i18next-parser

Extrair strings traduzíveis:

```bash
bun add -D i18next-parser
```

### Formatar Números e Datas

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

## Testando Traduções

### Testes Unitários

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

### Testes de Existência de Chave

Verifique que todas as chaves são traduzidas:

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

## Considerações de SEO

### Tags Hreflang

Para SEO multi-idioma:

```html
<link rel="alternate" hreflang="en" href="https://example.com/en/" />
<link rel="alternate" hreflang="pt-BR" href="https://example.com/pt-BR/" />
```

### Idioma em HTML

```html
<html lang="en">
  <!-- ou -->
  <html lang="pt-BR"></html>
</html>
```

Atualize com idioma atual:

```typescript
useEffect(() => {
  document.documentElement.lang = i18n.language
}, [i18n.language])
```

## Otimização de Performance

### Lazy Load de Traduções

Para apps grandes com muitos idiomas:

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

Carregue apenas idioma necessário:

```typescript
import en from './locales/en.json'
import ptBr from './locales/pt-BR.json?raw'

// Parse apenas quando necessário
const ptBrTranslations = JSON.parse(ptBr)
```

## Problemas Comuns

### Traduções Ausentes

Verifique console para chaves ausentes:

```
i18next::translator: key "auth.invalid_email" for language "pt-BR" does not exist
```

### Idioma Não Muda

Certifique-se de que idioma é código ISO válido (en, pt-BR, etc.)

### Problemas de Performance

- Limite tamanho de arquivo de tradução
- Use lazy loading
- Cache traduções em localStorage

## Documentação

- [i18next Official Docs](https://www.i18next.com/)
- [React i18next](https://react.i18next.com/)
- [Translation File Structure](https://www.i18next.com/misc/json-format)

---

**Última Atualização**: Dezembro 2024
