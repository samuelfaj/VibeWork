# Architecture

## Style

VibeWork is a **modular monolith** backend plus a **feature-based** React SPA:

- **One deploy** for the product (API image; optional separate worker process).
- Organize by **business domain**, not by horizontal global folders.
- **No microservices by default.** Module boundaries exist so extraction stays possible later, not as a day-one goal.

Agents and humans share the same rules in [AGENTS.md](../../AGENTS.md).

## High-level diagram

```
┌─────────────────────────────────────────────┐
│  Frontend (React + TanStack Query + Eden)   │
└─────────────────────┬───────────────────────┘
                      │ session cookie + Eden RPC
                      ▼
┌─────────────────────────────────────────────┐
│  Backend (Elysia + Bun)                     │
│  product modules: users, notifications, …   │
│  platform: health, pubsub transport         │
│  kernel: infra (db, redis, auth, logger…)   │
└───────┬─────────────┬─────────────┬─────────┘
        ▼             ▼             ▼
     MySQL         MongoDB       Redis
   (users…)    (notifications)  (cache only)
                      │
                      ▼
              Google Pub/Sub (events)
```

## Product slice (mirror)

Every product domain is a vertical slice:

| Layer            | Path                                           |
| ---------------- | ---------------------------------------------- |
| Contract         | `shared/contract/src/<domain>.ts`              |
| Backend module   | `backend/modules/<name>/`                      |
| Frontend feature | `frontend/src/features/<name>/`                |
| i18n namespace   | `frontend/src/i18n/locales/{en,pt-BR,es}.json` |
| E2E              | `e2e/playwright/tests/<name>.spec.ts`          |

**Special case:** domain **users** uses FE feature **`auth`** + contract **`user.ts`**.

Scaffold with:

```bash
bun run slice:new billing
# Mongo only when justified:
bun run slice:new reports --mongo
```

## Platform vs product

| Kind     | Examples                              | Notes                             |
| -------- | ------------------------------------- | --------------------------------- |
| Product  | users, notifications, future billing… | Full slice mirror                 |
| Platform | `health`, `pubsub`                    | No FE feature required            |
| Kernel   | `backend/src/infra/*`                 | Shared plumbing — not `slice:new` |

## Backend layering (inside a module)

```
routes → controller → service → schema (MySQL) | model (Mongo)
         optional: handlers/  (Pub/Sub domain logic)
```

- **Routes:** Elysia + contract schemas + `requireAuth` / `requireRole`
- **Controllers:** HTTP only (status, i18n errors, authz) — module objects
- **Services:** business rules — module objects (`export const XService = { … }`)
- **Exceptions:** process lifecycle classes (e.g. pull subscriber), external client factories (e.g. SES email)

## Auth and RBAC

- **Better-Auth** session cookies (no `X-User-Id` header auth).
- Guards: `requireAuth`, `requireRole` from `backend/src/infra/auth-guard`.
- Roles: `client` | `manager` | `admin`.
- Same endpoints for roles; **filter data by role** in service/controller.

## Type safety (FE ↔ BE)

1. TypeBox contract first.
2. Elysia validates with those schemas.
3. Frontend calls `unwrapEden(api…)` from `@/lib/api`.
4. App type for Eden: `import type { App } from '@vibework/backend/app'` (needs `bun run --filter @vibework/backend build:types`).

## Storage rules

| Store             | Use                                                     |
| ----------------- | ------------------------------------------------------- |
| MySQL + Drizzle   | Default for new domains                                 |
| Mongo + Typegoose | Only with real document needs (`--mongo`)               |
| Redis             | Cache, rate limit, idempotency — **never** as event bus |
| Pub/Sub           | Async domain events                                     |

## Process modes

| `PROCESS_MODE`  | Behavior                                                 |
| --------------- | -------------------------------------------------------- |
| `api` (default) | HTTP server only                                         |
| `worker`        | Background consumers (e.g. notification pull subscriber) |
| `all`           | Both in one process (handy for local/dev)                |

Boot path: `entrypoint.ts` → validate env → optional migrations → `index.ts`.

## Forbidden directions

- Multi-deploy “per module” without an explicit product decision
- Redis as message bus
- Raw `fetch` inside `frontend/src/features/**`
- Header-based fake auth
- Parallel docs that contradict `AGENTS.md`
