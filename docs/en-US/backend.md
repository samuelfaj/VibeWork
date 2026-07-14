# Backend

Package: `@vibework/backend`  
Runtime: **Bun** · Framework: **ElysiaJS**

## Layout

```
backend/
  src/
    entrypoint.ts     # env + migrations + start
    index.ts          # PROCESS_MODE: api | worker | all
    app.ts            # HTTP app composition
    infra/            # kernel (db, redis, auth, logger, rate-limit, …)
    i18n/             # API message locales
    types/            # App type exports for Eden
  modules/
    users/            # auth + profile
    notifications/    # product golden path
    health/           # readiness/liveness
    pubsub/           # transport: publish + push receive
  migrations/         # Drizzle SQL
  seeders/            # optional data seed
```

## Module shape (product)

```
modules/<name>/
  index.ts                 # public exports + Elysia module
  routes/*.routes.ts
  controllers/*.controller.ts
  services/*.service.ts
  schema/                  # Drizzle (default)
  models/                  # Typegoose if --mongo
  handlers/                # optional Pub/Sub domain handlers
  *.test.ts                # co-located unit tests
  integration.test.ts      # optional
```

## Service pattern

Default:

```ts
export const BillingService = {
  async list(): Promise<Billing[]> {
    /* … */
  },
  async create(input: CreateBillingInput): Promise<Billing> {
    /* … */
  },
}
```

Controllers are also module objects and call services only.

**Allowed instances:**

- Process lifecycle (e.g. `NotificationSubscriber` + `notificationSubscriber`)
- Stateful adapters via factory (e.g. `createEmailService()`)

See AGENTS.md § Service patterns.

## Auth

| Piece              | Location                                                   |
| ------------------ | ---------------------------------------------------------- |
| Better-Auth config | `src/infra/auth.ts`                                        |
| Guards             | `src/infra/auth-guard.ts` → `requireAuth`, `requireRole`   |
| Routes             | `modules/users/routes/auth.routes.ts` mounts `/api/auth/*` |
| Profile            | `GET /users/me` (session required)                         |

After `requireAuth`, handlers receive a non-null `user` (`AuthUser`).

## Kernel (`src/infra`)

| Concern            | Responsibility                        |
| ------------------ | ------------------------------------- |
| `database/mysql`   | Drizzle + MySQL pool                  |
| `database/mongodb` | Mongoose connection                   |
| `cache`            | Redis client                          |
| `pubsub`           | GCP Pub/Sub client (or emulator)      |
| `logger`           | Structured logs + request correlation |
| `request-context`  | AsyncLocalStorage request id          |
| `rate-limit`       | Redis-backed limits                   |
| `idempotency`      | At-least-once consumer dedupe         |
| `env`              | Startup validation                    |
| `http`             | Shared HTTP helper types              |

## Pub/Sub

- **Transport** lives in `modules/pubsub` (decode push body, auth push token, publisher registry).
- **Domain** publish/subscribe logic lives under the product module (e.g. `NotificationPublisherService`, pull `NotificationSubscriber`).
- Register push handlers in `handlers.constants.ts` only for modules that exist.

## i18n (API)

Locales under `backend/src/i18n/locales/`.  
Use `getLanguageFromHeader` + `getTranslation` / `t` for user-facing API errors.

## Scripts (package)

```bash
bun run --filter @vibework/backend dev
bun run --filter @vibework/backend test
bun run --filter @vibework/backend test:coverage
bun run --filter @vibework/backend test:integration
bun run --filter @vibework/backend build:types   # required for FE Eden types
```

Production start uses `entrypoint` (see Dockerfile / package `start` script).

## Golden path

Copy **`modules/notifications`** for a full product module (routes, controller, service, publisher, tests, FE, E2E).  
Copy **`modules/users`** for session-related work.
