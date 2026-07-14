import { and, desc, eq } from 'drizzle-orm'
import type { CreateNotificationInput, Notification } from '@vibe-code/contract'
import { db } from '../../../src/infra/database/mysql'
import { notifications, type NotificationRow } from '../schema/notification.schema'

function toNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    message: row.message,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * Domain logic for notifications (module object).
 * MySQL only — no pub/sub, no second database.
 */
export const NotificationService = {
  async create(data: CreateNotificationInput): Promise<Notification> {
    const id = crypto.randomUUID()
    await db.insert(notifications).values({
      id,
      userId: data.userId,
      type: data.type,
      message: data.message,
      read: false,
    })
    const row = await NotificationService.findById(id)
    if (!row) throw new Error('Failed to create notification')
    return toNotification(row)
  },

  async findById(id: string): Promise<NotificationRow | null> {
    const [row] = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1)
    return row ?? null
  },

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
    return rows.map(toNotification)
  },

  async listAll(): Promise<Notification[]> {
    const rows = await db.select().from(notifications).orderBy(desc(notifications.createdAt))
    return rows.map(toNotification)
  },

  async markAsRead(id: string, userId: string): Promise<Notification | null> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    const row = await NotificationService.findById(id)
    if (!row || row.userId !== userId) return null
    return toNotification(row)
  },
}
