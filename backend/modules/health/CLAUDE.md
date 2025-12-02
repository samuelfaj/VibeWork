# Health - Health Checks & Readiness Probes

Health check endpoints for container orchestration (Kubernetes, Docker Compose, etc.) and service status monitoring.

## Purpose

Provides liveness and readiness checks to verify the application and all its dependencies are running properly.

## Structure

```
health/
├── CLAUDE.md                 # Module documentation
├── index.ts                  # Module export
├── routes/
│   ├── health.routes.ts      # Health check endpoints
│   └── health.routes.test.ts # Route tests (co-located)
```

## API Endpoints

### `GET /healthz`

Liveness probe. Returns 200 if service is running.

**Response:**

```json
{
  "status": "ok"
}
```

**Use:** Container orchestration liveness probe

**Kubernetes Probe Config:**

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

### `GET /readyz`

Readiness probe. Checks if all dependencies are available (MySQL, MongoDB, Redis).

**Response (Success):**

```json
{
  "status": "ok",
  "checks": {
    "mysql": {
      "status": "ok",
      "latency": 5
    },
    "mongodb": {
      "status": "ok",
      "latency": 3
    },
    "redis": {
      "status": "ok",
      "latency": 1
    }
  }
}
```

**Response (Failure):**

```json
{
  "status": "fail",
  "checks": {
    "mysql": {
      "status": "fail",
      "latency": 5023
    },
    "mongodb": {
      "status": "ok",
      "latency": 3
    },
    "redis": {
      "status": "ok",
      "latency": 1
    }
  }
}
```

**HTTP Status:**

- 200 OK - All checks passed
- 503 Service Unavailable - One or more checks failed

**Use:** Container orchestration readiness probe, deployment validation

**Kubernetes Probe Config:**

```yaml
readinessProbe:
  httpGet:
    path: /readyz
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

---

## Implementation Details

### Health Check Flow

1. **Liveness Check** (`/healthz`):
   - Simple endpoint that returns immediately
   - Indicates the process is still running
   - No dependency checks

2. **Readiness Check** (`/readyz`):
   - Runs checks for MySQL, MongoDB, and Redis in parallel
   - Each check has a 5-second timeout
   - Returns individual latency for each dependency
   - Sets HTTP 503 if any check fails

### Timeout Handling

Each dependency check has a 5-second timeout to prevent hanging:

```typescript
const HEALTH_CHECK_TIMEOUT = 5000

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeoutMs)
  )
  return Promise.race([promise, timeoutPromise])
}
```

If a check takes longer than 5 seconds, it's marked as failed.

### Parallel Execution

All three dependency checks run in parallel using `Promise.all()`:

```typescript
const [mysql, mongodb, redis] = await Promise.all([
  runCheck(checkMySqlConnection),
  runCheck(checkMongoConnection),
  runCheck(checkRedisConnection),
])
```

This minimizes latency for the readiness probe.

---

## Usage

### In App Setup

The health module is registered in `src/app.ts`:

```typescript
import { healthModule } from '../modules/health'

export const app = new Elysia().use(healthModule)
// ... other routes
```

### Manual Testing

```bash
# Liveness check
curl http://localhost:3000/healthz

# Readiness check
curl http://localhost:3000/readyz
```

### Docker Compose

```yaml
services:
  backend:
    image: vibework-backend
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/readyz']
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s
```

---

## Dependencies

- **MySQL**: via `checkMySqlConnection()` from `src/infra`
- **MongoDB**: via `checkMongoConnection()` from `src/infra`
- **Redis**: via `checkRedisConnection()` from `src/infra`

All checks are imported from the infrastructure layer.

---

## Testing

Run health module tests:

```bash
bun run test -- modules/health
```

Tests verify:

- `/healthz` returns 200 with `{ status: 'ok' }`
- `/readyz` returns 200 when all checks pass
- `/readyz` returns 503 when any check fails
- Timeout handling (5-second limit per check)
- Parallel execution of checks
- Latency measurement accuracy

---

## Related Documentation

- [`../CLAUDE.md`](../CLAUDE.md) - Module architecture overview
- [`../../src/infra/CLAUDE.md`](../../src/infra/CLAUDE.md) - Infrastructure layer & health checks
