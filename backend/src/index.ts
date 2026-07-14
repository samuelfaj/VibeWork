import { initI18n } from './i18n'
import { closeMySqlConnection } from './infra'
import { validateEnv } from './infra/env'
import { logger } from './infra/logger'

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

async function main(): Promise<void> {
  await initI18n()
  const { app } = await import('./app')
  app.listen(PORT, () => {
    logger.info('api server listening', {
      action: 'main',
      port: PORT,
      swagger: process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true',
    })
  })
}

const shutdown = async () => {
  logger.info('shutting down gracefully')
  try {
    await closeMySqlConnection()
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
