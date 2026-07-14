# Shared contract

Package: `@vibe-code/contract`  
Location: `shared/contract/`

## Purpose

TypeBox schemas are the **single source of truth** for:

- Elysia request/response validation
- Shared TypeScript types for frontend and backend
- Contract unit tests (`Value.Check`)

## Layout

```
shared/contract/src/
  index.ts
  user.ts
  user.test.ts
  notification.ts
  notification.test.ts
  …
```

## Workflow

1. Add or change schema in `shared/contract/src/<domain>.ts`.
2. Add/adjust co-located `*.test.ts`.
3. Export from `index.ts` if needed.
4. Build: `bun run --filter @vibe-code/contract build`.
5. Wire backend routes + frontend hooks.
6. Refresh Eden types: `bun run --filter @vibework/backend build:types`.

## Rules

- Contract **before** route **before** UI.
- Prefer explicit schemas for `body`, `query`, and `response`.
- Do not bypass contract with `as never` on product routes.
