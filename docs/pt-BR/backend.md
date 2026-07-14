# Backend

Pacote: `@vibework/backend` · **Bun** + **ElysiaJS** · **somente MySQL**

## Layout

```
backend/
  src/
    entrypoint.ts
    index.ts
    app.ts
    infra/          # mysql, auth, logger, env
    i18n/
  modules/
    users/
    notifications/
    health/
  migrations/
```

## Forma do módulo

```
modules/<name>/
  index.ts
  routes/*.routes.ts
  services/*.service.ts   # export const XService = { … }
  schema/                 # Drizzle
```

Sem `controllers/`. Sem `models/` Typegoose.

## Auth

| Peça        | Local                                 |
| ----------- | ------------------------------------- |
| Better-Auth | `src/infra/auth.ts`                   |
| Guards      | `src/infra/auth-guard.ts`             |
| HTTP auth   | `modules/users/routes/auth.routes.ts` |
| Perfil      | `GET /users/me`                       |

## Scripts

```bash
bun run --filter @vibework/backend dev
bun run --filter @vibework/backend test
bun run --filter @vibework/backend db:migrate
bun run --filter @vibework/backend build:types
```

Golden path: **`modules/notifications`**.
