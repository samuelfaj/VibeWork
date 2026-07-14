import { Elysia } from 'elysia'
import { checkMySqlConnection } from '../../../src/infra'

export interface CheckResult {
  status: 'ok' | 'fail'
  latency?: number
}

export interface ReadyzResponse {
  status: 'ok' | 'fail'
  checks: {
    mysql: CheckResult
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

export const healthRoutes = new Elysia({ prefix: '' })
  .get('/healthz', () => ({ status: 'ok' }))
  .get('/readyz', async ({ set }) => {
    const mysql = await runCheck(checkMySqlConnection)
    const response: ReadyzResponse = {
      status: mysql.status === 'ok' ? 'ok' : 'fail',
      checks: { mysql },
    }
    if (response.status === 'fail') set.status = 503
    return response
  })
