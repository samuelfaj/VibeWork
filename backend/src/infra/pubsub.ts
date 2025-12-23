import { PubSub } from '@google-cloud/pubsub'

const CONNECTION_TIMEOUT_MS = 5000

export const pubsub = new PubSub({
  projectId: process.env.PUBSUB_PROJECT_ID,
  ...(process.env.PUBSUB_EMULATOR_HOST && {
    apiEndpoint: process.env.PUBSUB_EMULATOR_HOST,
  }),
})

export async function checkPubSubConnection(): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), CONNECTION_TIMEOUT_MS)
    )
    const checkPromise = async () => {
      await pubsub.getTopics({ pageSize: 1 })
      return true
    }
    return await Promise.race([checkPromise(), timeoutPromise])
  } catch {
    console.error('[PubSub] Connection check failed')
    return false
  }
}

export async function closePubSubConnection(): Promise<void> {
  await pubsub.close()
  console.log('[PubSub] Connection closed')
}
