# Backend

Package: `@vibework/backend` · **Bun** + **ElysiaJS** · **MySQL only**

## Layout

```
backend/
  src/
    entrypoint.ts   # env + migrations + start
    index.ts        # HTTP listen
    app.ts          # module composition
    infra/          # mysql, auth, logger, env
    i18n/
  modules/
    users/
    notifications/
    health/
  migrations/
```

## Module shape

```
modules/<name>/
  index.ts
  routes/*.routes.ts
  services/*.service.ts   # export const XService = { … }
  schema/                 # Drizzle
```

No `controllers/`. No `models/` (Typegoose removed).

## Auth

| Piece       | Location                              |
| ----------- | ------------------------------------- |
| Better-Auth | `src/infra/auth.ts`                   |
| Guards      | `src/infra/auth-guard.ts`             |
| Auth HTTP   | `modules/users/routes/auth.routes.ts` |
| Profile     | `GET /users/me`                       |

## Scripts

```bash
bun run --filter @vibework/backend dev
bun run --filter @vibework/backend test
bun run --filter @vibework/backend db:migrate
bun run --filter @vibework/backend build:types
```

Golden path: **`modules/notifications`**.
