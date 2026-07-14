# AGENTS.md — VibeWork (canonical for AI agents)

**This is the only architecture doc agents must follow.** If anything conflicts, **this file wins**.

Team: **2 people + AI agents**. Prefer the simplest design that works. One deploy. No platform sprawl.

---

## 0) Hard gates

```bash
bun run feature:check          # banlist + i18n + types + unit + BE coverage
bun run feature:done <name>    # slice structure + feature:check
```

| Command                    | Purpose                                   |
| -------------------------- | ----------------------------------------- |
| `bun run slice:new <name>` | Scaffold product slice (MySQL) + wire app |
| `bun run feature:map`      | Regenerate `FEATURE_MAP.md`               |
| `bun run banlist`          | Forbidden patterns                        |
| `bun run i18n:parity`      | en / pt-BR / es key parity                |
| `bun run test:e2e`         | Playwright only                           |

**Definition of Done = `feature:done <name>` exit 0.**

Playbooks: [`docs/agents/`](docs/agents/). Inventory: [`FEATURE_MAP.md`](FEATURE_MAP.md).

---

## 1) Architecture (keep it tiny)

### Style

- **Modular monolith** + **feature-based SPA**
- **One process** (HTTP API). No workers. No PROCESS_MODE.
- **One database: MySQL + Drizzle.** No Mongo, no Redis, no Pub/Sub.
- Organize by **domain**, not global controllers/services trees.
- Layers inside a feature: **`routes → service → schema`** (no controller layer).

### Product slice mirror

| Layer    | Path                                           |
| -------- | ---------------------------------------------- |
| Contract | `shared/contract/src/<key>.ts`                 |
| Backend  | `backend/modules/<name>/`                      |
| Frontend | `frontend/src/features/<name>/`                |
| i18n     | `frontend/src/i18n/locales/{en,pt-BR,es}.json` |
| E2E      | `e2e/playwright/tests/<name>.spec.ts`          |

**Special case:** domain **users** = BE `modules/users` + FE `features/auth` + contract `user.ts`.

### Platform (do not `slice:new`)

| Area       | Location                                                 |
| ---------- | -------------------------------------------------------- |
| Kernel     | `backend/src/infra/` (mysql, auth, logger, env)          |
| Health     | `backend/modules/health`                                 |
| Shell      | `backend/src/app.ts`, `frontend/src/App.tsx`, `layouts/` |
| API client | `frontend/src/lib/api.ts` (`api`, `unwrapEden`)          |

### Module layout

```
backend/modules/<name>/
  index.ts
  routes/*.routes.ts    # Elysia + requireAuth + call service
  services/*.service.ts # business rules (module objects)
  schema/               # Drizzle/MySQL only
```

### Service pattern

```ts
export const FooService = {
  async list() {
    /* … */
  },
  async create(input) {
    /* … */
  },
}
```

- **No** `class` domain services, **no** static methods, **no** `new FooService()`.
- Routes call services (or thin inline logic). **No controllers.**
- Mock in tests: `vi.mock('…/foo.service', () => ({ FooService: { … } }))`.

Golden copies: `NotificationService`, `UserService`, `features/notifications`.

### Auth

- Better-Auth **session cookies**
- `requireAuth` / `requireRole` from `backend/src/infra/auth-guard` → `user` non-null
- Roles: `client` | `manager` | `admin` — same endpoints, filter by role
- FE: only `features/auth` uses `authClient`; others use `useCurrentUser` / `RequireAuth`
- **Never** `X-User-Id` auth

### FE ↔ BE types

1. Contract TypeBox first
2. Elysia uses schemas for body/query/response
3. FE: `unwrapEden(api…)` from `@/lib/api`
4. `import type { App } from '@vibework/backend/app'` after `bun run --filter @vibework/backend build:types`
5. No `as never` on product routes; no `fetch` in `features/**`

### i18n

- UI: en + pt-BR + es (`frontend/src/i18n/locales/`)
- API errors: `backend/src/i18n/locales/` (keep thin)
- Never hardcode user-visible UI strings

### Testing

| Layer                              | When                    |
| ---------------------------------- | ----------------------- |
| Contract `Value.Check`             | Schema changes          |
| Service + route unit               | Domain logic            |
| Integration (MySQL testcontainers) | Persistence when needed |
| Playwright E2E                     | User-facing flows       |
| FE unit                            | hooks + unwrapEden      |

Co-locate `*.test.ts`. **No Stagehand.**

### Forbidden

- Mongo / Redis / Pub/Sub / worker processes
- Microservices / multi-deploy per module
- Controllers folder for new code
- `fetch` in features; header auth; `as never` on routes
- Commits with `--no-verify`
- Drive-by refactors; docs that override this file

Banlist enforces several of these via `bun run banlist`.

---

## 2) How to add a feature

```bash
bun run slice:new billing
# implement SLOT comments only (schema + service + routes + FE hooks/page)
bun run --filter @vibe-code/contract build
bun run --filter @vibework/backend build:types
bun run feature:done billing
```

### Frontend feature

```
frontend/src/features/<name>/
  index.ts      # public barrel only
  hooks.ts      # unwrapEden + react-query
  *Page.tsx
```

Cross-feature imports: **only** `@/features/<other>` barrels.

---

## 3) Commands

```bash
bun install
docker compose --profile infra up -d   # MySQL only
cp .env.example .env
bun run dev
bun run --filter @vibework/backend db:migrate
bun run typecheck && bun run test
bun run feature:check
```

---

## 4) Language

| Asset      | Rule                          |
| ---------- | ----------------------------- |
| Code       | English                       |
| Commits    | Conventional Commits, English |
| UI strings | i18n en + pt-BR + es          |
| This file  | English                       |

---

## 5) Agent rules

1. Read this file first.
2. Prefer `slice:new` over hand-rolled folders.
3. Contract → route/service → UI.
4. Smallest change that passes `feature:done` / `feature:check`.
5. No new infrastructure without a human asking.
6. When unsure, copy **notifications**.

---

_End of canonical agent instructions._
