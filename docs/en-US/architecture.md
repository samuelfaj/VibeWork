# Architecture

Team: **2 people + AI agents**. Prefer the simplest design.

## Style

- Modular monolith API + feature-based SPA
- **One process** (HTTP only)
- **One database** (MySQL + Drizzle)
- Domains as vertical slices
- Layers: **`routes → service → schema`** (no controllers)

Agents follow [AGENTS.md](../../AGENTS.md).

## Diagram

```
Frontend (React + Query + Eden)
        │ session cookie
        ▼
Backend (Elysia + Bun)
  modules: users, notifications, health
  infra: mysql, auth, logger, env
        │
        ▼
     MySQL
```

## Product slice

| Layer    | Path                                  |
| -------- | ------------------------------------- |
| Contract | `shared/contract/src/<domain>.ts`     |
| Backend  | `backend/modules/<name>/`             |
| Frontend | `frontend/src/features/<name>/`       |
| E2E      | `e2e/playwright/tests/<name>.spec.ts` |

Scaffold: `bun run slice:new <name>`.

## Explicit non-goals

- Mongo / Redis / Pub/Sub / workers
- Microservices
- Controller layer
- Multi-deploy per module

## Auth

Better-Auth cookies + `requireAuth` / `requireRole`. Roles filter data on shared endpoints.
