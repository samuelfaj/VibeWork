import 'dotenv/config'
import { Stagehand } from '@browserbasehq/stagehand'
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { z } from 'zod'
import { APP_URL, createStagehand, delay, clearSession } from '../../helpers/stagehand'
import { generateTestUserData } from '../../helpers/testData'

describe('Authentication E2E Tests', () => {
  let stagehand: Stagehand

  beforeAll(async () => {
    stagehand = await createStagehand()
  })

  afterAll(async () => {
    await stagehand.close()
  })

  beforeEach(async () => {
    await clearSession(stagehand)
  })

  test('should display signup form on home page', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(APP_URL)
    await delay(1500)

    const result = await stagehand.extract(
      'Check if there is a signup form with email, password, and confirm password fields',
      z.object({
        hasSignupForm: z.boolean().describe('Whether a signup form is visible'),
        hasEmailField: z.boolean().describe('Whether email input exists'),
        hasPasswordField: z.boolean().describe('Whether password input exists'),
        hasConfirmPasswordField: z.boolean().describe('Whether confirm password input exists'),
        description: z.string().describe('Description of what was found'),
      })
    )

    expect(result.hasSignupForm).toBe(true)
    expect(result.hasEmailField).toBe(true)
    expect(result.hasPasswordField).toBe(true)
  })

  test('should sign up a new user successfully', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(APP_URL)
    await delay(1500)

    const testUser = generateTestUserData()

    // Fill the signup form
    await stagehand.act(`Type "${testUser.email}" in the email field`)
    await stagehand.act(`Type "${testUser.password}" in the password field`)
    await stagehand.act(`Type "${testUser.password}" in the confirm password field`)
    await stagehand.act('Click the submit button')
    await delay(2000)

    const result = await stagehand.extract(
      'Check if signup was successful - look for any error alerts or success indicators',
      z.object({
        hasError: z.boolean().describe('Whether there is an error message visible'),
        errorMessage: z.string().optional().describe('The error message if any'),
        description: z.string().describe('Description of the current page state'),
      })
    )

    expect(result.hasError).toBe(false)
  })

  test('should show error for mismatched passwords', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(APP_URL)
    await delay(1500)

    const testUser = generateTestUserData()

    // Fill signup form with mismatched passwords
    await stagehand.act(`Type "${testUser.email}" in the email field`)
    await stagehand.act(`Type "${testUser.password}" in the password field`)
    await stagehand.act('Type "DifferentPassword123!" in the confirm password field')
    await stagehand.act('Click the submit button')
    await delay(1500)

    const result = await stagehand.extract(
      'Check if there is an error message about passwords not matching',
      z.object({
        hasError: z.boolean().describe('Whether there is an error about mismatched passwords'),
        errorMessage: z.string().optional().describe('The error message text'),
        description: z.string().describe('Description of what happened'),
      })
    )

    expect(result.hasError).toBe(true)
  })

  test('should switch to login form', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(APP_URL)
    await delay(1500)

    // Switch to login form
    await stagehand.act('Click on the link or button to switch to login form')
    await delay(1000)

    const result = await stagehand.extract(
      'Check if the login form is now visible with email and password fields (no confirm password)',
      z.object({
        hasLoginForm: z.boolean().describe('Whether login form is visible'),
        hasEmailField: z.boolean().describe('Whether email input exists'),
        hasPasswordField: z.boolean().describe('Whether password input exists'),
        hasConfirmPasswordField: z.boolean().describe('Whether confirm password input exists'),
        description: z.string().describe('Description of the form'),
      })
    )

    expect(result.hasLoginForm).toBe(true)
    expect(result.hasEmailField).toBe(true)
    expect(result.hasPasswordField).toBe(true)
    expect(result.hasConfirmPasswordField).toBe(false)
  })

  test('should show error for invalid login credentials', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(APP_URL)
    await delay(1500)

    // Switch to login form
    await stagehand.act('Click on the link or button to switch to login form')
    await delay(1000)

    // Try to login with invalid credentials
    await stagehand.act('Type "nonexistent@user.com" in the email field')
    await stagehand.act('Type "WrongPassword123!" in the password field')
    await stagehand.act('Click the submit button')
    await delay(2000)

    const result = await stagehand.extract(
      'Check if there is an error message about invalid credentials',
      z.object({
        hasError: z.boolean().describe('Whether there is an error message'),
        errorMessage: z.string().optional().describe('The error message text'),
        description: z.string().describe('Description of what happened'),
      })
    )

    expect(result.hasError).toBe(true)
  })

  test('should login successfully after signup', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(APP_URL)
    await delay(1500)

    const testUser = generateTestUserData()

    // First, sign up
    await stagehand.act(`Type "${testUser.email}" in the email field`)
    await stagehand.act(`Type "${testUser.password}" in the password field`)
    await stagehand.act(`Type "${testUser.password}" in the confirm password field`)
    await stagehand.act('Click the submit button')
    await delay(2000)

    // Clear session
    await clearSession(stagehand)
    await page.goto(APP_URL)
    await delay(1500)

    // Switch to login form
    await stagehand.act('Click on the link or button to switch to login form')
    await delay(1000)

    // Login with the same credentials
    await stagehand.act(`Type "${testUser.email}" in the email field`)
    await stagehand.act(`Type "${testUser.password}" in the password field`)
    await stagehand.act('Click the submit button')
    await delay(2000)

    const result = await stagehand.extract(
      'Check if login was successful - no error messages should be visible',
      z.object({
        hasError: z.boolean().describe('Whether there is an error message'),
        errorMessage: z.string().optional().describe('The error message if any'),
        isLoggedIn: z.boolean().describe('Whether user appears to be logged in'),
        description: z.string().describe('Description of the current state'),
      })
    )

    expect(result.hasError).toBe(false)
  })

  test('should show validation for empty fields', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(APP_URL)
    await delay(1500)

    // Try to submit empty form
    await stagehand.act('Click the submit button without filling any fields')
    await delay(1000)

    const result = await stagehand.extract(
      'Check if there are validation messages indicating required fields',
      z.object({
        hasValidation: z.boolean().describe('Whether there are validation messages'),
        validationMessages: z.array(z.string()).optional().describe('List of validation messages'),
        description: z.string().describe('Description of what happened'),
      })
    )

    expect(result.hasValidation).toBe(true)
  })
})
