import type { Subscription, Message } from '@google-cloud/pubsub'
import { pubsub } from '../../../src/infra/pubsub'
import { createEmailService, type EmailService } from './email.service'

const SUBSCRIPTION_NAME = 'notification-created-sub'

interface NotificationPayload {
  id: string
  userId: string
  type: 'in-app' | 'email'
  message: string
  createdAt: string
}

let subscription: Subscription | null = null
let emailService: EmailService | null = null

function isValidPayload(payload: unknown): payload is NotificationPayload {
  if (!payload || typeof payload !== 'object') return false
  const p = payload as Record<string, unknown>
  return (
    typeof p.id === 'string' &&
    typeof p.userId === 'string' &&
    (p.type === 'in-app' || p.type === 'email') &&
    typeof p.message === 'string' &&
    typeof p.createdAt === 'string'
  )
}

async function handleMessage(message: Message): Promise<void> {
  const correlationId = message.id
  try {
    const payload: unknown = JSON.parse(message.data.toString())

    if (!isValidPayload(payload)) {
      console.error(
        `[NotificationSubscriber] Invalid payload, acking to prevent retry: ${correlationId}`
      )
      message.ack()
      return
    }

    if (payload.type === 'email') {
      console.log(`[NotificationSubscriber] Processing email notification: ${correlationId}`)
      await emailService!.sendEmail(payload.userId, 'New Notification', payload.message)
    } else {
      console.log(`[NotificationSubscriber] Ignoring in-app notification: ${correlationId}`)
    }

    message.ack()
    console.log(`[NotificationSubscriber] Message acknowledged: ${correlationId}`)
  } catch (error) {
    console.error(`[NotificationSubscriber] Error processing message ${correlationId}:`, error)
    message.nack()
  }
}

export async function startNotificationSubscriber(): Promise<void> {
  if (subscription) {
    console.log('[NotificationSubscriber] Subscriber already running')
    return
  }

  emailService = createEmailService()
  subscription = pubsub.subscription(SUBSCRIPTION_NAME)

  subscription.on('message', handleMessage)
  subscription.on('error', (error) => {
    console.error('[NotificationSubscriber] Subscription error:', error)
  })

  console.log(`[NotificationSubscriber] Listening on ${SUBSCRIPTION_NAME}`)
}

export async function stopNotificationSubscriber(): Promise<void> {
  if (!subscription) {
    console.log('[NotificationSubscriber] Subscriber not running')
    return
  }

  subscription.removeAllListeners()
  await subscription.close()
  subscription = null
  emailService = null
  console.log('[NotificationSubscriber] Subscriber stopped')
}

// Export for testing
export { handleMessage, isValidPayload }
