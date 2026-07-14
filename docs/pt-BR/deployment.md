# Deploy

## Modelo

- **Um processo:** só API HTTP
- **Um banco:** MySQL
- Entrada: `entrypoint.ts` → valida env → migrate opcional → `index.ts`

## Env (produção)

| Variável                         | Notas                      |
| -------------------------------- | -------------------------- |
| `BETTER_AUTH_SECRET`             | Obrigatório                |
| `MYSQL_*`                        | Obrigatório                |
| `FRONTEND_URL` ou `CORS_ORIGINS` | Obrigatório para cookies   |
| `RUN_MIGRATIONS`                 | `true` para migrar no boot |

## Container

Ver `backend/Dockerfile`. A imagem roda `bun run start` (entrypoint).

## Frontend

Build estático Vite; defina `VITE_API_URL` no build.
