import { logger } from '../../../src/infra/logger'
import { pubsub } from '../../../src/infra/pubsub'

const TOPIC_NAME = 'notification-created'

interface NotificationDocument {
  _id: { toString(): string }
  userId: string
  type: 'in-app' | 'email'
  message: string
  createdAt: Date
}

/** Stateless domain publisher (module object). */
export const NotificationPublisherService = {
  async publishCreated(notification: NotificationDocument): Promise<string> {
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
    logger.info('published notification-created', {
      action: 'NotificationPublisherService.publishCreated',
      topic: TOPIC_NAME,
      messageId,
    })
    return messageId
  },
}
