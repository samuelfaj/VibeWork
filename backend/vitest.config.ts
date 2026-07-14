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
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'modules/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*integration*.ts',
        '**/seeders/**',
        'src/entrypoint.ts',
        'src/index.ts',
        '**/schema/**',
        'modules/**/index.ts',
        'src/infra/index.ts',
        'src/types/**',
        'src/infra/http.ts',
        // Better-Auth passthrough covered at higher layers
        'modules/users/routes/auth.routes.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    setupFiles: ['./tests/setup.ts'],
  },
})
