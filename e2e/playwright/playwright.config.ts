import { defineConfig, devices } from '@playwright/test'

const CI_RETRIES = 2
const APP_URL = process.env.APP_URL ?? 'http://localhost:5173'
const API_URL = process.env.API_URL ?? 'http://localhost:3000'

/**
 * Canonical E2E config for the monorepo.
 * Agents: copy tests under e2e/playwright/tests/ and use fixtures/auth.ts.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? CI_RETRIES : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'list' : 'html',
  timeout: 60_000,
  use: {
    baseURL: APP_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'bun run dev',
      cwd: '../../backend',
      url: `${API_URL}/healthz`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'bun run dev',
      cwd: '../../frontend',
      url: APP_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
