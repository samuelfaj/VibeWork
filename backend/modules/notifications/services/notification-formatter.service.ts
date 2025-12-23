import type { Notification } from '@vibe-code/contract'

interface NotificationDocument {
  _id: { toString(): string }
  userId: string
  type: 'in-app' | 'email'
  message: string
  read: boolean
  createdAt: Date
}

export const NotificationFormatterService = {
  formatResponse(doc: NotificationDocument): Notification {
    return {
      id: doc._id.toString(),
      userId: doc.userId,
      type: doc.type,
      message: doc.message,
      read: doc.read,
      createdAt: doc.createdAt.toISOString(),
    }
  },
}

/**
 * @deprecated Use NotificationFormatterService.formatResponse() instead
 */
export function formatNotificationResponse(doc: NotificationDocument): Notification {
  return NotificationFormatterService.formatResponse(doc)
}
