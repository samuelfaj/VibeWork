import { Elysia } from 'elysia'
import { checkMySqlConnection, checkMongoConnection, checkRedisConnection } from '../infra'

export interface CheckResult {
  status: 'ok' | 'fail'
  latency?: number
}

export interface ReadyzResponse {
  status: 'ok' | 'fail'
  checks: {
    mysql: CheckResult
    mongodb: CheckResult
    redis: CheckResult
  }
}

const HEALTH_CHECK_TIMEOUT = 5000

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
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

export const healthRoutes = new Elysia({ prefix: '' })
  .get('/healthz', () => ({ status: 'ok' }))
  .get('/readyz', async ({ set }) => {
    const [mysql, mongodb, redis] = await Promise.all([
      runCheck(checkMySqlConnection),
      runCheck(checkMongoConnection),
      runCheck(checkRedisConnection),
    ])

    const response: ReadyzResponse = {
      status: 'ok',
      checks: { mysql, mongodb, redis },
    }

    if (mysql.status === 'fail' || mongodb.status === 'fail' || redis.status === 'fail') {
      response.status = 'fail'
      set.status = 503
    }

    return response
  })
