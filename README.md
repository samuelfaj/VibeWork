# VibeWork

![VibeWork](https://github.com/samuelfaj/VibeWork/blob/main/logo.png?raw=true)

Modular monolith (Bun + ElysiaJS) and feature-based React SPA.  
**2 people + AI agents.** One product, one process, one database.

![Bun](https://img.shields.io/badge/Bun-1.2.8%2B-orange)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

| Language               | Docs                                         |
| ---------------------- | -------------------------------------------- |
| **English**            | [docs/en-US/README.md](docs/en-US/README.md) |
| **Português (Brasil)** | [docs/pt-BR/README.md](docs/pt-BR/README.md) |

**AI agents:** read **[AGENTS.md](AGENTS.md)** first. It overrides any other doc.

---

## Quick start

```bash
bun install
cp .env.example .env
docker compose --profile infra up -d   # MySQL only
bun run --filter @vibework/backend db:migrate
bun run dev                            # API + frontend
```

| URL                           | Service       |
| ----------------------------- | ------------- |
| http://localhost:5173         | Frontend      |
| http://localhost:3000         | Backend API   |
| http://localhost:3000/swagger | OpenAPI (dev) |

---

## Monorepo map

```
backend/           Elysia HTTP API (modules + thin infra)
frontend/          React SPA (features + lib)
shared/contract/   TypeBox schemas (FE ↔ BE)
e2e/playwright/    Playwright E2E only
scripts/           slice:new, feature:check, banlist…
infra/             Terraform (GCP) — optional later
docs/              en-US + pt-BR human docs
AGENTS.md          Canonical agent rules
```

---

## Common commands

```bash
bun run dev
bun run test
bun run test:e2e
bun run typecheck
bun run feature:check
bun run slice:new <name>
bun run feature:done <name>
```

---

## Product slices

| Domain        | Backend                 | Frontend                 | Contract          | E2E                     |
| ------------- | ----------------------- | ------------------------ | ----------------- | ----------------------- |
| Users / Auth  | `modules/users`         | `features/auth`          | `user.ts`         | `auth.spec.ts`          |
| Notifications | `modules/notifications` | `features/notifications` | `notification.ts` | `notifications.spec.ts` |

Platform: `health` + `backend/src/infra` (MySQL, auth, logger).

---

## Stack (intentionally small)

| Layer   | Tech                                             |
| ------- | ------------------------------------------------ |
| Runtime | Bun, Turborepo                                   |
| API     | ElysiaJS + Eden                                  |
| Auth    | Better-Auth (cookies)                            |
| Data    | **MySQL + Drizzle only**                         |
| UI      | React, Vite, TanStack Query, Ant Design, i18next |
| Tests   | Vitest, Playwright                               |
| Deploy  | Docker / Cloud Run when needed                   |

No Mongo. No Redis. No Pub/Sub. No worker process. No controllers.

---

## Contributing

[docs/en-US/contributing.md](docs/en-US/contributing.md) · [docs/pt-BR/contributing.md](docs/pt-BR/contributing.md)
