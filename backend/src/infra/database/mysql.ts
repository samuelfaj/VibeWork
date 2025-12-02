import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3307,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'vibe_db',
  connectionLimit: 10,
  connectTimeout: 5000,
})

export const db = drizzle(pool)

export async function checkMySqlConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 5000)
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
