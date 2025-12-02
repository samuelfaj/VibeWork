# @vibework/backend

ElysiaJS REST API backend with type-safe Eden RPC, infrastructure integrations, and i18n support.

## Purpose

Backend service for the VibeWork platform, featuring:

- **ElysiaJS**: High-performance Bun-native web framework
- **Eden RPC**: Type-safe API client generation for frontend
- **Drizzle ORM**: MySQL database access
- **Typegoose/Mongoose**: MongoDB document storage
- **ioredis**: Redis caching
- **Google Cloud Pub/Sub**: Async event messaging
- **i18next**: Internationalization (en, pt-BR)

## Structure

```
backend/
├── src/
│   ├── index.ts              # Entry point, server startup, graceful shutdown
│   ├── app.ts                # Elysia app with swagger, cors, i18n, error handling
│   ├── routes/
│   │   ├── health.ts         # /healthz, /readyz endpoints
│   │   └── __tests__/
│   │       └── health.test.ts
│   ├── infra/
│   │   ├── index.ts          # Barrel exports for all infra
│   │   ├── cache.ts          # Redis client and connection
│   │   ├── pubsub.ts         # Google Cloud Pub/Sub client
│   │   ├── database/
│   │   │   ├── mysql.ts      # Drizzle ORM + mysql2 pool
│   │   │   └── mongodb.ts    # Mongoose connection
│   │   └── __tests__/
│   │       ├── cache.test.ts
│   │       ├── mysql.test.ts
│   │       ├── mongodb.test.ts
│   │       └── pubsub.test.ts
│   ├── i18n/
│   │   ├── index.ts          # i18next config, t(), getLanguageFromHeader()
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── pt-BR.json
│   │   └── __tests__/
│   │       └── i18n.test.ts
│   └── __tests__/
│       └── app.test.ts
├── package.json
├── tsconfig.json
├── Dockerfile
└── CLAUDE.md
```

## Quick Start

```bash
# Install dependencies
bun install

# Start development server (hot reload)
bun run dev

# Type check
bun run typecheck

# Run tests
bun run test

# Production build
bun run build

# Lint
bun run lint
```

## Scripts

| Script      | Command                                                 | Description                 |
| ----------- | ------------------------------------------------------- | --------------------------- |
| `dev`       | `bun run --watch src/index.ts`                          | Dev server with hot reload  |
| `build`     | `bun build ./src/index.ts --outdir ./dist --target bun` | Production build            |
| `test`      | `vitest run`                                            | Run tests                   |
| `lint`      | `eslint src/`                                           | Lint source files           |
| `typecheck` | `tsc --noEmit`                                          | Type check without emitting |

## Environment Variables

| Variable               | Description                         | Default                  |
| ---------------------- | ----------------------------------- | ------------------------ |
| `PORT`                 | Server port                         | `3000`                   |
| `MYSQL_HOST`           | MySQL server host                   | -                        |
| `MYSQL_USER`           | MySQL username                      | -                        |
| `MYSQL_PASSWORD`       | MySQL password                      | -                        |
| `MYSQL_DATABASE`       | MySQL database name                 | -                        |
| `MONGODB_URI`          | MongoDB connection string           | -                        |
| `REDIS_URL`            | Redis connection URL                | `redis://localhost:6379` |
| `PUBSUB_PROJECT_ID`    | Google Cloud project ID for Pub/Sub | -                        |
| `PUBSUB_EMULATOR_HOST` | Pub/Sub emulator endpoint (dev)     | -                        |

## API Endpoints

| Method | Path       | Description                                   |
| ------ | ---------- | --------------------------------------------- |
| GET    | `/`        | Root endpoint, returns `{ status: 'ok' }`     |
| GET    | `/healthz` | Liveness probe, returns `{ status: 'ok' }`    |
| GET    | `/readyz`  | Readiness probe, checks MySQL, MongoDB, Redis |
| GET    | `/swagger` | Swagger UI documentation                      |

### Readiness Check Response

```json
{
  "status": "ok",
  "checks": {
    "mysql": { "status": "ok", "latency": 5 },
    "mongodb": { "status": "ok", "latency": 3 },
    "redis": { "status": "ok", "latency": 1 }
  }
}
```

Returns HTTP 503 if any check fails.

## Adding Routes

1. Create a route file in `src/routes/`:

   ```typescript
   import { Elysia } from 'elysia'

   export const myRoutes = new Elysia({ prefix: '/my' })
     .get('/', () => ({ message: 'Hello' }))
     .post('/', ({ body }) => ({ created: body }))
   ```

2. Import and use in `src/app.ts`:

   ```typescript
   import { myRoutes } from './routes/my'

   export const app = new Elysia().use(myRoutes)
   ```

## Internationalization

Supported locales: `en`, `pt-BR`

Language is detected from `Accept-Language` header:

```typescript
import { t, getLanguageFromHeader } from './i18n'

const lang = getLanguageFromHeader(request.headers.get('accept-language'))
const message = t('errors.notFound', { lng: lang })
```

## Key Dependencies

- `elysia` - Web framework
- `@elysiajs/swagger` - OpenAPI documentation
- `@elysiajs/cors` - CORS middleware
- `drizzle-orm` + `mysql2` - MySQL ORM
- `mongoose` + `@typegoose/typegoose` - MongoDB ODM
- `ioredis` - Redis client
- `@google-cloud/pubsub` - Event messaging
- `i18next` - Internationalization

## Docker

```bash
# Build image
docker build -t vibework-backend .

# Run container
docker run -p 3000:3000 \
  -e MYSQL_HOST=host.docker.internal \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD=secret \
  -e MYSQL_DATABASE=vibework \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/vibework \
  vibework-backend
```
