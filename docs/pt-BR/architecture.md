# Arquitetura

## Estilo

O VibeWork é um **monolito modular** no backend e um SPA React **por features**:

- **Um deploy** do produto (imagem da API; worker opcional).
- Organização por **domínio de negócio**, não por pastas globais horizontais.
- **Sem microsserviços por padrão.** Os limites de módulo existem para eventual extração, não como objetivo do dia um.

Agentes e pessoas compartilham as regras em [AGENTS.md](../../AGENTS.md).

## Diagrama

```
┌─────────────────────────────────────────────┐
│  Frontend (React + TanStack Query + Eden)   │
└─────────────────────┬───────────────────────┘
                      │ cookie de sessão + Eden RPC
                      ▼
┌─────────────────────────────────────────────┐
│  Backend (Elysia + Bun)                     │
│  módulos de produto: users, notifications…  │
│  plataforma: health, transporte pubsub      │
│  kernel: infra (db, redis, auth, logger…)   │
└───────┬─────────────┬─────────────┬─────────┘
        ▼             ▼             ▼
     MySQL         MongoDB       Redis
   (users…)    (notifications)  (só cache)
                      │
                      ▼
              Google Pub/Sub (eventos)
```

## Slice de produto (espelho)

Cada domínio de produto é um slice vertical:

| Camada           | Caminho                                        |
| ---------------- | ---------------------------------------------- |
| Contrato         | `shared/contract/src/<domain>.ts`              |
| Módulo backend   | `backend/modules/<name>/`                      |
| Feature frontend | `frontend/src/features/<name>/`                |
| Namespace i18n   | `frontend/src/i18n/locales/{en,pt-BR,es}.json` |
| E2E              | `e2e/playwright/tests/<name>.spec.ts`          |

**Caso especial:** domínio **users** usa a feature FE **`auth`** + contrato **`user.ts`**.

Scaffold:

```bash
bun run slice:new billing
# Mongo só quando justificado:
bun run slice:new reports --mongo
```

## Plataforma vs produto

| Tipo       | Exemplos                       | Notas                                      |
| ---------- | ------------------------------ | ------------------------------------------ |
| Produto    | users, notifications, futuros… | Espelho completo do slice                  |
| Plataforma | `health`, `pubsub`             | Não exige feature FE                       |
| Kernel     | `backend/src/infra/*`          | Infra compartilhada — não usar `slice:new` |

## Camadas no backend (dentro do módulo)

```
routes → controller → service → schema (MySQL) | model (Mongo)
         opcional: handlers/  (lógica de domínio Pub/Sub)
```

- **Routes:** Elysia + schemas do contrato + `requireAuth` / `requireRole`
- **Controllers:** só HTTP (status, erros i18n, authz) — module objects
- **Services:** regras de negócio — module objects (`export const XService = { … }`)
- **Exceções:** classes de ciclo de processo (subscriber pull), factories de clientes externos (e-mail SES)

## Auth e RBAC

- Sessão **Better-Auth** por cookie (sem auth via header `X-User-Id`).
- Guards: `requireAuth`, `requireRole` em `backend/src/infra/auth-guard`.
- Roles: `client` | `manager` | `admin`.
- Mesmos endpoints; **filtrar dados por role**.

## Tipagem FE ↔ BE

1. Contrato TypeBox primeiro.
2. Elysia valida com esses schemas.
3. Frontend: `unwrapEden(api…)` de `@/lib/api`.
4. Tipo da app: `import type { App } from '@vibework/backend/app'` (rode `build:types` no backend).

## Regras de armazenamento

| Store             | Uso                                                               |
| ----------------- | ----------------------------------------------------------------- |
| MySQL + Drizzle   | Padrão para novos domínios                                        |
| Mongo + Typegoose | Só com necessidade real de documento (`--mongo`)                  |
| Redis             | Cache, rate limit, idempotência — **nunca** barramento de eventos |
| Pub/Sub           | Eventos assíncronos de domínio                                    |

## Modos de processo

| `PROCESS_MODE` | Comportamento              |
| -------------- | -------------------------- |
| `api` (padrão) | Só servidor HTTP           |
| `worker`       | Consumidores em background |
| `all`          | Ambos no mesmo processo    |

Boot: `entrypoint.ts` → valida env → migrations opcionais → `index.ts`.

## Direções proibidas

- Multi-deploy “por módulo” sem decisão explícita de produto
- Redis como message bus
- `fetch` cru em `frontend/src/features/**`
- Auth falsa por header
- Docs paralelas que contradizem `AGENTS.md`
