import { logger } from './logger'

const PRODUCTION = 'production'

/**
 * Fail fast on misconfigured production/runtime.
 * Call once at process boot before listening or running workers.
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const nodeEnv = env.NODE_ENV ?? 'development'
  const missing: string[] = []

  if (nodeEnv === PRODUCTION) {
    for (const key of [
      'BETTER_AUTH_SECRET',
      'MYSQL_HOST',
      'MYSQL_DATABASE',
      'MYSQL_USER',
    ] as const) {
      if (!env[key]?.trim()) missing.push(key)
    }

    // Cookie/CORS must be explicit in production
    if (!env.FRONTEND_URL?.trim() && !env.CORS_ORIGINS?.trim()) {
      missing.push('FRONTEND_URL|CORS_ORIGINS')
    }
  }

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`
    logger.error(message, { action: 'validateEnv', nodeEnv })
    throw new Error(message)
  }

  logger.info('environment validated', {
    action: 'validateEnv',
    nodeEnv,
    processMode: env.PROCESS_MODE ?? 'api',
  })
}
