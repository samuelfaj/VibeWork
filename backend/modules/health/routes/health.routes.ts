import { Elysia } from 'elysia'
import {
  checkMySqlConnection,
  checkMongoConnection,
  checkRedisConnection,
} from '../../../src/infra'

export interface CheckResult {
  status: 'ok' | 'fail'
  latency?: number
}

export interface ReadyzResponse {
  status: 'ok' | 'fail'
  mode: string
  checks: {
    mysql: CheckResult
    mongodb: CheckResult
    redis: CheckResult
  }
}

const HEALTH_CHECK_TIMEOUT = 5000

async function withTimeout<TResult>(
  promise: Promise<TResult>,
  timeoutMs: number
): Promise<TResult> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), timeoutMs)
  )
  return Promise.race([promise, timeoutPromise])
}

async function runCheck(checkFn: () => Promise<boolean>): Promise<CheckResult> {
  const start = Date.now()
  try {
    const result = await withTimeout(checkFn(), HEALTH_CHECK_TIMEOUT)
    const latency = Date.now() - start
    return result ? { status: 'ok', latency } : { status: 'fail', latency }
  } catch {
    return { status: 'fail', latency: Date.now() - start }
  }
}

function processMode(): string {
  return (process.env.PROCESS_MODE ?? 'api').toLowerCase()
}

export const healthRoutes = new Elysia({ prefix: '' })
  // Liveness: process is up (no dependency checks)
  .get('/healthz', () => ({ status: 'ok', mode: processMode() }))
  // Readiness: dependencies required for this process mode
  .get('/readyz', async ({ set }) => {
    const mode = processMode()
    const [mysql, mongodb, redis] = await Promise.all([
      runCheck(checkMySqlConnection),
      runCheck(checkMongoConnection),
      runCheck(checkRedisConnection),
    ])

    const response: ReadyzResponse = {
      status: 'ok',
      mode,
      checks: { mysql, mongodb, redis },
    }

    // Worker needs mongo+redis for notification pull; API needs all three.
    const requiredFail =
      mode === 'worker'
        ? mongodb.status === 'fail' || redis.status === 'fail'
        : mysql.status === 'fail' || mongodb.status === 'fail' || redis.status === 'fail'

    if (requiredFail) {
      response.status = 'fail'
      set.status = 503
    }

    return response
  })
