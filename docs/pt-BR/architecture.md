# Arquitetura

Time: **2 pessoas + agents de IA**. Preferir o design mais simples.

## Estilo

- API monolito modular + SPA por features
- **Um processo** (só HTTP)
- **Um banco** (MySQL + Drizzle)
- Domínios em slices verticais
- Camadas: **`routes → service → schema`** (sem controllers)

Agentes seguem [AGENTS.md](../../AGENTS.md).

## Diagrama

```
Frontend (React + Query + Eden)
        │ cookie de sessão
        ▼
Backend (Elysia + Bun)
  modules: users, notifications, health
  infra: mysql, auth, logger, env
        │
        ▼
     MySQL
```

## Slice de produto

| Camada   | Caminho                               |
| -------- | ------------------------------------- |
| Contrato | `shared/contract/src/<domain>.ts`     |
| Backend  | `backend/modules/<name>/`             |
| Frontend | `frontend/src/features/<name>/`       |
| E2E      | `e2e/playwright/tests/<name>.spec.ts` |

Scaffold: `bun run slice:new <name>`.

## Não objetivos

- Mongo / Redis / Pub/Sub / workers
- Microsserviços
- Camada de controllers
- Multi-deploy por módulo

## Auth

Better-Auth (cookies) + `requireAuth` / `requireRole`. Roles filtram dados nos mesmos endpoints.
