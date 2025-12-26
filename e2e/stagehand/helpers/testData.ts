const API_URL = process.env.API_URL ?? 'http://localhost:3000'

export interface TestUser {
  email: string
  password: string
  name: string
}

// Extract cookies from response headers
function extractCookies(res: Response): string {
  // Try getSetCookie first (Node.js 19.7+)
  if (typeof res.headers.getSetCookie === 'function') {
    const cookies = res.headers.getSetCookie()
    if (cookies && cookies.length > 0) {
      return cookies.join('; ')
    }
  }

  // Fallback to get('set-cookie')
  const setCookieHeader = res.headers.get('set-cookie')
  if (setCookieHeader) {
    return setCookieHeader
  }

  return ''
}

// Create a test user via API - returns the user credentials for use in tests
export async function createTestUser(): Promise<TestUser> {
  const email = `test-${Date.now()}@e2e.test`
  const name = 'Test User'
  const password = 'TestPassword123!'

  // Better-Auth signup endpoint
  const res = await fetch(`${API_URL}/api/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })

  if (!res.ok) {
    throw new Error(`Failed to create test user: ${await res.text()}`)
  }

  return { email, password, name }
}

// Sign in a test user via API and return session cookies
export async function signInTestUser(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    throw new Error(`Failed to sign in test user: ${await res.text()}`)
  }

  return extractCookies(res)
}

// Generate unique test user data without creating in API - useful for testing signup flows
export function generateTestUserData(): TestUser {
  return {
    email: `test-${Date.now()}@e2e.test`,
    name: 'Test User',
    password: 'TestPassword123!',
  }
}
