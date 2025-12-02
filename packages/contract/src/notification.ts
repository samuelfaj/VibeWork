import { t } from 'elysia'
import type { Static } from 'elysia'

export const NotificationTypeSchema = t.Union([t.Literal('in-app'), t.Literal('email')])

export const CreateNotificationSchema = t.Object({
  userId: t.String(),
  type: NotificationTypeSchema,
  message: t.String(),
})

export const NotificationSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  type: NotificationTypeSchema,
  message: t.String(),
  read: t.Boolean(),
  createdAt: t.String(),
})

export type NotificationType = Static<typeof NotificationTypeSchema>
export type CreateNotificationInput = Static<typeof CreateNotificationSchema>
export type Notification = Static<typeof NotificationSchema>
