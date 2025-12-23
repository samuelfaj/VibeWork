import Redis from 'ioredis'

const REDIS_DEFAULT_URL = 'redis://localhost:6379'
const CONNECTION_TIMEOUT_MS = 5000

const redisUrl = process.env.REDIS_URL ?? REDIS_DEFAULT_URL

export const redis = new Redis(redisUrl, {
  connectTimeout: CONNECTION_TIMEOUT_MS,
  lazyConnect: true,
})

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message)
})

redis.on('connect', () => {
  console.log('[Redis] Connected')
})

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), CONNECTION_TIMEOUT_MS)
    )
    const checkPromise = async () => {
      const result = await redis.ping()
      return result === 'PONG'
    }
    return await Promise.race([checkPromise(), timeoutPromise])
  } catch {
    console.error('[Redis] Connection check failed')
    return false
  }
}

export async function closeRedisConnection(): Promise<void> {
  await redis.quit()
  console.log('[Redis] Connection closed')
}
