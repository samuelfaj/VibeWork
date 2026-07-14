# Getting started

## Prerequisites

- [Bun](https://bun.sh) **1.2+** (see root `packageManager`)
- Docker + Docker Compose
- Git

## 1. Clone and install

```bash
git clone <repo-url> VibeWork
cd VibeWork
bun install
```

## 2. Environment

```bash
cp .env.example .env
```

Minimum local values are already sensible in `.env.example`. You must set a real `BETTER_AUTH_SECRET` for auth to work in production; local can use any long string.

Key variables:

| Variable                        | Purpose                              |
| ------------------------------- | ------------------------------------ |
| `PROCESS_MODE`                  | `api` (default), `worker`, or `all`  |
| `MYSQL_*`                       | SQL store (users, sessions)          |
| `MONGODB_URI`                   | Document store (notifications today) |
| `REDIS_URL`                     | Cache / rate limit / idempotency     |
| `PUBSUB_EMULATOR_HOST`          | Local Pub/Sub                        |
| `FRONTEND_URL` / `CORS_ORIGINS` | Cookie CORS                          |
| `BETTER_AUTH_SECRET`            | Session signing                      |
| `VITE_API_URL`                  | Frontend → API base URL              |
| `RUN_MIGRATIONS`                | `true` to run Drizzle on boot        |

## 3. Infrastructure containers

```bash
docker compose up -d
```

Typical ports:

| Port  | Service                     |
| ----- | --------------------------- |
| 3307  | MySQL (host; check compose) |
| 27017 | MongoDB                     |
| 6379  | Redis                       |
| 8085  | Pub/Sub emulator            |
| 3000  | Backend (when running)      |
| 5173  | Frontend (when running)     |

## 4. Database

Migrations ship under `backend/migrations/`. With Docker/production entrypoint, `RUN_MIGRATIONS=true` applies them on boot.

Locally you can also run backend package scripts (from repo conventions):

```bash
bun run --filter @vibework/backend db:migrate   # if script is defined
# or via entrypoint with RUN_MIGRATIONS=true
```

Optional seeders live under `backend/seeders/`.

## 5. Run the app

```bash
bun run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Swagger (dev): http://localhost:3000/swagger

## 6. Verify

```bash
bun run typecheck
bun run test
bun run banlist
bun run i18n:parity
# Full agent gate (recommended before PR):
bun run feature:check
```

## Next steps

- Read [Architecture](architecture.md)
- Add a product feature: `bun run slice:new <name>` (see [AGENTS.md](../../AGENTS.md))
- Human backend/frontend deep dives: [backend.md](backend.md), [frontend.md](frontend.md)
