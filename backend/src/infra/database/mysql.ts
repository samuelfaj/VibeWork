import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
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
  } catch {
    console.error('[MySQL] Connection check failed')
    return false
  }
}

export async function closeMySqlConnection(): Promise<void> {
  await pool.end()
  console.log('[MySQL] Connection pool closed')
}
