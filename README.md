# VibeWork

Modular monolith (Bun + ElysiaJS) and feature-based React SPA.  
One product, one deploy, built for small teams and AI coding agents.

| Language               | Docs                                         |
| ---------------------- | -------------------------------------------- |
| **English**            | [docs/en-US/README.md](docs/en-US/README.md) |
| **Português (Brasil)** | [docs/pt-BR/README.md](docs/pt-BR/README.md) |

**AI agents:** read **[AGENTS.md](AGENTS.md)** first. It overrides any other doc on architecture and workflow.

---

## Quick start

```bash
bun install
cp .env.example .env
docker compose up -d          # MySQL, MongoDB, Redis, Pub/Sub emulator
bun run dev                   # backend + frontend (Turborepo)
```

| URL                           | Service                  |
| ----------------------------- | ------------------------ |
| http://localhost:5173         | Frontend (Vite)          |
| http://localhost:3000         | Backend API              |
| http://localhost:3000/swagger | OpenAPI (non-production) |

---

## Monorepo map

```
backend/           Elysia API + worker (modules + infra kernel)
frontend/          React SPA (features + lib)
shared/contract/   TypeBox schemas (FE ↔ BE source of truth)
e2e/playwright/    Canonical E2E (Playwright only)
scripts/           Agent tooling: slice:new, feature:check, banlist…
infra/             Terraform (GCP)
docs/en-US|pt-BR   Human documentation
docs/agents/       Agent playbooks (English)
AGENTS.md          Canonical agent rules
FEATURE_MAP.md     Generated inventory of product slices
```

---

## Common commands

```bash
bun run dev                 # all packages
bun run test                # unit tests
bun run test:integration    # testcontainers
bun run test:e2e            # Playwright
bun run typecheck
bun run lint
bun run feature:check       # banlist + i18n + types + unit + BE coverage
bun run slice:new <name>    # scaffold a product feature
bun run feature:done <name> # Definition of Done for a slice
```

---

## Product slices today

| Domain        | Backend                 | Frontend                 | Contract          | E2E                     |
| ------------- | ----------------------- | ------------------------ | ----------------- | ----------------------- |
| Users / Auth  | `modules/users`         | `features/auth`          | `user.ts`         | `auth.spec.ts`          |
| Notifications | `modules/notifications` | `features/notifications` | `notification.ts` | `notifications.spec.ts` |

Platform (no product UI): `health`, `pubsub`, `backend/src/infra`.

---

## Stack

| Layer     | Tech                                             |
| --------- | ------------------------------------------------ |
| Runtime   | Bun, Turborepo workspaces                        |
| API       | ElysiaJS + Eden Treaty                           |
| Auth      | Better-Auth (session cookies)                    |
| SQL       | MySQL + Drizzle                                  |
| Documents | MongoDB + Typegoose (opt-in)                     |
| Cache     | Redis (cache / rate-limit / idempotency only)    |
| Events    | Google Cloud Pub/Sub                             |
| UI        | React, Vite, TanStack Query, Ant Design, i18next |
| Tests     | Vitest, Testcontainers, Playwright               |
| Deploy    | Docker, Cloud Run, Terraform (GCP)               |

---

## License / contributing

See [docs/en-US/contributing.md](docs/en-US/contributing.md) or [docs/pt-BR/contributing.md](docs/pt-BR/contributing.md).
