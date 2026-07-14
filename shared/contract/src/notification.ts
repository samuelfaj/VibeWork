import { t } from 'elysia'
import type { Static } from 'elysia'

export const NotificationTypeSchema = t.Union([t.Literal('in-app'), t.Literal('email')])

export const CreateNotificationSchema = t.Object({
  userId: t.String({ minLength: 1 }),
  type: NotificationTypeSchema,
  message: t.String({ minLength: 1 }),
})

export const NotificationSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  type: NotificationTypeSchema,
  message: t.String(),
  read: t.Boolean(),
  createdAt: t.String(),
})

export const NotificationListQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  userId: t.Optional(t.String()),
})

export const NotificationListResponseSchema = t.Object({
  data: t.Array(NotificationSchema),
  total: t.Number(),
  page: t.Number(),
  limit: t.Number(),
})

export type NotificationType = Static<typeof NotificationTypeSchema>
export type CreateNotificationInput = Static<typeof CreateNotificationSchema>
export type Notification = Static<typeof NotificationSchema>
export type NotificationListQuery = Static<typeof NotificationListQuerySchema>
export type NotificationListResponse = Static<typeof NotificationListResponseSchema>
