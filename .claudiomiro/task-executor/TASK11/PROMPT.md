## PROMPT
Configure Playwright at monorepo root and create E2E test for complete signup flow: frontend → Eden → Elysia → Better-Auth → MySQL. Test the full user journey with Docker Compose services.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/e2e/package.json`
- `/e2e/playwright.config.ts`
- `/e2e/tsconfig.json`
- `/e2e/tests/auth.spec.ts`
- `/e2e/fixtures/auth.ts`

### Patterns to Follow

**Playwright config:**
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure'
  },
  webServer: [
    {
      command: 'docker-compose up -d && bun run --filter=backend dev',
      url: 'http://localhost:3000/healthz',
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'bun run --filter=frontend dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI
    }
  ]
})
```

**Auth E2E test:**
```typescript
import { test, expect } from '@playwright/test'

test('user can sign up', async ({ page }) => {
  await page.goto('/signup')

  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('text=Welcome')).toBeVisible()
})
```

### Integration Points
- Tests frontend from TASK9
- Tests auth backend from TASK6
- Uses Docker Compose from TASK1

## EXTRA DOCUMENTATION
- Playwright: https://playwright.dev/

## LAYER
5

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Require Docker Compose services
- No arbitrary wait times (use proper locators)
- Clean test data between runs
- Verify with `bun run test:e2e`
