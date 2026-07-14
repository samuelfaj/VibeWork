import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface TestUser {
  email: string
  password: string
  name: string
}

/** Unique user for isolation between tests. */
export function generateTestUser(): TestUser {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return {
    email: `test-${timestamp}-${random}@e2e.local`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
  }
}

/** GOLDEN PATH — signup via /signup, lands on /notifications. */
export async function signUp(page: Page, user: TestUser): Promise<void> {
  await page.goto('/signup')
  await expect(page.getByTestId('signup-email')).toBeVisible()

  await page.getByTestId('signup-name').fill(user.name)
  await page.getByTestId('signup-email').fill(user.email)
  await page.getByTestId('signup-password').fill(user.password)
  await page.getByTestId('signup-confirm-password').fill(user.password)
  await page.getByTestId('signup-submit').click()
}

/** GOLDEN PATH — login via /login. */
export async function signIn(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login')
  await expect(page.getByTestId('login-email')).toBeVisible()

  await page.getByTestId('login-email').fill(user.email)
  await page.getByTestId('login-password').fill(user.password)
  await page.getByTestId('login-submit').click()
}

/** Clear browser session (cookies + storage). */
export async function signOut(page: Page): Promise<void> {
  await page.context().clearCookies()
  try {
    const url = page.url()
    if (url && !url.startsWith('about:')) {
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
    }
  } catch {
    // cookies cleared is enough for session invalidation
  }
}

/** Wait until authenticated shell is visible (notifications or logout). */
export async function expectAuthenticated(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/(notifications)?$|\/notifications/)
  await expect(
    page.getByTestId('notifications-page').or(page.getByTestId('logout-button'))
  ).toBeVisible({ timeout: 15_000 })
}
