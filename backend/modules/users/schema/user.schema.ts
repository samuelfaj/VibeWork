import { mysqlTable, varchar, text, timestamp, boolean } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
