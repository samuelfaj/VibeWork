# @vibe/frontend

React + Vite frontend with type-safe Eden RPC and TanStack Query.

## Purpose

Single-page application for the VibeWork platform, featuring:

- **Eden RPC**: Type-safe API calls inferred from backend Elysia routes
- **TanStack Query**: Server state management with caching
- **react-i18next**: Internationalization (en, pt-BR, es)
- **Feature-based architecture**: Modular feature folders

## Structure

```
frontend/
├── src/
│   ├── App.tsx                 # Main app with auth form switching
│   ├── main.tsx                # Entry point with QueryClientProvider
│   ├── vite-env.d.ts           # Vite types
│   ├── features/
│   │   └── auth/
│   │       ├── LoginForm.tsx   # Login form with i18n
│   │       ├── SignupForm.tsx  # Signup form with validation
│   │       ├── hooks.ts        # TanStack Query mutations
│   │       └── index.ts        # Module exports
│   ├── i18n/
│   │   ├── index.ts            # i18next config
│   │   └── locales/
│   │       ├── en.json         # English
│   │       ├── pt-BR.json      # Portuguese
│   │       └── es.json         # Spanish
│   └── lib/
│       ├── api.ts              # Eden treaty client
│       └── query.ts            # QueryClient setup
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Type check
bun run typecheck

# Production build
bun run build

# Preview production build
bun run preview

# Lint
bun run lint
```

## API Communication (CRITICAL)

**ALWAYS use Eden Treaty for API calls.** Never use raw `fetch` directly.

Eden provides:

- Full type-safety inferred from backend Elysia routes
- Automatic `Accept-Language` header from i18n
- Consistent error handling
- IDE autocomplete for all endpoints

### Eden Client Setup

The Eden client is configured in `src/lib/api.ts` with automatic i18n headers:

```typescript
import { treaty } from '@elysiajs/eden'
import i18n from '@/i18n'

export const api = treaty<App>(baseUrl, {
  headers: () => ({
    'Accept-Language': i18n.language || 'pt-BR',
  }),
})
```

### Using Eden in Hooks (Preferred Pattern)

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

// GET request - fully type-safe
export const useProducts = () =>
  useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await api.products.get()
      if (error) throw new Error(error.value.message)
      return data
    },
  })

// POST request with body
export const useCreateProduct = () =>
  useMutation({
    mutationFn: async (body: { name: string; price: number }) => {
      const { data, error } = await api.products.post(body)
      if (error) throw new Error(error.value.message)
      return data
    },
  })

// Dynamic route parameters
export const useProduct = (id: string) =>
  useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await api.products({ id }).get()
      if (error) throw new Error(error.value.message)
      return data
    },
  })

// Query parameters
export const useFilteredProducts = (category: string) =>
  useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const { data, error } = await api.products.get({
        query: { category },
      })
      if (error) throw new Error(error.value.message)
      return data
    },
  })
```

### Eden Treaty API Reference

```typescript
// GET request
const { data, error, status } = await api.endpoint.get()

// POST with body
const { data, error } = await api.endpoint.post({ name: 'value' })

// Dynamic path params - use function call syntax
const { data, error } = await api.users({ id: '123' }).get()

// Query parameters
const { data, error } = await api.products.get({
  query: { category: 'electronics', limit: 10 },
})

// Custom headers per request
const { data, error } = await api.admin.get({
  headers: { 'X-Admin-Token': 'secret' },
})

// File upload with FormData
const formData = new FormData()
formData.append('file', file)
const { data, error } = await api.upload.post(formData)
```

### Error Handling Pattern

```typescript
const { data, error, status } = await api.products.get()

if (error) {
  switch (error.status) {
    case 400:
      throw new Error('Invalid request')
    case 401:
      throw new Error('Unauthorized')
    case 404:
      throw new Error('Not found')
    default:
      throw new Error(error.value?.message || 'Unknown error')
  }
}

return data
```

## Adding Features

1. Create a feature folder in `src/features/` (e.g., `src/features/products/`)
2. Add components, hooks, and types:
   ```
   src/features/products/
   ├── ProductList.tsx      # UI component
   ├── ProductForm.tsx      # Form component
   ├── hooks.ts             # TanStack Query hooks
   └── index.ts             # Barrel export
   ```
3. Create hooks using TanStack Query:

   ```typescript
   import { useMutation, useQuery } from '@tanstack/react-query'
   import { api } from '@/lib/api'

   export const useProducts = () =>
     useQuery({
       queryKey: ['products'],
       queryFn: () => api.products.get(),
     })

   export const useCreateProduct = () =>
     useMutation({
       mutationFn: (data: ProductInput) => api.products.post(data),
     })
   ```

4. Export from `index.ts`:
   ```typescript
   export * from './ProductList'
   export * from './hooks'
   ```

## Adding Translations

1. Add keys to `src/i18n/locales/en.json`:
   ```json
   {
     "products": {
       "title": "Products",
       "create": "Create Product"
     }
   }
   ```
2. Add corresponding keys to `src/i18n/locales/pt-BR.json` and `src/i18n/locales/es.json`
3. Use in components:

   ```typescript
   import { useTranslation } from 'react-i18next'

   const { t } = useTranslation()
   return <h1>{t('products.title')}</h1>
   ```

## Environment Variables

| Variable       | Description     | Default                 |
| -------------- | --------------- | ----------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

Create `.env.local` for local overrides:

```
VITE_API_URL=http://localhost:3000
```

## Key Dependencies

- `react` ^18.2.0 - UI library
- `@elysiajs/eden` ^1.0.0 - Type-safe RPC client
- `@tanstack/react-query` ^5.0.0 - Server state management
- `react-i18next` ^14.0.0 - Internationalization
- `@vibe-code/contract` workspace:\* - Shared schemas
- `@vibe/ui` workspace:\* - Shared UI components

## Internationalization (i18n) Requirements

**CRITICAL**: All user-facing text MUST be translated to all three supported languages. No hardcoded strings in components.

### Supported Locales

| Code    | Language             | Required |
| ------- | -------------------- | -------- |
| `en`    | English              | Yes      |
| `pt-BR` | Brazilian Portuguese | Yes      |
| `es`    | Spanish              | Yes      |

### Mandatory i18n Checklist

When adding any new UI text:

- [ ] Add key to `src/i18n/locales/en.json`
- [ ] Add key to `src/i18n/locales/pt-BR.json`
- [ ] Add key to `src/i18n/locales/es.json`
- [ ] Use `t()` function in component, never hardcode strings

### Example

```typescript
// WRONG - hardcoded string
<button>Submit</button>

// CORRECT - translated
const { t } = useTranslation()
<button>{t('common.submit')}</button>
```
