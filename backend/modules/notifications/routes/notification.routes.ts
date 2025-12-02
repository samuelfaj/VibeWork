import { Elysia, t } from 'elysia'
import { CreateNotificationSchema, NotificationSchema } from '@vibe-code/contract'
import * as notificationService from '../services/notification.service'
import { publishNotificationCreated } from '../services/notification-publisher'
import { NotificationModel } from '../models/notification.model'
import { formatNotificationResponse } from '../core/notification.formatter'

export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .post(
    '/',
    async ({ body, headers, set }) => {
      const userId = headers['x-user-id']
      if (!userId) {
        set.status = 401
        return { error: 'Unauthorized' }
      }

      if (body.userId !== userId) {
        set.status = 403
        return { error: 'Cannot create notifications for other users' }
      }

      const doc = await NotificationModel.create(body)
      await publishNotificationCreated(doc)
      set.status = 201
      return formatNotificationResponse(doc)
    },
    {
      body: CreateNotificationSchema,
      response: {
        201: NotificationSchema,
      },
    }
  )
  .get(
    '/',
    async ({ query, headers }) => {
      // Get userId from X-User-Id header (placeholder for auth middleware)
      const userId = headers['x-user-id']
      if (!userId) {
        return { error: 'Unauthorized', data: [], total: 0, page: 1, limit: 20 }
      }

      const page = query.page ? Number(query.page) : 1
      const limit = query.limit ? Number(query.limit) : 20

      const notifications = await notificationService.getUserNotifications(userId)
      const start = (page - 1) * limit
      const paginated = notifications.slice(start, start + limit)

      return {
        data: paginated,
        total: notifications.length,
        page,
        limit,
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
      }),
    }
  )
  .patch(
    '/:id/read',
    async ({ params, headers, set }) => {
      // Get userId from X-User-Id header (placeholder for auth middleware)
      const userId = headers['x-user-id']
      if (!userId) {
        set.status = 401
        return { error: 'Unauthorized' }
      }

      // Validate ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(params.id)) {
        set.status = 400
        return { error: 'Invalid notification ID format' }
      }

      const notification = await notificationService.markAsRead(params.id, userId)
      if (!notification) {
        set.status = 404
        return { error: 'Notification not found' }
      }

      return notification
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
