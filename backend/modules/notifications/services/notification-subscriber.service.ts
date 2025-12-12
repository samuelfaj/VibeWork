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

export class NotificationSubscriberService {
  private static subscription: Subscription | null = null
  private static emailService: EmailService | null = null

  static isValidPayload(payload: unknown): payload is NotificationPayload {
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

  static async handleMessage(message: Message): Promise<void> {
    const correlationId = message.id
    try {
      const payload: unknown = JSON.parse(message.data.toString())

      if (!this.isValidPayload(payload)) {
        console.error(
          `[NotificationSubscriberService] Invalid payload, acking to prevent retry: ${correlationId}`
        )
        message.ack()
        return
      }

      if (payload.type === 'email') {
        if (!this.emailService) {
          console.error(
            `[NotificationSubscriberService] Email service not initialized: ${correlationId}`
          )
          message.nack()
          return
        }
        console.log(
          `[NotificationSubscriberService] Processing email notification: ${correlationId}`
        )
        await this.emailService.sendEmail(payload.userId, 'New Notification', payload.message)
      } else {
        console.log(
          `[NotificationSubscriberService] Ignoring in-app notification: ${correlationId}`
        )
      }

      message.ack()
      console.log(`[NotificationSubscriberService] Message acknowledged: ${correlationId}`)
    } catch (error) {
      console.error(
        `[NotificationSubscriberService] Error processing message ${correlationId}:`,
        error
      )
      message.nack()
    }
  }

  static async start(): Promise<void> {
    if (this.subscription) {
      console.log('[NotificationSubscriberService] Subscriber already running')
      return
    }

    this.emailService = createEmailService()
    this.subscription = pubsub.subscription(SUBSCRIPTION_NAME)

    this.subscription.on('message', this.handleMessage.bind(this))
    this.subscription.on('error', (error) => {
      console.error('[NotificationSubscriberService] Subscription error:', error)
    })

    console.log(`[NotificationSubscriberService] Listening on ${SUBSCRIPTION_NAME}`)
  }

  static async stop(): Promise<void> {
    if (!this.subscription) {
      console.log('[NotificationSubscriberService] Subscriber not running')
      return
    }

    this.subscription.removeAllListeners()
    await this.subscription.close()
    this.subscription = null
    this.emailService = null
    console.log('[NotificationSubscriberService] Subscriber stopped')
  }
}

// Backward compatibility exports
/**
 * @deprecated Use NotificationSubscriberService.handleMessage() instead
 */
export async function handleMessage(message: Message): Promise<void> {
  return NotificationSubscriberService.handleMessage(message)
}

/**
 * @deprecated Use NotificationSubscriberService.isValidPayload() instead
 */
export function isValidPayload(payload: unknown): payload is NotificationPayload {
  return NotificationSubscriberService.isValidPayload(payload)
}

/**
 * @deprecated Use NotificationSubscriberService.start() instead
 */
export async function startNotificationSubscriber(): Promise<void> {
  return NotificationSubscriberService.start()
}

/**
 * @deprecated Use NotificationSubscriberService.stop() instead
 */
export async function stopNotificationSubscriber(): Promise<void> {
  return NotificationSubscriberService.stop()
}
