import { NotificationModel } from '../models/notification.model'
import { NotificationFormatterService } from './notification-formatter.service'
import type { Notification, CreateNotificationInput } from '@vibe-code/contract'

export class NotificationService {
  static async create(data: CreateNotificationInput): Promise<Notification> {
    const doc = await NotificationModel.create(data)
    return NotificationFormatterService.formatResponse(doc)
  }

  static async getUserNotifications(userId: string): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 })
    return docs.map((doc) => NotificationFormatterService.formatResponse(doc))
  }

  static async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    )
    return doc ? NotificationFormatterService.formatResponse(doc) : null
  }
}

/**
 * @deprecated Use NotificationService.create() instead
 */
export async function createNotification(data: CreateNotificationInput): Promise<Notification> {
  return NotificationService.create(data)
}

/**
 * @deprecated Use NotificationService.getUserNotifications() instead
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  return NotificationService.getUserNotifications(userId)
}

/**
 * @deprecated Use NotificationService.markAsRead() instead
 */
export async function markAsRead(id: string, userId: string): Promise<Notification | null> {
  return NotificationService.markAsRead(id, userId)
}
