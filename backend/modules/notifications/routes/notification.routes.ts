import { CreateNotificationSchema, NotificationSchema } from '@vibe-code/contract'
import { Elysia, t } from 'elysia'
import { NotificationController } from '../controllers/notification.controller'

export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .post('/', NotificationController.create as never, {
    body: CreateNotificationSchema,
    response: {
      201: NotificationSchema,
    },
  })
  .get('/', NotificationController.list as never, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  .patch('/:id/read', NotificationController.markAsRead as never, {
    params: t.Object({
      id: t.String(),
    }),
  })
