import type { Page } from '@playwright/test'

export interface TestUser {
  email: string
  password: string
  name?: string
}

/**
 * Generate a unique test user with timestamp-based email
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return {
    email: `test-${timestamp}-${random}@e2e.local`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
  }
}

/**
 * Sign up a new user through the UI
 * Navigates to root and fills the signup form
 */
export async function signUp(page: Page, user: TestUser): Promise<void> {
  await page.goto('/')

  // Check if we're on login form and need to switch to signup
  const signupHeading = page.locator('h2').filter({ hasText: /sign\s*up/i })
  if (!(await signupHeading.isVisible())) {
    // Click the switch to signup button
    const switchButton = page.getByRole('button', { name: /sign\s*up/i })
    if (await switchButton.isVisible()) {
      await switchButton.click()
    }
  }

  // Fill signup form using IDs
  await page.locator('#signup-email').fill(user.email)
  await page.locator('#signup-password').fill(user.password)
  await page.locator('#signup-confirm-password').fill(user.password)

  // Submit the form
  await page.locator('form button[type="submit"]').click()
}

/**
 * Sign in an existing user through the UI
 */
export async function signIn(page: Page, user: TestUser): Promise<void> {
  await page.goto('/')

  // Check if we're on signup form and need to switch to login
  const loginHeading = page.locator('h2').filter({ hasText: /log\s*in/i })
  if (!(await loginHeading.isVisible())) {
    // Click the switch to login button
    const switchButton = page.getByRole('button', { name: /log\s*in/i })
    if (await switchButton.isVisible()) {
      await switchButton.click()
    }
  }

  // Fill login form using IDs
  await page.locator('#login-email').fill(user.email)
  await page.locator('#login-password').fill(user.password)

  // Submit the form
  await page.locator('form button[type="submit"]').click()
}

/**
 * Sign out the current user
 */
export async function signOut(page: Page): Promise<void> {
  // Clear cookies and local storage to sign out
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}
