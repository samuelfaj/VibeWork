import type { UserRole } from '@vibe-code/contract'
import { Elysia } from 'elysia'
import { UserService } from '../../modules/users/services/user.service'
import { getLanguageFromHeader, getTranslation } from '../i18n'
import { auth } from './auth'
import { logger } from './logger'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  emailVerified: boolean
  image: string | null
}

function isUserRole(value: string): value is UserRole {
  return value === 'client' || value === 'manager' || value === 'admin'
}

async function resolveAuthUser(request: Request): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user?.id) return null

  const dbUser = await UserService.findUserById(session.user.id)
  if (!dbUser) return null

  const role = isUserRole(dbUser.role) ? dbUser.role : 'client'

  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role,
    emailVerified: dbUser.emailVerified,
    image: dbUser.image ?? null,
  }
}

/**
 * Optional session (user may be null). Use for public routes that personalize when logged in.
 */
export const authContext = new Elysia({ name: 'auth-context' })
  .derive(async ({ request }) => {
    try {
      const user = await resolveAuthUser(request)
      return { user }
    } catch (error) {
      logger.warn('failed to resolve auth session', {
        action: 'resolveAuthUser',
        error: error instanceof Error ? error.message : String(error),
      })
      return { user: null as AuthUser | null }
    }
  })
  .as('scoped')

/**
 * Requires authentication. After this plugin, `user` is typed as AuthUser (non-null).
 * Unauthenticated requests short-circuit with 401 via Elysia status().
 */
export const requireAuth = new Elysia({ name: 'require-auth' })
  .resolve(async ({ request, status }) => {
    try {
      const user = await resolveAuthUser(request)
      if (!user) {
        const lang = getLanguageFromHeader(request.headers.get('accept-language'))
        return status(401, {
          error: {
            code: 'UNAUTHORIZED',
            message: getTranslation('errors.auth.unauthorized', lang),
          },
        })
      }
      return { user }
    } catch (error) {
      logger.warn('requireAuth resolve failed', {
        error: error instanceof Error ? error.message : String(error),
      })
      const lang = getLanguageFromHeader(request.headers.get('accept-language'))
      return status(401, {
        error: {
          code: 'UNAUTHORIZED',
          message: getTranslation('errors.auth.unauthorized', lang),
        },
      })
    }
  })
  .as('scoped')

/**
 * Requires authenticated user with one of the given roles.
 */
export function requireRole(roles: UserRole[]) {
  return new Elysia({ name: `require-role-${roles.join('-')}` })
    .use(requireAuth)
    .resolve(async ({ user, request, status }) => {
      if (!roles.includes(user.role)) {
        const lang = getLanguageFromHeader(request.headers.get('accept-language'))
        return status(403, {
          error: {
            code: 'FORBIDDEN',
            message: getTranslation('errors.generic.forbidden', lang),
          },
        })
      }
      return { user }
    })
    .as('scoped')
}

export async function getAuthUserFromRequest(request: Request): Promise<AuthUser | null> {
  return resolveAuthUser(request)
}
