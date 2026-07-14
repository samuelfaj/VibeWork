import type { UserResponse, UserRole } from '@vibe-code/contract'
import type { AuthUser } from '../../../src/infra/auth-guard'
import type { HttpSet } from '../../../src/infra/http'
import { getLanguageFromHeader, getTranslation } from '../../../src/i18n'
import { UserService } from '../services/user.service'

interface GetMeContext {
  user: AuthUser
  request: Request
  set: HttpSet
}

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

/** HTTP mapping only (module object). Business rules live in UserService. */
export const UserController = {
  async getMe(
    ctx: GetMeContext
  ): Promise<UserResponse | { error: { code: string; message: string } }> {
    const user = await UserService.findUserById(ctx.user.id)

    if (!user) {
      const lang = getLanguageFromHeader(ctx.request.headers.get('accept-language'))
      ctx.set.status = 404
      return {
        error: {
          code: 'NOT_FOUND',
          message: getTranslation('errors.generic.notFound', lang),
        },
      }
    }

    return toUserResponse({
      ...user,
      image: user.image ?? null,
    })
  },
}
