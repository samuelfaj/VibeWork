import { UserResponseSchema, ErrorBodySchema } from '@vibe-code/contract'
import { Elysia } from 'elysia'
import { requireAuth } from '../../../src/infra/auth-guard'
import { UserController } from '../controllers/user.controller'

export const userRoutes = new Elysia({ prefix: '/users' })
  .use(requireAuth)
  .get('/me', async ({ user, request, set }) => UserController.getMe({ user, request, set }), {
    response: {
      200: UserResponseSchema,
      401: ErrorBodySchema,
      404: ErrorBodySchema,
    },
  })
