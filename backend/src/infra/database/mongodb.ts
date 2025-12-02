import mongoose from 'mongoose'

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibe_notifications'
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  console.log('[MongoDB] Connected')
}

export async function checkMongoConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 5000)
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
