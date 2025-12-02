## PROMPT
Create /healthz and /readyz endpoints for Kubernetes-style health checks. Use infrastructure check functions from TASK5.2 to verify database and cache connectivity.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack and conventions

**You MUST read AI_PROMPT.md before executing this task.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/src/routes/health.ts`
- `/backend/src/routes/__tests__/health.test.ts`

### Files This Task Will Modify
- `/backend/src/app.ts` - Register health routes

### Dependencies from TASK5.2
```typescript
// From /backend/infra/index.ts
import { checkMySqlConnection, checkMongoConnection, checkRedisConnection } from '@infra'
```

### Patterns to Follow

**Health routes (health.ts):**
```typescript
import { Elysia } from 'elysia'
import { checkMySqlConnection, checkMongoConnection, checkRedisConnection } from '@infra'

export const healthRoutes = new Elysia()
  .get('/healthz', () => ({ status: 'ok' }))
  .get('/readyz', async ({ set }) => {
    const timeout = (promise: Promise<boolean>, ms: number) =>
      Promise.race([
        promise,
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), ms)
        )
      ]).catch(() => false)

    const [mysql, mongodb, redis] = await Promise.all([
      timeout(checkMySqlConnection(), 5000),
      timeout(checkMongoConnection(), 5000),
      timeout(checkRedisConnection(), 5000)
    ])

    const checks = { mysql, mongodb, redis }
    const allReady = mysql && mongodb && redis

    if (!allReady) {
      set.status = 503
      console.log(`[health] Readiness check: mysql=${mysql ? 'OK' : 'FAIL'}, mongodb=${mongodb ? 'OK' : 'FAIL'}, redis=${redis ? 'OK' : 'FAIL'}`)
      return { status: 'not-ready', checks }
    }

    return { status: 'ready', checks }
  })
```

**Response formats:**
```typescript
// GET /healthz - always 200
{ status: 'ok' }

// GET /readyz - 200 when ready
{
  status: 'ready',
  checks: { mysql: true, mongodb: true, redis: true }
}

// GET /readyz - 503 when not ready
{
  status: 'not-ready',
  checks: { mysql: true, mongodb: false, redis: true }
}
```

## LAYER
2

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Health endpoints are public
- /healthz must have no external dependencies
- /readyz checks with 5s timeout per check
- Run checks in parallel
