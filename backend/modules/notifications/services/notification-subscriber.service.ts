import type { Subscription, Message } from '@google-cloud/pubsub'
import { claimIdempotencyKey } from '../../../src/infra/idempotency'
import { logger } from '../../../src/infra/logger'
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

/** Pure helper — no instance state. */
export function isValidNotificationPayload(payload: unknown): payload is NotificationPayload {
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

/**
 * Process-lifecycle worker (pull subscriber).
 * Holds connection state → **instance class + process singleton**, not static class.
 *
 * Use `notificationSubscriber` or `NotificationSubscriberService` facade.
 * Do NOT add static methods on this class.
 */
export class NotificationSubscriber {
  private subscription: Subscription | null = null
  private emailService: EmailService | null = null

  isValidPayload(payload: unknown): payload is NotificationPayload {
    return isValidNotificationPayload(payload)
  }

  async handleMessage(message: Message): Promise<void> {
    const correlationId = message.id
    try {
      const claimed = await claimIdempotencyKey(`notification-sub:${correlationId}`)
      if (!claimed) {
        logger.info('duplicate notification message skipped', { requestId: correlationId })
        message.ack()
        return
      }

      const payload: unknown = JSON.parse(message.data.toString())

      if (!this.isValidPayload(payload)) {
        logger.error('invalid notification payload, acking', { requestId: correlationId })
        message.ack()
        return
      }

      if (payload.type === 'email') {
        if (!this.emailService) {
          logger.error('email service not initialized', { requestId: correlationId })
          message.nack()
          return
        }
        logger.info('processing email notification', {
          requestId: correlationId,
          userId: payload.userId,
        })
        await this.emailService.sendEmail(payload.userId, 'New Notification', payload.message)
      } else {
        logger.info('ignoring in-app notification on pull worker', { requestId: correlationId })
      }

      message.ack()
      logger.info('notification message acknowledged', { requestId: correlationId })
    } catch (error) {
      logger.error('error processing notification message', {
        requestId: correlationId,
        error: error instanceof Error ? error.message : String(error),
      })
      message.nack()
    }
  }

  async start(): Promise<void> {
    if (this.subscription) {
      logger.info('notification subscriber already running')
      return
    }

    this.emailService = createEmailService()
    this.subscription = pubsub.subscription(SUBSCRIPTION_NAME)

    this.subscription.on('message', (message) => {
      void this.handleMessage(message)
    })
    this.subscription.on('error', (error) => {
      logger.error('notification subscription error', {
        error: error instanceof Error ? error.message : String(error),
      })
    })

    logger.info('notification subscriber listening', { action: SUBSCRIPTION_NAME })
  }

  async stop(): Promise<void> {
    if (!this.subscription) {
      logger.info('notification subscriber not running')
      return
    }

    this.subscription.removeAllListeners()
    await this.subscription.close()
    this.subscription = null
    this.emailService = null
    logger.info('notification subscriber stopped')
  }
}

/** Process singleton — one pull subscriber per worker process. */
export const notificationSubscriber = new NotificationSubscriber()

/**
 * Facade module object over the process singleton.
 * Prefer this from product code; boot may use start/stop helpers below.
 */
export const NotificationSubscriberService = {
  isValidPayload: isValidNotificationPayload,
  handleMessage: (message: Message) => notificationSubscriber.handleMessage(message),
  start: () => notificationSubscriber.start(),
  stop: () => notificationSubscriber.stop(),
}

/** Boot helpers used by `backend/src/index.ts` (PROCESS_MODE=worker|all). */
export async function startNotificationSubscriber(): Promise<void> {
  return NotificationSubscriberService.start()
}

export async function stopNotificationSubscriber(): Promise<void> {
  return NotificationSubscriberService.stop()
}
