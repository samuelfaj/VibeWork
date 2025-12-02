import { mysqlTable, varchar, text, timestamp, boolean } from 'drizzle-orm/mysql-core'

export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

// Alias for backward compatibility
export const users = user

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
