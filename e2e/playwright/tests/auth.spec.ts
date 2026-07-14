/**
 * GOLDEN PATH — Playwright E2E (canonical for agents).
 * Copy this file when adding feature E2E. Prefer getByTestId over text/CSS.
 */
import { test, expect } from '@playwright/test'
import { generateTestUser, signUp, signIn, signOut, expectAuthenticated } from '../fixtures/auth'

test.describe('Auth (golden path)', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await signOut(page)
    await page.goto('/notifications')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByTestId('login-email')).toBeVisible()
  })

  test('user can sign up and reach notifications', async ({ page }) => {
    const user = generateTestUser()
    await signUp(page, user)
    await expectAuthenticated(page)
    await expect(page.getByTestId('notifications-page')).toBeVisible()
  })

  test('user can sign in after signup', async ({ page }) => {
    const user = generateTestUser()
    await signUp(page, user)
    await expectAuthenticated(page)

    await signOut(page)
    await signIn(page, user)
    await expectAuthenticated(page)
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await signOut(page)
    await signIn(page, {
      email: 'nonexistent@e2e.local',
      password: 'WrongPassword123!',
      name: 'Nope',
    })

    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
