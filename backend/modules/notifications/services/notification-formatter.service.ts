import type { Notification } from '@vibe-code/contract'

interface NotificationDocument {
  _id: { toString(): string }
  userId: string
  type: 'in-app' | 'email'
  message: string
  read: boolean
  createdAt: Date
}

/** Stateless mapper (module object). */
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
