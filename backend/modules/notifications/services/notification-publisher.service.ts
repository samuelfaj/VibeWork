import { pubsub } from '../../../src/infra/pubsub'

const TOPIC_NAME = 'notification-created'

interface NotificationDocument {
  _id: { toString(): string }
  userId: string
  type: 'in-app' | 'email'
  message: string
  createdAt: Date
}

export class NotificationPublisherService {
  /**
   * Publishes a notification created event to Pub/Sub
   */
  static async publishCreated(notification: NotificationDocument): Promise<string> {
    const topic = pubsub.topic(TOPIC_NAME)
    const data = Buffer.from(
      JSON.stringify({
        id: notification._id.toString(),
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        createdAt: notification.createdAt.toISOString(),
      })
    )
    const messageId = await topic.publishMessage({ data })
    console.log(`[NotificationPublisherService] Published message ${messageId} to ${TOPIC_NAME}`)
    return messageId
  }
}

/**
 * @deprecated Use NotificationPublisherService class instead
 */
export const NotificationPublisher = NotificationPublisherService

/**
 * @deprecated Use NotificationPublisherService.publishCreated() instead
 */
export async function publishNotificationCreated(
  notification: NotificationDocument
): Promise<string> {
  return NotificationPublisherService.publishCreated(notification)
}
