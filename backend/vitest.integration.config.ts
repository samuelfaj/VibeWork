import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.integration.test.ts', '**/integration.test.ts'],
    exclude: ['**/node_modules/**'],
    environment: 'node',
    timeout: 120000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    setupFiles: ['./tests/setup.ts'],
  },
})
