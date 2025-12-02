// Global test setup for Vitest
import 'reflect-metadata'

// Set default test environment variables
process.env.NODE_ENV = 'test'
process.env.PUBSUB_EMULATOR_HOST = 'localhost:8085'

// Increase timeout for async operations
if (!process.env.VITEST_TIMEOUT) {
  process.env.VITEST_TIMEOUT = '5000'
}
