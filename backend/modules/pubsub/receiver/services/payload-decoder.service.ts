// modules/pubsub/receiver/services/payload-decoder.service.ts
import type {
  PubSubPushMessage,
  DecodedPayload,
  HandlerMetadata,
} from '@modules/pubsub/core/pubsub.types'

// prettier-ignore
export type PayloadDecodingErrorCode = 'INVALID_BASE64' | 'INVALID_JSON' | 'MISSING_ACTION' | 'INVALID_STRUCTURE'

export class PayloadDecodingError extends Error {
  code: PayloadDecodingErrorCode

  constructor(message: string, code: PayloadDecodingErrorCode) {
    super(message)
    this.name = 'PayloadDecodingError'
    this.code = code
  }
}

export const PayloadDecoderService = {
  decode(message: PubSubPushMessage): {
    payload: DecodedPayload
    metadata: HandlerMetadata
  } {
    let decoded: string
    try {
      decoded = Buffer.from(message.message.data, 'base64').toString('utf8')
    } catch {
      throw new PayloadDecodingError('Failed to decode base64', 'INVALID_BASE64')
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(decoded)
    } catch {
      throw new PayloadDecodingError('Failed to parse JSON', 'INVALID_JSON')
    }

    if (typeof parsed !== 'object' || parsed === null) {
      throw new PayloadDecodingError('Payload must be an object', 'INVALID_STRUCTURE')
    }

    const payload = parsed as Record<string, unknown>
    if (typeof payload.action !== 'string' || payload.action.trim() === '') {
      throw new PayloadDecodingError('Missing or invalid action field', 'MISSING_ACTION')
    }

    // Validate body is an object if it exists
    if (payload.body !== undefined && (typeof payload.body !== 'object' || payload.body === null)) {
      throw new PayloadDecodingError('Body must be an object', 'INVALID_STRUCTURE')
    }

    return {
      payload: { action: payload.action, body: payload.body ?? payload },
      metadata: {
        messageId: message.message.messageId,
        publishTime: new Date(message.message.publishTime),
        subscription: message.subscription,
        attributes: message.message.attributes,
      },
    }
  },
}
