# Frontend

Pacote: `@vibe/frontend`  
Stack: **React**, **Vite**, **TanStack Query**, **Ant Design**, **i18next**, **Eden Treaty**

## Layout

```
frontend/src/
  App.tsx
  layouts/AppLayout.tsx
  features/
    auth/                 # UI de sessão (caso especial do domínio users)
    notifications/        # golden path de produto
  lib/
    api.ts                # cliente Eden + unwrapEden
    authClient.ts         # better-auth (somente feature auth)
    errors.ts
    query.ts
  i18n/locales/
    en.json
    pt-BR.json
    es.json
```

## Módulo de feature

```
features/<name>/
  index.ts        # barrel PÚBLICO — outras features importam só daqui
  hooks.ts        # react-query + unwrapEden
  *Page.tsx
  *.test.ts
```

Regras:

- Import entre features: **apenas** `@/features/<other>` (barrel).
- **Sem** `fetch` cru em features.
- **Sem** `authClient` fora de `features/auth` (+ `lib/authClient.ts`).
- Outras features usam `useCurrentUser` / `RequireAuth` de `@/features/auth`.

## Chamadas à API

```ts
import { api, unwrapEden } from '@/lib/api'

const data = await unwrapEden(api.notifications.get())
```

Tipos a partir do backend:

```ts
import type { App } from '@vibework/backend/app'
```

Gere declarações antes do typecheck do FE:

```bash
bun run --filter @vibework/backend build:types
```

## i18n

- Locales: inglês, português brasileiro, espanhol.
- `en.json` é a fonte da verdade; `bun run i18n:parity` exige as mesmas chaves em `pt-BR` e `es`.
- Nunca hardcode strings visíveis ao usuário.

```tsx
const { t } = useTranslation()
return <button>{t('common.submit')}</button>
```

## UI de auth

| Export                     | Papel                     |
| -------------------------- | ------------------------- |
| `LoginForm` / `SignupForm` | Formulários de sessão     |
| `useCurrentUser`           | Usuário da sessão         |
| `RequireAuth`              | Guard de rota             |
| `authClient`               | Só dentro da feature auth |

## Scripts

```bash
bun run --filter @vibe/frontend dev
bun run --filter @vibe/frontend test
bun run --filter @vibe/frontend typecheck
bun run --filter @vibe/frontend build
```

## Golden path

Copie **`features/notifications`** para página + hooks novos.  
Copie **`features/auth`** só ao mexer em login/sessão.
