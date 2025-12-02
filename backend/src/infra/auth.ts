import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './database/mysql'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'mysql' }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },
})

export type Session = typeof auth.$Infer.Session
