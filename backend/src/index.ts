import 'reflect-metadata'
import { app } from './app'
import {
  closeMongoConnection,
  closeRedisConnection,
  closePubSubConnection,
  closeMySqlConnection,
} from './infra'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000

app.listen(PORT, () => {
  console.log(`[backend] Server running on http://localhost:${PORT}`)
  console.log(`[backend] Swagger UI at http://localhost:${PORT}/swagger`)
})

const shutdown = async () => {
  console.log('[backend] Shutting down gracefully...')
  try {
    await Promise.allSettled([
      closeMongoConnection(),
      closeRedisConnection(),
      closePubSubConnection(),
      closeMySqlConnection(),
    ])
  } catch (error) {
    console.error('[backend] Error during shutdown:', error)
  }
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
