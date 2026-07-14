# Frontend

Package: `@vibe/frontend`  
Stack: **React**, **Vite**, **TanStack Query**, **Ant Design**, **i18next**, **Eden Treaty**

## Layout

```
frontend/src/
  App.tsx                 # routes
  layouts/AppLayout.tsx   # shell
  features/
    auth/                 # session UI (special case for users domain)
    notifications/        # product golden path
  lib/
    api.ts                # Eden client + unwrapEden
    authClient.ts         # better-auth client (auth feature only)
    errors.ts
    query.ts
  i18n/locales/
    en.json
    pt-BR.json
    es.json
```

## Feature module

```
features/<name>/
  index.ts        # PUBLIC barrel — other features import only from here
  hooks.ts        # react-query + unwrapEden
  *Page.tsx
  *.test.ts
```

Rules:

- Cross-feature imports: **only** `@/features/<other>` (barrel).
- **No** raw `fetch` in features.
- **No** `authClient` outside `features/auth` (+ `lib/authClient.ts`).
- Other features use `useCurrentUser` / `RequireAuth` from `@/features/auth`.

## Talking to the API

```ts
import { api, unwrapEden } from '@/lib/api'

// In hooks:
const data = await unwrapEden(api.notifications.get())
```

Types come from the backend app type:

```ts
import type { App } from '@vibework/backend/app'
```

Generate declarations before FE typecheck:

```bash
bun run --filter @vibework/backend build:types
```

## i18n

- Locales: English, Brazilian Portuguese, Spanish.
- `en.json` is the source of truth; `bun run i18n:parity` enforces matching keys in `pt-BR` and `es`.
- Never hardcode user-visible strings in components.

```tsx
const { t } = useTranslation()
return <button>{t('common.submit')}</button>
```

## Auth UI

| Export                     | Role                     |
| -------------------------- | ------------------------ |
| `LoginForm` / `SignupForm` | Session forms            |
| `useCurrentUser`           | Current session user     |
| `RequireAuth`              | Route guard component    |
| `authClient`               | Only inside auth feature |

## Scripts

```bash
bun run --filter @vibe/frontend dev
bun run --filter @vibe/frontend test
bun run --filter @vibe/frontend typecheck
bun run --filter @vibe/frontend build
```

## Golden path

Copy **`features/notifications`** for a new product page + hooks.  
Copy **`features/auth`** only when touching login/session UX.
