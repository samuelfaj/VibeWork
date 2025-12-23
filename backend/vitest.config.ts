import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@infra': path.resolve(__dirname, './src/infra'),
      '@i18n': path.resolve(__dirname, './src/i18n'),
      '@modules': path.resolve(__dirname, './modules'),
    },
  },
  test: {
    include: ['**/*.test.ts'],
    exclude: ['**/*.integration.test.ts', '**/integration.test.ts', '**/node_modules/**'],
    environment: 'node',
    testTimeout: 5000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    setupFiles: ['./tests/setup.ts'],
  },
})
