/**
 * Production/process entry: validate env → optional migrations → start API/worker.
 *
 * RUN_MIGRATIONS=true (default in Docker) runs drizzle-kit migrate before boot.
 */
import { spawnSync } from 'node:child_process'
import { validateEnv } from './infra/env'
import { logger } from './infra/logger'

async function runMigrations(): Promise<void> {
  const shouldMigrate =
    process.env.RUN_MIGRATIONS === 'true' ||
    (process.env.NODE_ENV === 'production' && process.env.RUN_MIGRATIONS !== 'false')

  if (!shouldMigrate) {
    logger.info('skipping migrations', { action: 'runMigrations' })
    return
  }

  logger.info('running database migrations', { action: 'runMigrations' })
  const result = spawnSync('bunx', ['drizzle-kit', 'migrate'], {
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) {
    throw new Error(`drizzle-kit migrate failed with exit ${result.status ?? 'unknown'}`)
  }
  logger.info('migrations completed', { action: 'runMigrations' })
}

async function main(): Promise<void> {
  validateEnv()
  process.env.__ENV_VALIDATED = '1'
  await runMigrations()
  await import('./index')
}

main().catch((error) => {
  logger.error('entrypoint failed', {
    error: error instanceof Error ? error.message : String(error),
  })
  process.exit(1)
})
