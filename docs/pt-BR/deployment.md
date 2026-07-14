# Deploy

## Container

`backend/Dockerfile` faz build a partir da raiz do monorepo (install workspace → build do contract → backend).

Entrada de runtime: **`entrypoint.ts`** (valida env → migrate opcional → `index.ts`).

## Modos de processo

| Modo                  | Uso                                            |
| --------------------- | ---------------------------------------------- |
| `PROCESS_MODE=api`    | Serviço HTTP no Cloud Run (padrão)             |
| `PROCESS_MODE=worker` | Só consumidores em background                  |
| `PROCESS_MODE=all`    | Ambos no mesmo processo (envs simples / local) |

Se só o HTTP sobe e você depende de pull subscribers (ex.: e-mail de notification):

- suba um segundo serviço com `PROCESS_MODE=worker`, **ou**
- use `PROCESS_MODE=all` no serviço da API.

## Migrations

- SQL em `backend/migrations/`.
- `RUN_MIGRATIONS=true` aplica no boot.
- Localmente pode manter `false` e migrar explicitamente.

## Ambiente (essenciais de produção)

| Variável                         | Notas                                   |
| -------------------------------- | --------------------------------------- |
| `BETTER_AUTH_SECRET`             | Obrigatório                             |
| `MYSQL_*`                        | Obrigatório                             |
| `FRONTEND_URL` ou `CORS_ORIGINS` | Obrigatório para cookies                |
| `MONGODB_URI`                    | Se usar modules Mongo                   |
| `REDIS_URL`                      | Cache / rate limit / idempotência       |
| `GCP_PROJECT_ID`                 | Pub/Sub real                            |
| `PUBSUB_PUSH_TOKEN`              | Protege `POST /pubsub/push` em produção |

Nunca commite `.env` real.

## CI/CD

Pipeline GitLab (`.gitlab-ci.yml` + `.gitlab/ci/*`):

- validate: lint, typecheck, build
- test
- build / infrastructure / deploy (Cloud Run)
- e2e (quando configurado)

Build de imagem GCP: `cloudbuild.yaml`.

## Frontend

SPA estático (Vite); hospede em CDN / Storage / nginx. Defina `VITE_API_URL` no build apontando para a API.
