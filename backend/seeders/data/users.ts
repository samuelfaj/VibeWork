import type { UserRole } from '@vibe-code/contract'

export interface UserSeedData {
  name: string
  email: string
  emailVerified: boolean
  role: UserRole
  image?: string
}

// Test users for development and testing environments
// DO NOT use these in production!
export const TEST_USERS: UserSeedData[] = [
  {
    name: 'Admin User',
    email: 'admin@vibework.test',
    emailVerified: true,
    role: 'admin',
  },
  {
    name: 'Test User',
    email: 'test@vibework.test',
    emailVerified: true,
    role: 'client',
  },
  {
    name: 'Demo User',
    email: 'demo@vibework.test',
    emailVerified: false,
    role: 'client',
  },
]

// Default password for all test users
// This is intentionally simple for development
export const DEFAULT_PASSWORD = 'Test@123'
