import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Stagehand } from '@browserbasehq/stagehand'
import dotenv from 'dotenv'
import { ensureServices } from './services'

const DEFAULT_APP_URL = 'http://localhost:5173'
const DEFAULT_API_URL = 'http://localhost:3000'
const ELEMENT_CHECK_DELAY_MS = 250

export const APP_URL = process.env.APP_URL ?? DEFAULT_APP_URL
export const API_URL = process.env.API_URL ?? DEFAULT_API_URL

const helpersDir = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(helpersDir, '..', '.env') })

// Wait for a specified time
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Wait for an element to appear on the page
export async function waitForElement(
  page: { locator: (selector: string) => { count: () => Promise<number> } },
  selector: string,
  timeoutMs = 30_000
): Promise<void> {
  const startTime = Date.now()
  while (Date.now() - startTime < timeoutMs) {
    if ((await page.locator(selector).count()) > 0) return
    await delay(ELEMENT_CHECK_DELAY_MS)
  }
  throw new Error(`Timed out waiting for element: ${selector}`)
}

// Create and initialize a Stagehand instance
export async function createStagehand(): Promise<Stagehand> {
  await ensureServices()
  const stagehand = new Stagehand({
    env: 'LOCAL',
    verbose: 1,
    modelName: 'gpt-5.2',
    localBrowserLaunchOptions: {
      headless: process.env.HEADLESS !== 'false',
      viewport: { width: 1280, height: 720 },
    },
  })
  await stagehand.init()
  return stagehand
}

// Login a user with email and password
export async function loginUser(
  stagehand: Stagehand,
  email: string,
  password: string
): Promise<void> {
  const page = stagehand.context.pages()[0]
  await page.goto(APP_URL)

  // Switch to login form if on signup
  await stagehand.act('Click on the link to switch to login form')

  // Fill login form
  await stagehand.act(`Type "${email}" in the email field`)
  await stagehand.act(`Type "${password}" in the password field`)
  await stagehand.act('Click the submit button')
}

// Clear browser session (cookies and local storage)
export async function clearSession(stagehand: Stagehand): Promise<void> {
  const page = stagehand.context.pages()[0]
  await page.sendCDP('Network.clearBrowserCookies')
  await page.sendCDP('Storage.clearDataForOrigin', {
    origin: APP_URL,
    storageTypes: 'all',
  })
}
