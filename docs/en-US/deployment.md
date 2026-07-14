# Deployment

## Model

- **One process:** HTTP API only
- **One database:** MySQL
- Entry: `entrypoint.ts` → validate env → optional Drizzle migrate → `index.ts`

## Env (production)

| Variable                         | Notes                     |
| -------------------------------- | ------------------------- |
| `BETTER_AUTH_SECRET`             | Required                  |
| `MYSQL_*`                        | Required                  |
| `FRONTEND_URL` or `CORS_ORIGINS` | Required for cookies      |
| `RUN_MIGRATIONS`                 | `true` to migrate on boot |

## Container

See `backend/Dockerfile`. Image runs `bun run start` (entrypoint).

## Frontend

Static Vite build; set `VITE_API_URL` at build time.
