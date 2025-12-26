import { test, expect } from '@playwright/test'
import { generateTestUser, signUp, signIn, signOut } from '../fixtures/auth'

test.describe('Auth Flow', () => {
  test('user can sign up successfully', async ({ page }) => {
    const user = generateTestUser()

    await signUp(page, user)

    // Wait for form submission to complete
    await page.waitForTimeout(1000)

    // Verify no error alert is visible
    const alert = page.locator('[role="alert"]')
    await expect(alert).not.toBeVisible()

    // Verify submit button is not in loading state
    const submitButton = page.locator('form button[type="submit"]')
    await expect(submitButton).not.toBeDisabled()
  })

  test('user can sign in after signup', async ({ page }) => {
    const user = generateTestUser()

    // First sign up
    await signUp(page, user)
    await page.waitForTimeout(1000)

    // Clear session to sign out
    await signOut(page)

    // Now sign in with the same user
    await signIn(page, user)
    await page.waitForTimeout(1000)

    // Verify no error alert is visible
    const alert = page.locator('[role="alert"]')
    await expect(alert).not.toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    const user = {
      email: 'nonexistent@e2e.local',
      password: 'WrongPassword123!',
    }

    await signIn(page, user)

    // Wait for error to appear
    await page.waitForTimeout(1000)

    // Verify error alert is visible
    const alert = page.locator('[role="alert"]')
    await expect(alert).toBeVisible()
  })

  test('unauthenticated user sees auth form', async ({ page }) => {
    // Clear any existing session
    await signOut(page)

    await page.goto('/')

    // Verify we see an auth form (either login or signup)
    const form = page.locator('form')
    await expect(form).toBeVisible()

    // Verify we see either login or signup heading
    const heading = page.locator('h2')
    await expect(heading).toBeVisible()
  })
})
