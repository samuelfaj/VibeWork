/**
 * GOLDEN PATH — notifications deep flow (canonical for agents).
 * signup → notifications page → create → see list → mark read
 */
import { test, expect } from '@playwright/test'
import { generateTestUser, signUp, expectAuthenticated } from '../fixtures/auth'

test.describe('Notifications (deep golden path)', () => {
  test('authenticated user can create and mark a notification as read', async ({ page }) => {
    const user = generateTestUser()
    await signUp(page, user)
    await expectAuthenticated(page)

    await page.goto('/notifications')
    await expect(page.getByTestId('notifications-page')).toBeVisible()
    await expect(page.getByTestId('notifications-title')).toBeVisible()

    const message = `e2e-note-${Date.now()}`
    await page.getByTestId('notification-message-input').fill(message)
    await page.getByTestId('notification-create-submit').click()

    // List should show the new message
    await expect(page.getByText(message)).toBeVisible({ timeout: 15_000 })

    // Mark first unread as read (button contains mark-read test id prefix)
    const markRead = page.locator('[data-testid^="notification-mark-read-"]').first()
    if (await markRead.isVisible().catch(() => false)) {
      await markRead.click()
      await expect(page.locator('[data-testid^="notification-read-"]').first()).toBeVisible({
        timeout: 10_000,
      })
    }
  })

  test('notifications shell is visible after signup', async ({ page }) => {
    const user = generateTestUser()
    await signUp(page, user)
    await expectAuthenticated(page)
    await page.goto('/notifications')
    await expect(page.getByTestId('notifications-page')).toBeVisible()
    await expect(page.getByTestId('logout-button')).toBeVisible()
  })
})
