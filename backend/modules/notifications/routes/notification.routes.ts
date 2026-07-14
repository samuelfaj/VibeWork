import {
  CreateNotificationSchema,
  NotificationSchema,
  NotificationListQuerySchema,
  NotificationListResponseSchema,
  ErrorBodySchema,
  type UserRole,
} from '@vibe-code/contract'
import { Elysia, t } from 'elysia'
import { getLanguageFromHeader, getTranslation } from '../../../src/i18n'
import { requireAuth } from '../../../src/infra/auth-guard'
import { NotificationService } from '../services/notification.service'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

function canManageOthers(role: UserRole): boolean {
  return role === 'admin' || role === 'manager'
}

/** Routes call NotificationService directly (no controller layer). */
export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .use(requireAuth)
  .post(
    '/',
    async ({ body, user, request, set }) => {
      const lang = getLanguageFromHeader(request.headers.get('accept-language'))

      if (body.userId !== user.id && !canManageOthers(user.role)) {
        set.status = 403
        return {
          error: {
            code: 'FORBIDDEN',
            message: getTranslation('errors.notification.unauthorized', lang),
          },
        }
      }

      const notification = await NotificationService.create(body)
      set.status = 201
      return notification
    },
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
    async ({ query, user }) => {
      const page = query.page ? Number(query.page) : DEFAULT_PAGE
      const limit = query.limit ? Number(query.limit) : DEFAULT_LIMIT

      let list
      if (canManageOthers(user.role)) {
        list = query.userId
          ? await NotificationService.getUserNotifications(query.userId)
          : await NotificationService.listAll()
      } else {
        list = await NotificationService.getUserNotifications(user.id)
      }

      const start = (page - 1) * limit
      return {
        data: list.slice(start, start + limit),
        total: list.length,
        page,
        limit,
      }
    },
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
    async ({ params, user, request, set }) => {
      const lang = getLanguageFromHeader(request.headers.get('accept-language'))

      let ownerId = user.id
      if (canManageOthers(user.role)) {
        const existing = await NotificationService.findById(params.id)
        if (!existing) {
          set.status = 404
          return {
            error: {
              code: 'NOT_FOUND',
              message: getTranslation('errors.notification.notFound', lang),
            },
          }
        }
        ownerId = existing.userId
      }

      const notification = await NotificationService.markAsRead(params.id, ownerId)
      if (!notification) {
        set.status = 404
        return {
          error: {
            code: 'NOT_FOUND',
            message: getTranslation('errors.notification.notFound', lang),
          },
        }
      }
      return notification
    },
    {
      params: t.Object({ id: t.String({ minLength: 1 }) }),
      response: {
        200: NotificationSchema,
        401: ErrorBodySchema,
        404: ErrorBodySchema,
      },
    }
  )
