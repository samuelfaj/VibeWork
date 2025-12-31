import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const seederRun = mysqlTable('seeder_run', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  runAt: timestamp('run_at', { fsp: 3 }).defaultNow().notNull(),
})

export type SeederRun = typeof seederRun.$inferSelect
export type NewSeederRun = typeof seederRun.$inferInsert
