import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 120_000, // 2 minutes for E2E tests
    hookTimeout: 60_000, // 1 minute for setup/teardown
    globals: true,
    include: ['**/*.test.ts'],
    globalSetup: './globalSetup.ts',
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 2, // Run only 2 test files at a time (heavy Chrome instances)
        minForks: 1,
        singleFork: false,
      },
    },
    fileParallelism: true,
    maxConcurrency: 1, // Only 1 test at a time within each file
    sequence: {
      concurrent: false, // Run tests sequentially within files
    },
  },
})
