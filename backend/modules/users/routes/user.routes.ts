import type { UserResponse, UserRole } from '@vibe-code/contract'
import { UserResponseSchema, ErrorBodySchema } from '@vibe-code/contract'
import { Elysia } from 'elysia'
import { getLanguageFromHeader, getTranslation } from '../../../src/i18n'
import { requireAuth } from '../../../src/infra/auth-guard'
import { UserService } from '../services/user.service'

function isUserRole(value: string): value is UserRole {
  return value === 'client' || value === 'manager' || value === 'admin'
}

function toUserResponse(user: {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: isUserRole(user.role) ? user.role : 'client',
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

/** Routes call UserService directly (no controller layer). */
export const userRoutes = new Elysia({ prefix: '/users' }).use(requireAuth).get(
  '/me',
  async ({ user, request, set }) => {
    const row = await UserService.findUserById(user.id)
    if (!row) {
      const lang = getLanguageFromHeader(request.headers.get('accept-language'))
      set.status = 404
      return {
        error: {
          code: 'NOT_FOUND',
          message: getTranslation('errors.generic.notFound', lang),
        },
      }
    }
    return toUserResponse({ ...row, image: row.image ?? null })
  },
  {
    response: {
      200: UserResponseSchema,
      401: ErrorBodySchema,
      404: ErrorBodySchema,
    },
  }
)
