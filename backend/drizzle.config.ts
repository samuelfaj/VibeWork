import { defineConfig } from 'drizzle-kit'

const DEFAULT_MYSQL_PORT = 3307

export default defineConfig({
  dialect: 'mysql',
  schema: './modules/**/schema/*.ts',
  out: './migrations',
  dbCredentials: {
    host: process.env.MYSQL_HOST ?? 'localhost',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : DEFAULT_MYSQL_PORT,
    user: process.env.MYSQL_USER ?? 'root',
    ...(process.env.MYSQL_PASSWORD ? { password: process.env.MYSQL_PASSWORD } : {}),
    database: process.env.MYSQL_DATABASE ?? 'vibe_db',
  },
})
