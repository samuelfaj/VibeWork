import {
  CreateNotificationSchema,
  NotificationSchema,
  NotificationListQuerySchema,
  NotificationListResponseSchema,
  ErrorBodySchema,
} from '@vibe-code/contract'
import { Elysia, t } from 'elysia'
import { requireAuth } from '../../../src/infra/auth-guard'
import { NotificationController } from '../controllers/notification.controller'

export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .use(requireAuth)
  .post(
    '/',
    async ({ body, user, request, set }) =>
      NotificationController.create({ body, user, request, set }),
    {
      body: CreateNotificationSchema,
      response: {
        201: NotificationSchema,
        401: ErrorBodySchema,
        403: ErrorBodySchema,
      },
    }
  )
  .get(
    '/',
    async ({ query, user, request, set }) =>
      NotificationController.list({ query, user, request, set }),
    {
      query: NotificationListQuerySchema,
      response: {
        200: NotificationListResponseSchema,
        401: ErrorBodySchema,
      },
    }
  )
  .patch(
    '/:id/read',
    async ({ params, user, request, set }) =>
      NotificationController.markAsRead({ params, user, request, set }),
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: NotificationSchema,
        400: ErrorBodySchema,
        401: ErrorBodySchema,
        404: ErrorBodySchema,
      },
    }
  )
