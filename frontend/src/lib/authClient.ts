import { createAuthClient } from 'better-auth/react'

const DEFAULT_API_URL = 'http://localhost:3000'
const baseURL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL

/**
 * Better-Auth session client.
 * @internal Prefer `features/auth` hooks. Do not import from other features.
 */
export const authClient = createAuthClient({
  baseURL,
})
