# Backend

Pacote: `@vibework/backend`  
Runtime: **Bun** · Framework: **ElysiaJS**

## Layout

```
backend/
  src/
    entrypoint.ts     # env + migrations + start
    index.ts          # PROCESS_MODE: api | worker | all
    app.ts            # composição HTTP
    infra/            # kernel (db, redis, auth, logger, rate-limit, …)
    i18n/             # locales de mensagens da API
    types/            # tipos App para Eden
  modules/
    users/            # auth + perfil
    notifications/    # golden path de produto
    health/           # readiness/liveness
    pubsub/           # transporte: publish + push receive
  migrations/         # SQL Drizzle
  seeders/            # seed opcional
```

## Forma do módulo (produto)

```
modules/<name>/
  index.ts
  routes/*.routes.ts
  controllers/*.controller.ts
  services/*.service.ts
  schema/                  # Drizzle (padrão)
  models/                  # Typegoose se --mongo
  handlers/                # opcional Pub/Sub de domínio
  *.test.ts
  integration.test.ts      # opcional
```

## Padrão de service

Padrão:

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

Controllers também são module objects e só chamam services.

**Instâncias permitidas:**

- Ciclo de processo (ex.: `NotificationSubscriber` + `notificationSubscriber`)
- Adaptadores com estado via factory (ex.: `createEmailService()`)

Ver AGENTS.md § Service patterns.

## Auth

| Peça               | Local                                                     |
| ------------------ | --------------------------------------------------------- |
| Config Better-Auth | `src/infra/auth.ts`                                       |
| Guards             | `src/infra/auth-guard.ts` → `requireAuth`, `requireRole`  |
| Rotas              | `modules/users/routes/auth.routes.ts` monta `/api/auth/*` |
| Perfil             | `GET /users/me` (sessão obrigatória)                      |

Após `requireAuth`, o handler recebe `user` não nulo (`AuthUser`).

## Kernel (`src/infra`)

| Concern            | Responsabilidade               |
| ------------------ | ------------------------------ |
| `database/mysql`   | Drizzle + pool MySQL           |
| `database/mongodb` | Conexão Mongoose               |
| `cache`            | Cliente Redis                  |
| `pubsub`           | Cliente Pub/Sub (ou emulador)  |
| `logger`           | Logs estruturados + correlação |
| `request-context`  | request id (AsyncLocalStorage) |
| `rate-limit`       | Limites com Redis              |
| `idempotency`      | Dedupe de consumidores         |
| `env`              | Validação no startup           |
| `http`             | Tipos HTTP compartilhados      |

## Pub/Sub

- **Transporte** em `modules/pubsub` (decode, token de push, registry de publisher).
- **Domínio** no módulo de produto (ex.: `NotificationPublisherService`, pull `NotificationSubscriber`).
- Registrar handlers de push em `handlers.constants.ts` só para módulos existentes.

## i18n (API)

Locales em `backend/src/i18n/locales/`.  
Use `getLanguageFromHeader` + `getTranslation` / `t` para erros expostos ao usuário.

## Scripts do pacote

```bash
bun run --filter @vibework/backend dev
bun run --filter @vibework/backend test
bun run --filter @vibework/backend test:coverage
bun run --filter @vibework/backend test:integration
bun run --filter @vibework/backend build:types   # necessário para tipos Eden no FE
```

Produção usa o `entrypoint` (Dockerfile / script `start`).

## Golden path

Copie **`modules/notifications`** para um módulo de produto completo.  
Copie **`modules/users`** para trabalho de sessão.
