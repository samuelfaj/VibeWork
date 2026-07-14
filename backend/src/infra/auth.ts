import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { session, account, verification } from '../../modules/users/schema/auth.schema'
import { user } from '../../modules/users/schema/user.schema'
import { db } from './database/mysql'

const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const SESSION_EXPIRY_DAYS = 7

const ONE_DAY_IN_SECONDS = SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY
const SESSION_EXPIRY_SECONDS = ONE_DAY_IN_SECONDS * SESSION_EXPIRY_DAYS

const isProduction = process.env.NODE_ENV === 'production'
const trustedOrigins = (
  process.env.CORS_ORIGINS ??
  process.env.FRONTEND_URL ??
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'mysql',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'client',
        input: false,
      },
    },
  },
  session: {
    expiresIn: SESSION_EXPIRY_SECONDS,
    updateAge: ONE_DAY_IN_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: SECONDS_PER_MINUTE * 5,
    },
  },
  trustedOrigins,
  advanced: {
    useSecureCookies: isProduction,
    defaultCookieAttributes: {
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      httpOnly: true,
    },
  },
})

export type Session = typeof auth.$Infer.Session
