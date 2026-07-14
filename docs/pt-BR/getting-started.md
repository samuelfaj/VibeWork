# Começando

## Pré-requisitos

- [Bun](https://bun.sh) **1.2+** (ver `packageManager` na raiz)
- Docker + Docker Compose
- Git

## 1. Clone e instalação

```bash
git clone <repo-url> VibeWork
cd VibeWork
bun install
```

## 2. Ambiente

```bash
cp .env.example .env
```

Os valores do `.env.example` já servem para desenvolvimento local. Em produção, defina um `BETTER_AUTH_SECRET` forte.

Variáveis principais:

| Variável                        | Função                            |
| ------------------------------- | --------------------------------- |
| `PROCESS_MODE`                  | `api` (padrão), `worker` ou `all` |
| `MYSQL_*`                       | Banco SQL (usuários, sessões)     |
| `MONGODB_URI`                   | Documentos (notifications hoje)   |
| `REDIS_URL`                     | Cache / rate limit / idempotência |
| `PUBSUB_EMULATOR_HOST`          | Pub/Sub local                     |
| `FRONTEND_URL` / `CORS_ORIGINS` | CORS de cookies                   |
| `BETTER_AUTH_SECRET`            | Assinatura de sessão              |
| `VITE_API_URL`                  | Base URL da API no frontend       |
| `RUN_MIGRATIONS`                | `true` para rodar Drizzle no boot |

## 3. Containers de infraestrutura

```bash
docker compose up -d
```

Portas típicas:

| Porta | Serviço                         |
| ----- | ------------------------------- |
| 3307  | MySQL (host; confira o compose) |
| 27017 | MongoDB                         |
| 6379  | Redis                           |
| 8085  | Emulador Pub/Sub                |
| 3000  | Backend                         |
| 5173  | Frontend                        |

## 4. Banco de dados

Migrations em `backend/migrations/`. Com entrypoint Docker/produção, `RUN_MIGRATIONS=true` aplica no boot.

Localmente:

```bash
bun run --filter @vibework/backend db:migrate   # se o script existir
# ou entrypoint com RUN_MIGRATIONS=true
```

Seeders opcionais: `backend/seeders/`.

## 5. Subir a aplicação

```bash
bun run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000
- Swagger (dev): http://localhost:3000/swagger

## 6. Verificar

```bash
bun run typecheck
bun run test
bun run banlist
bun run i18n:parity
# Gate completo (recomendado antes de PR):
bun run feature:check
```

## Próximos passos

- Ler [Arquitetura](architecture.md)
- Nova feature de produto: `bun run slice:new <name>` (ver [AGENTS.md](../../AGENTS.md))
- Detalhes: [backend.md](backend.md), [frontend.md](frontend.md)
