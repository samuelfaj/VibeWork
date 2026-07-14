// modules/pubsub/publisher/services/publisher.service.ts
import { pubsub } from '@infra'
import { Value } from '@sinclair/typebox/value'
import type { TSchema } from 'elysia'
import { PUBLISHERS } from '@modules/pubsub/core/publishers.constants'
import type { PublishResult } from '@modules/pubsub/core/pubsub.types'
import { logger } from '../../../../src/infra/logger'

/** Domain/transport error — classes are fine for Error subclasses. */
export class PublisherError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly topic?: string
  ) {
    super(message)
    this.name = 'PublisherError'
  }
}

export const getPublisher = (topic: string) =>
  Object.values(PUBLISHERS).find((p) => p.topic === topic)

export const validatePayload = (topic: string, payload: unknown): boolean => {
  const publisher = getPublisher(topic)
  if (!publisher) return false
  return Value.Check(publisher.schema as TSchema, payload)
}

export const getSchemaFields = (topic: string): string[] => {
  const publisher = getPublisher(topic)
  if (!publisher) return []
  const schema = publisher.schema as TSchema
  return Object.keys(schema.properties || {})
}

async function publishToTopic<TPayload extends Record<string, unknown>>(
  topic: string,
  payload: TPayload
): Promise<PublishResult> {
  const pubsubTopic = pubsub.topic(topic)
  const messageBuffer = Buffer.from(JSON.stringify(payload))
  const messageId = await pubsubTopic.publishMessage({ data: messageBuffer })
  return { messageId, topic }
}

/**
 * Stateless Pub/Sub publisher (module object).
 */
export const PublisherService = {
  async publish(topic: string, payload: Record<string, unknown>): Promise<PublishResult> {
    const publisher = getPublisher(topic)

    if (!publisher) {
      throw new PublisherError(`Publisher not found: ${topic}`, 'PUBLISHER_NOT_FOUND', topic)
    }

    if (!validatePayload(topic, payload)) {
      const fields = getSchemaFields(topic)
      throw new PublisherError(
        `Invalid payload for ${topic}. Required fields: ${fields.join(', ')}`,
        'INVALID_PAYLOAD',
        topic
      )
    }

    logger.info('publishing message', { action: 'PublisherService.publish', topic })

    try {
      const result = await publishToTopic(topic, payload)
      logger.info('published message', {
        action: 'PublisherService.publish',
        topic,
        messageId: result.messageId,
      })
      return result
    } catch (error) {
      logger.error('publish failed', {
        action: 'PublisherService.publish',
        topic,
        error: (error as Error).message,
      })
      throw error
    }
  },
}
