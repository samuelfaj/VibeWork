# AGENTS.md — VibeWork (canonical for AI agents)

**This is the only architecture/product documentation agents must follow.**  
If anything else conflicts with this file, **this file wins**.

You are building a **modular monolith + feature-based SPA** for a web product: **1–2 teams, one deploy, medium domain**. You implement features end-to-end. Do not invent new top-level architecture.

---

## 0) Hard gates (always)

Before claiming work is done, run:

```bash
bun run feature:check          # banlist + FEATURE_MAP + types + unit tests
# or, for a named product slice:
bun run feature:done <name>    # structure of <name> + feature:check
```

| Command                                    | Purpose                                            |
| ------------------------------------------ | -------------------------------------------------- |
| `bun run slice:new <name>`                 | Scaffold product slice + wire `app.ts` / `App.tsx` |
| `bun run slice:new <name> --mongo`         | Same, but Mongo model (exception)                  |
| `bun run feature:map`                      | Regenerate `FEATURE_MAP.md`                        |
| `bun run feature:check`                    | Banlist + i18n parity + typecheck + unit           |
| `bun run feature:done <name>`              | Per-slice Definition of Done                       |
| `bun run banlist`                          | Forbidden pattern scan only                        |
| `bun run i18n:parity`                      | en ⊆ pt-BR ⊆ es key parity                         |
| `bun run test:e2e` / `test:e2e:playwright` | **Canonical (only) E2E** — Playwright              |

**Definition of Done for a product feature = `feature:done <name>` exit 0.** Nothing else.

Playbooks (step-by-step):

- [`docs/agents/add-product-feature.md`](docs/agents/add-product-feature.md)
- [`docs/agents/add-endpoint-to-feature.md`](docs/agents/add-endpoint-to-feature.md)
- [`docs/agents/add-e2e.md`](docs/agents/add-e2e.md)

Live inventory: [`FEATURE_MAP.md`](FEATURE_MAP.md) (generated).

---

## 1) Architecture (non-negotiable)

### Style

- **Modular monolith** (backend) + **feature-based frontend**.
- Organize by **business domain**, not global `controllers/` / `services/` trees.
- **One deploy** (API image; optional `PROCESS_MODE=worker`). No microservices by default.
- Layers **inside** a feature: `routes → controller → service → schema|model` — OK.
- **Platform vs product** — see below.

### Product slice mirror (required)

| Layer    | Path                                                     |
| -------- | -------------------------------------------------------- |
| Contract | `shared/contract/src/<key>.ts` (+ `*.test.ts`)           |
| Backend  | `backend/modules/<name>/` public `index.ts`              |
| Frontend | `frontend/src/features/<name>/` public `index.ts`        |
| i18n     | `frontend/src/i18n/locales/{en,pt-BR,es}.json` namespace |
| E2E      | `e2e/playwright/tests/<name>.spec.ts`                    |

**Special case:** domain **users** = BE `modules/users` + FE `features/auth` + contract `user.ts`.

### Platform (NOT product features — do not `slice:new` these)

| Area                  | Location                                                                     |
| --------------------- | ---------------------------------------------------------------------------- |
| Kernel                | `backend/src/infra/` (db, redis, auth, logger, rate-limit, idempotency, env) |
| Health                | `backend/modules/health`                                                     |
| Pub/Sub **transport** | `backend/modules/pubsub` (decode/push/publish registry only)                 |
| App shell             | `backend/src/app.ts`, `frontend/src/App.tsx`, `frontend/src/layouts/`        |
| Shared API client     | `frontend/src/lib/api.ts` (`api`, `unwrapEden`)                              |

Domain **handlers** with business rules live under `modules/<feature>/handlers/`, then register in pubsub registry. Never register handlers for modules that do not exist.

### Storage

- **Default: MySQL + Drizzle** (`schema/`). `slice:new` creates this.
- Mongo/Typegoose **only** with `slice:new <name> --mongo` and a real document reason.
- Redis = **cache / rate limit / idempotency only**. Events = **Pub/Sub**, never Redis as bus.

### Auth

- Session: **Better-Auth** cookies.
- Guards: `requireAuth` / `requireRole` from `backend/src/infra/auth-guard` (Elysia `resolve` → **`user` is non-null**).
- Roles: `client` \| `manager` \| `admin` — same endpoints, **filter data by role**.
- FE: only `@/features/auth` may use session login APIs; other features use `useCurrentUser` / `RequireAuth` from that barrel.
- **Never** authenticate with `X-User-Id` or similar headers.

### Type-safe FE ↔ BE

1. Contract TypeBox schemas **first**.
2. Elysia routes use schemas for `body` / `query` / `response`.
3. FE domain calls: `unwrapEden(api....)` from `@/lib/api`.
4. FE types: `import type { App } from '@vibework/backend/app'` via **`backend/dist-types`** — run `bun run --filter @vibework/backend build:types` before FE typecheck.
5. No `as never` on product routes. No raw `fetch` in `frontend/src/features/**`.

### i18n (mandatory)

- UI: en + pt-BR + es in `frontend/src/i18n/locales/`.
- API messages: `backend/src/i18n/locales/`.
- Feature namespaces: `auth.*`, `notifications.*`, `<featureCamel>.*`, `common.*`.
- Never hardcode user-visible strings.
- **Parity:** `en.json` is source of truth; `bun run i18n:parity` (also in `feature:check` / `feature:done`) requires identical leaf keys in pt-BR and es.

### Testing

| Layer                        | When                                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| Contract `Value.Check` tests | Always with schema changes                                       |
| Service + route unit tests   | Always for domain logic                                          |
| Integration (testcontainers) | Persistence / critical flows                                     |
| **Playwright E2E**           | New user-facing flow — **only E2E framework**, copy golden specs |
| Frontend unit                | hooks + `unwrapEden` (Vitest + Testing Library)                  |
| Backend coverage             | 80% thresholds enforced in `feature:check`                       |

Co-locate unit `*.test.ts` next to source. **Stagehand was removed.** Playwright lives in `e2e/playwright/`.

**Auth surface (FE):** only `features/auth` and `lib/authClient.ts` may import `better-auth`. Domain features use Eden (`unwrapEden`) + `useCurrentUser` / `RequireAuth` from `@/features/auth`.

### Process / deploy

- Default `PROCESS_MODE=api`.
- Boot: `src/entrypoint.ts` → `validateEnv` → migrations (`RUN_MIGRATIONS`) → `index`.
- Prod requires: `BETTER_AUTH_SECRET`, MySQL vars, `FRONTEND_URL` or `CORS_ORIGINS`.

---

## 2) Forbidden (banlist / CI)

These fail `bun run banlist` / `feature:check`:

- `X-User-Id` / `x-user-id` as auth
- `as never` under `backend/modules/**/routes/**` (non-test)
- `fetch(` in `frontend/src/features/**`
- `authClient` imported outside `features/auth` (+ `lib/authClient.ts` itself)
- Dead scaffolding: `send-whatsapp-message`, `modules/leads`, `FollowUpHandler` in backend product code
- `export class …Service` under `backend/modules/**/services/**` (except email adapters / subscribers — use module objects)

Also never:

- Microservices / multi-deploy “per module” without explicit human request
- Global horizontal rewrites
- New Mongo “for flexibility”
- Drive-by refactors outside the task
- Commits with `--no-verify`
- Creating parallel docs that override this file

---

## 3) Golden path (copy this pattern)

**Canonical product slice: `notifications`**

```
shared/contract/src/notification.ts
backend/modules/notifications/   (routes → controller → service → models)
frontend/src/features/notifications/  (hooks + page + index barrel)
e2e/playwright/tests/notifications.spec.ts   ← E2E gold copy
e2e/playwright/fixtures/auth.ts              ← signup/signin helpers
```

Auth/session companion:

```
backend/modules/users + features/auth + contract user.ts
e2e/playwright/tests/auth.spec.ts
```

When unsure how to structure a new domain, **mirror notifications** (and auth for session UI only).
When unsure how to write E2E, **copy Playwright golden specs** (`auth.spec.ts`, `notifications.spec.ts`).

---

## 4) How to add a product feature (short)

```bash
bun run slice:new billing          # or --mongo if justified
# implement SLOT comments only
bun run --filter @vibe-code/contract build
bun run --filter @vibework/backend build:types
# connect unwrapEden(api.billing...)
bun run feature:done billing       # MUST pass
```

Full steps: [`docs/agents/add-product-feature.md`](docs/agents/add-product-feature.md).

### Module layout (product)

```
backend/modules/<name>/
  index.ts              # public exports only
  routes/*.routes.ts    # Elysia + contract + requireAuth
  controllers/          # HTTP mapping (module objects)
  services/             # business rules (module objects — see below)
  schema/               # Drizzle/MySQL (default)
  models/               # Typegoose only if --mongo
  handlers/             # optional Pub/Sub domain handlers
```

### Service patterns (mandatory)

Agents **must** follow this. `slice:new` scaffolds the default.

| Kind                  | Pattern                                                             | When                                                     |
| --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| **Domain service**    | `export const FooService = { async method() {…} }`                  | Stateless business rules (default)                       |
| **Controller**        | `export const FooController = { async action(ctx) {…} }`            | HTTP map only: authz, status, i18n errors → call service |
| **Error subclass**    | `export class FooError extends Error`                               | Typed domain/transport errors only                       |
| **Process lifecycle** | `class` + `export const foo = new Foo()` (+ optional facade object) | Holds open connections (e.g. Pub/Sub pull subscriber)    |
| **Stateful adapter**  | `interface` + impl `class` + `createFoo()` factory                  | External clients (e.g. SES email)                        |

**Do:**

- Prefer **module objects** (`export const XService = { … }`). No `new XService()`, no `static` methods on domain classes.
- Controllers call **services only** (not models/publishers when a service method exists).
- Mock module objects in tests: `vi.mock('…/foo.service', () => ({ FooService: { method: mockFn } }))`.
- Copy golden: `UserService`, `NotificationService`, `PasswordService`, `PublisherService`.

**Do not:**

- Static-everywhere domain classes (`class UserService { static async … }`).
- Instantiate domain services per request.
- Reintroduce free-function aliases (`export async function createX`) next to module objects — use the object methods.
- Put HTTP/`Context` types inside services.

**Exceptions (allowed instances):**

1. `NotificationSubscriber` + `notificationSubscriber` — process singleton for pull worker.
2. `SESEmailService` / `MockEmailService` via `createEmailService()` — holds SES client.
3. Infra singletons under `backend/src/infra/` (db, redis, pubsub clients).

### Frontend feature layout

```
frontend/src/features/<name>/
  index.ts              # PUBLIC barrel only
  hooks.ts              # unwrapEden + react-query
  *Page.tsx
```

Cross-feature imports: **only** from `@/features/<other>` (barrel). Never deep files. Never `authClient` outside auth.

### SLOT markers in scaffolds

- `SLOT:` — implement here
- `DO-NOT-TOUCH:` — leave wiring alone

---

## 5) Kernel quick reference

| Concern             | File                                                |
| ------------------- | --------------------------------------------------- |
| App composition     | `backend/src/app.ts`                                |
| Process boot        | `backend/src/entrypoint.ts`, `backend/src/index.ts` |
| Auth session config | `backend/src/infra/auth.ts`                         |
| Auth guards         | `backend/src/infra/auth-guard.ts`                   |
| Env validation      | `backend/src/infra/env.ts`                          |
| Logger / requestId  | `backend/src/infra/logger.ts`, `request-context.ts` |
| Eden client         | `frontend/src/lib/api.ts`                           |
| App errors          | `frontend/src/lib/errors.ts`                        |
| FE routes           | `frontend/src/App.tsx`                              |

---

## 6) Common commands

```bash
bun install
docker-compose up -d
bun run dev
bun run --filter @vibework/backend build:types
bun run typecheck
bun run test
bun run test:integration
bun run slice:new <name>
bun run feature:map
bun run feature:check
bun run feature:done <name>
bun run banlist
```

Backend package scripts: `db:migrate`, `db:generate`, `start` (entrypoint).

---

## 7) Language & commits

| Asset                      | Rule                          |
| -------------------------- | ----------------------------- |
| Code identifiers/comments  | English                       |
| Commits                    | Conventional Commits, English |
| User-facing UI/API strings | i18n en + pt-BR + es          |
| This file                  | English                       |

---

## 8) Agent working rules

1. **Read this file first** every session involving architecture or new features.
2. **Prefer `slice:new`** over hand-rolling folders.
3. **Contract before route before UI.**
4. **Smallest change** that satisfies `feature:done` / `feature:check`.
5. **Do not expand scope** (no drive-by refactors, no new frameworks).
6. **Prove with gates** — never claim done without `feature:check` or `feature:done`.
7. **When stuck**, re-read golden path (`notifications`) and the matching playbook under `docs/agents/`.
8. **Update FEATURE_MAP** via `bun run feature:map` after adding slices (also run by `feature:check`).

---

## 9) Repo map (orientation only)

```
backend/modules/<domain>   product + platform modules
backend/src/infra          kernel
backend/src/app.ts         HTTP app composition
frontend/src/features      product UI slices
frontend/src/lib           api, errors, query, antd
shared/contract            TypeBox source of truth
e2e/playwright             Canonical Playwright E2E
scripts/                   agent tooling (slice, check, banlist, map)
docs/agents/               task playbooks
infra/                     Terraform (deploy), not product features
```

---

_End of canonical agent instructions._
