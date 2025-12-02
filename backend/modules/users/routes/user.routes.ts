import { Elysia } from 'elysia'
import { auth } from '../../../src/infra/auth'
import { userService } from '../services/user.service'

export const userRoutes = new Elysia({ prefix: '/users' }).get('/me', async (ctx) => {
  const session = await auth.api.getSession({ headers: ctx.request.headers })

  if (!session) {
    ctx.set.status = 401
    return { error: 'Unauthorized' }
  }

  const user = await userService.findUserById(session.user.id)

  if (!user) {
    ctx.set.status = 404
    return { error: 'User not found' }
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
})
