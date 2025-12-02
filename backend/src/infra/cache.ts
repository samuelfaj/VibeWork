import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
  connectTimeout: 5000,
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
      setTimeout(() => reject(new Error('timeout')), 5000)
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
