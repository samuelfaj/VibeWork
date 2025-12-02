import { app } from './app'

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000

app.listen(PORT, () => {
  console.log(`[backend] Server running on http://localhost:${PORT}`)
  console.log(`[backend] Swagger UI at http://localhost:${PORT}/swagger`)
})

const shutdown = () => {
  console.log('[backend] Shutting down gracefully...')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
