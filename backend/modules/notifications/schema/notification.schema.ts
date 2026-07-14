import { mysqlTable, varchar, text, timestamp, boolean, index } from 'drizzle-orm/mysql-core'
import type { NotificationType } from '@vibe-code/contract'

export const notification = mysqlTable(
  'notification',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    type: varchar('type', { length: 16 }).$type<NotificationType>().notNull(),
    message: text('message').notNull(),
    read: boolean('read').default(false).notNull(),
    createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
  },
  (table) => [index('notification_user_created_idx').on(table.userId, table.createdAt)]
)

export const notifications = notification

export type NotificationRow = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
