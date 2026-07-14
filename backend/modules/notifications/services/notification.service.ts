import type { Notification, CreateNotificationInput } from '@vibe-code/contract'
import { NotificationModel } from '../models/notification.model'
import { NotificationFormatterService } from './notification-formatter.service'
import { NotificationPublisherService } from './notification-publisher.service'

/**
 * Stateless domain service (module object).
 * Controllers call this only — no direct Model access from HTTP layer when avoidable.
 */
export const NotificationService = {
  async create(data: CreateNotificationInput): Promise<Notification> {
    const doc = await NotificationModel.create(data)
    await NotificationPublisherService.publishCreated(doc)
    return NotificationFormatterService.formatResponse(doc)
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 })
    return docs.map((doc) => NotificationFormatterService.formatResponse(doc))
  },

  async listAll(): Promise<Notification[]> {
    const docs = await NotificationModel.find({}).sort({ createdAt: -1 })
    return docs.map((doc) => NotificationFormatterService.formatResponse(doc))
  },

  async findById(id: string) {
    return NotificationModel.findById(id)
  },

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    )
    return doc ? NotificationFormatterService.formatResponse(doc) : null
  },
}
