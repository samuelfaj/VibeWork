// Global test setup for Vitest
process.env.NODE_ENV = 'test'

if (!process.env.VITEST_TIMEOUT) {
  process.env.VITEST_TIMEOUT = '5000'
}
