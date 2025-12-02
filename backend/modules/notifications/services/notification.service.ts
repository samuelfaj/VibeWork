import { NotificationModel } from '../models/notification.model'
import { formatNotificationResponse } from '../core/notification.formatter'
import type { Notification, CreateNotificationInput } from '@vibe-code/contract'

export async function createNotification(data: CreateNotificationInput): Promise<Notification> {
  const doc = await NotificationModel.create(data)
  return formatNotificationResponse(doc)
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 })
  return docs.map(formatNotificationResponse)
}

export async function markAsRead(id: string, userId: string): Promise<Notification | null> {
  const doc = await NotificationModel.findOneAndUpdate(
    { _id: id, userId },
    { read: true },
    { new: true }
  )
  return doc ? formatNotificationResponse(doc) : null
}
