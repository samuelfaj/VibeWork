// modules/pubsub/publisher/services/publisher.service.ts
import { Value } from '@sinclair/typebox/value'
import type { TSchema } from 'elysia'
import { PUBLISHERS } from '@modules/pubsub/core/publishers.constants'
import type { PublishResult } from '@modules/pubsub/core/pubsub.types'
import { pubsub } from '@infra'

// ═══════════════════════════════════════════════════════════════════════════════
// ERRORS
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE
// Generic publisher service with TypeBox validation and direct Pub/Sub publishing
// ═══════════════════════════════════════════════════════════════════════════════

export class PublisherService {
  /**
   * Publishes a message to a registered topic
   * @param topic - Topic name (from PUBLISHERS keys)
   * @param payload - Message payload to publish
   * @returns PublishResult with messageId and topic
   * @throws PublisherError if topic not found or payload validation fails
   */
  static async publish(topic: string, payload: Record<string, unknown>): Promise<PublishResult> {
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

    console.log(`[PublisherService] Publishing to ${topic}`)

    try {
      const result = await this.publishToTopic(topic, payload)
      console.log(`[PublisherService] Published to ${topic}`, { messageId: result.messageId })
      return result
    } catch (error) {
      console.error(`[PublisherService] Failed to publish to ${topic}`, {
        error: (error as Error).message,
      })
      throw error
    }
  }

  /**
   * Publishes a message to a Pub/Sub topic
   */
  private static async publishToTopic<T extends Record<string, unknown>>(
    topic: string,
    payload: T
  ): Promise<PublishResult> {
    const pubsubTopic = pubsub.topic(topic)
    const messageBuffer = Buffer.from(JSON.stringify(payload))

    const messageId = await pubsubTopic.publishMessage({ data: messageBuffer })

    return { messageId, topic }
  }
}
