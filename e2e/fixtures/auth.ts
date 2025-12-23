import type { Page } from '@playwright/test'

export interface TestUser {
  email: string
  password: string
  name?: string
}

// Generate unique test user with timestamp-based email
export function generateTestUser(): TestUser {
  const timestamp = Date.now()
  const RADIX = 36
  const SLICE_START = 2
  const SLICE_END = 8
  const random = Math.random().toString(RADIX).slice(SLICE_START, SLICE_END)
  return {
    email: `test-${timestamp}-${random}@e2e.local`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
  }
}

// Sign up new user through UI (navigates to root, fills signup form)
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
  // Clear cookies to sign out (main session mechanism)
  await page.context().clearCookies()
  // Only clear storage if we're on a valid page (not about:blank)
  try {
    const url = page.url()
    if (url && !url.startsWith('about:')) {
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })
    }
  } catch {
    // Ignore storage errors - cookies are cleared, session will be invalidated
  }
}
