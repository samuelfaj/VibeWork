# Deployment

## Container

`backend/Dockerfile` builds from the monorepo root (workspace install → contract build → backend).

Runtime entry: **`entrypoint.ts`** (env validation → optional Drizzle migrate → `index.ts`).

## Process modes

| Mode                  | Use                                           |
| --------------------- | --------------------------------------------- |
| `PROCESS_MODE=api`    | Cloud Run HTTP service (default)              |
| `PROCESS_MODE=worker` | Background consumers only (no HTTP)           |
| `PROCESS_MODE=all`    | Single process for both (simple envs / local) |

If you only deploy HTTP and rely on pull subscribers (e.g. notification emails), either:

- run a second service with `PROCESS_MODE=worker`, or
- set `PROCESS_MODE=all` on the API service.

## Migrations

- SQL lives in `backend/migrations/`.
- `RUN_MIGRATIONS=true` (Docker default intent) applies migrations on boot.
- Locally you can leave `RUN_MIGRATIONS=false` and migrate explicitly.

## Environment (production essentials)

| Variable                         | Notes                                     |
| -------------------------------- | ----------------------------------------- |
| `BETTER_AUTH_SECRET`             | Required                                  |
| `MYSQL_*`                        | Required                                  |
| `FRONTEND_URL` or `CORS_ORIGINS` | Required for cookies                      |
| `MONGODB_URI`                    | If using notifications / mongo modules    |
| `REDIS_URL`                      | Cache / rate limit / idempotency          |
| `GCP_PROJECT_ID`                 | Pub/Sub (real GCP, not emulator)          |
| `PUBSUB_PUSH_TOKEN`              | Protect `POST /pubsub/push` in production |

Never commit real `.env` files.

## CI/CD

GitLab pipeline (`.gitlab-ci.yml` + `.gitlab/ci/*`):

- validate: lint, typecheck, build
- test
- build / infrastructure / deploy (Cloud Run)
- e2e (when configured)

GCP image builds can use `cloudbuild.yaml`.

## Frontend

Static SPA built with Vite; host on CDN / Cloud Storage / Firebase Hosting / nginx as you prefer. Point `VITE_API_URL` at the API origin at build time.
