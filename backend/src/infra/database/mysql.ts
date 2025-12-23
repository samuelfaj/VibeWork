import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const MYSQL_DEFAULT_HOST = '127.0.0.1'
const MYSQL_DEFAULT_PORT = 3307
const MYSQL_DEFAULT_USER = 'root'
const MYSQL_DEFAULT_PASSWORD = ''
const MYSQL_DEFAULT_DATABASE = 'vibe_db'
const CONNECTION_LIMIT = 10
const CONNECTION_TIMEOUT_MS = 5000

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? MYSQL_DEFAULT_HOST,
  port: process.env.MYSQL_PORT ? Number.parseInt(process.env.MYSQL_PORT) : MYSQL_DEFAULT_PORT,
  user: process.env.MYSQL_USER ?? MYSQL_DEFAULT_USER,
  password: process.env.MYSQL_PASSWORD ?? MYSQL_DEFAULT_PASSWORD,
  database: process.env.MYSQL_DATABASE ?? MYSQL_DEFAULT_DATABASE,
  connectionLimit: CONNECTION_LIMIT,
  connectTimeout: CONNECTION_TIMEOUT_MS,
})

export const db = drizzle(pool)

export async function checkMySqlConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), CONNECTION_TIMEOUT_MS)
    )
    const checkPromise = async () => {
      const conn = await pool.getConnection()
      await conn.ping()
      conn.release()
      return true
    }
    return await Promise.race([checkPromise(), timeoutPromise])
  } catch (error) {
    console.error(
      '[MySQL] Connection check failed:',
      error instanceof Error ? error.message : error
    )
    return false
  }
}

export async function closeMySqlConnection(): Promise<void> {
  await pool.end()
  console.log('[MySQL] Connection pool closed')
}
