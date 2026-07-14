import type { CreateNotificationInput, UserRole } from '@vibe-code/contract'
import { getLanguageFromHeader, getTranslation } from '../../../src/i18n'
import type { AuthUser } from '../../../src/infra/auth-guard'
import type { HttpSet } from '../../../src/infra/http'
import { NotificationService } from '../services/notification.service'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const OBJECT_ID_PATTERN = /^[\dA-Fa-f]{24}$/

interface CreateNotificationContext {
  body: CreateNotificationInput
  user: AuthUser
  request: Request
  set: HttpSet
}

interface ListNotificationsContext {
  query: { page?: string; limit?: string; userId?: string }
  user: AuthUser
  request: Request
  set: HttpSet
}

interface MarkAsReadContext {
  params: { id: string }
  user: AuthUser
  request: Request
  set: HttpSet
}

function canManageOthers(role: UserRole): boolean {
  return role === 'admin' || role === 'manager'
}

/**
 * HTTP mapping only (module object).
 * Authz + status + i18n errors here; persistence/events in NotificationService.
 */
export const NotificationController = {
  /**
   * POST /notifications
   * Creates a notification. Clients may only target themselves.
   */
  async create(ctx: CreateNotificationContext) {
    const lang = getLanguageFromHeader(ctx.request.headers.get('accept-language'))

    if (ctx.body.userId !== ctx.user.id && !canManageOthers(ctx.user.role)) {
      ctx.set.status = 403
      return {
        error: {
          code: 'FORBIDDEN',
          message: getTranslation('errors.notification.unauthorized', lang),
        },
      }
    }

    const notification = await NotificationService.create(ctx.body)
    ctx.set.status = 201
    return notification
  },

  /**
   * GET /notifications
   * Lists notifications filtered by role (own vs optional userId for staff).
   */
  async list(ctx: ListNotificationsContext) {
    const page = ctx.query.page ? Number(ctx.query.page) : DEFAULT_PAGE
    const limit = ctx.query.limit ? Number(ctx.query.limit) : DEFAULT_LIMIT

    let notifications
    if (canManageOthers(ctx.user.role)) {
      if (ctx.query.userId) {
        notifications = await NotificationService.getUserNotifications(ctx.query.userId)
      } else {
        notifications = await NotificationService.listAll()
      }
    } else {
      notifications = await NotificationService.getUserNotifications(ctx.user.id)
    }

    const start = (page - 1) * limit
    const paginated = notifications.slice(start, start + limit)

    return {
      data: paginated,
      total: notifications.length,
      page,
      limit,
    }
  },

  /**
   * PATCH /notifications/:id/read
   * Marks a notification as read for the owner (staff may mark any by ownership check).
   */
  async markAsRead(ctx: MarkAsReadContext) {
    const lang = getLanguageFromHeader(ctx.request.headers.get('accept-language'))

    if (!OBJECT_ID_PATTERN.test(ctx.params.id)) {
      ctx.set.status = 400
      return {
        error: {
          code: 'BAD_REQUEST',
          message: getTranslation('errors.validation.invalidFormat', lang),
        },
      }
    }

    // Clients can only mark their own; staff may mark any by resolving ownership first
    let ownerId = ctx.user.id
    if (canManageOthers(ctx.user.role)) {
      const existing = await NotificationService.findById(ctx.params.id)
      if (!existing) {
        ctx.set.status = 404
        return {
          error: {
            code: 'NOT_FOUND',
            message: getTranslation('errors.notification.notFound', lang),
          },
        }
      }
      ownerId = existing.userId
    }

    const notification = await NotificationService.markAsRead(ctx.params.id, ownerId)
    if (!notification) {
      ctx.set.status = 404
      return {
        error: {
          code: 'NOT_FOUND',
          message: getTranslation('errors.notification.notFound', lang),
        },
      }
    }

    return notification
  },
}
