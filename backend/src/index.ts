import 'reflect-metadata'
import { initI18n } from './i18n'
import {
  closeMongoConnection,
  closeRedisConnection,
  closePubSubConnection,
  closeMySqlConnection,
  connectMongo,
} from './infra'
import { validateEnv } from './infra/env'
import { logger } from './infra/logger'

// When started via entrypoint.ts, env is already validated.
// When started via `bun run src/index.ts` (dev), validate lightly.
if (!process.env.__ENV_VALIDATED) {
  try {
    validateEnv()
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error
    logger.warn('env validation warning (non-production)', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

const DEFAULT_PORT = 3000
const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : DEFAULT_PORT

/** api | worker | all — default api for Cloud Run HTTP service */
export type ProcessMode = 'api' | 'worker' | 'all'

function resolveProcessMode(): ProcessMode {
  const raw = (process.env.PROCESS_MODE ?? 'api').toLowerCase()
  if (raw === 'worker' || raw === 'all' || raw === 'api') return raw
  logger.warn('invalid PROCESS_MODE, defaulting to api', { action: raw })
  return 'api'
}

const mode = resolveProcessMode()

async function startWorker(): Promise<void> {
  const { startNotificationSubscriber } =
    await import('../modules/notifications/services/notification-subscriber.service')
  await startNotificationSubscriber()
  logger.info('worker mode started', { action: 'startWorker' })
}

async function startApi(): Promise<void> {
  const { app } = await import('./app')
  app.listen(PORT, () => {
    logger.info('api server listening', {
      action: 'startApi',
      port: PORT,
      swagger: process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true',
    })
  })
}

async function main(): Promise<void> {
  await initI18n()
  await connectMongo()
  logger.info('boot', { action: 'main', mode })

  if (mode === 'api' || mode === 'all') {
    await startApi()
  }

  if (mode === 'worker' || mode === 'all') {
    await startWorker()
  }

  if (mode === 'worker') {
    logger.info('worker-only process running (no HTTP listener)')
  }
}

const shutdown = async () => {
  logger.info('shutting down gracefully')
  try {
    if (mode === 'worker' || mode === 'all') {
      const { stopNotificationSubscriber } =
        await import('../modules/notifications/services/notification-subscriber.service')
      await stopNotificationSubscriber()
    }
    await Promise.allSettled([
      closeMongoConnection(),
      closeRedisConnection(),
      closePubSubConnection(),
      closeMySqlConnection(),
    ])
  } catch (error) {
    logger.error('error during shutdown', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
  process.exit(0)
}

process.on('SIGTERM', () => {
  void shutdown()
})
process.on('SIGINT', () => {
  void shutdown()
})

void main()
