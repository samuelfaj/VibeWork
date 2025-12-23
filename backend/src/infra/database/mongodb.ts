import mongoose from 'mongoose'

const MONGODB_DEFAULT_URI = 'mongodb://localhost:27017/vibe_notifications'
const CONNECTION_TIMEOUT_MS = 5000

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? MONGODB_DEFAULT_URI
  await mongoose.connect(uri, { serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS })
  console.log('[MongoDB] Connected')
}

export async function checkMongoConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), CONNECTION_TIMEOUT_MS)
    )
    const checkPromise = async () => {
      if (mongoose.connection.readyState !== 1) return false
      await mongoose.connection.db?.admin().ping()
      return true
    }
    return await Promise.race([checkPromise(), timeoutPromise])
  } catch {
    console.error('[MongoDB] Connection check failed')
    return false
  }
}

export async function closeMongoConnection(): Promise<void> {
  await mongoose.connection.close()
  console.log('[MongoDB] Connection closed')
}
