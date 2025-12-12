import type { CreateNotificationInput } from '@vibe-code/contract'
import { NotificationModel } from '../models/notification.model'
import { NotificationFormatterService } from '../services/notification-formatter.service'
import { NotificationPublisherService } from '../services/notification-publisher.service'
import { NotificationService } from '../services/notification.service'

interface CreateNotificationContext {
  body: CreateNotificationInput
  headers: Record<string, string | undefined>
  set: { status: number }
}

interface ListNotificationsContext {
  query: { page?: string; limit?: string }
  headers: Record<string, string | undefined>
}

interface MarkAsReadContext {
  params: { id: string }
  headers: Record<string, string | undefined>
  set: { status: number }
}

export class NotificationController {
  /**
   * POST /notifications
   * Creates a new notification and publishes event to Pub/Sub
   */
  static async create(ctx: CreateNotificationContext) {
    const userId = ctx.headers['x-user-id']
    if (!userId) {
      ctx.set.status = 401
      return { error: 'Unauthorized' }
    }

    if (ctx.body.userId !== userId) {
      ctx.set.status = 403
      return { error: 'Cannot create notifications for other users' }
    }

    const doc = await NotificationModel.create(ctx.body)
    await NotificationPublisherService.publishCreated(doc)
    ctx.set.status = 201
    return NotificationFormatterService.formatResponse(doc)
  }

  /**
   * GET /notifications
   * Lists notifications for authenticated user with pagination
   */
  static async list(ctx: ListNotificationsContext) {
    const userId = ctx.headers['x-user-id']
    if (!userId) {
      return { error: 'Unauthorized', data: [], total: 0, page: 1, limit: 20 }
    }

    const page = ctx.query.page ? Number(ctx.query.page) : 1
    const limit = ctx.query.limit ? Number(ctx.query.limit) : 20

    const notifications = await NotificationService.getUserNotifications(userId)
    const start = (page - 1) * limit
    const paginated = notifications.slice(start, start + limit)

    return {
      data: paginated,
      total: notifications.length,
      page,
      limit,
    }
  }

  /**
   * PATCH /notifications/:id/read
   * Marks a notification as read
   */
  static async markAsRead(ctx: MarkAsReadContext) {
    const userId = ctx.headers['x-user-id']
    if (!userId) {
      ctx.set.status = 401
      return { error: 'Unauthorized' }
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(ctx.params.id)) {
      ctx.set.status = 400
      return { error: 'Invalid notification ID format' }
    }

    const notification = await NotificationService.markAsRead(ctx.params.id, userId)
    if (!notification) {
      ctx.set.status = 404
      return { error: 'Notification not found' }
    }

    return notification
  }
}
