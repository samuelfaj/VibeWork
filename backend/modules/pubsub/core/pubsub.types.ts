// modules/pubsub/core/pubsub.types.ts

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════════
export type PushHandler = (body: unknown, metadata: HandlerMetadata) => Promise<HandlerResult>

export interface HandlerEntry {
  action: string
  handler: PushHandler
  description: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// RECEIVER (Incoming Pub/Sub Messages)
// ═══════════════════════════════════════════════════════════════════════════════

export interface PubSubPushMessage {
  message: {
    data: string
    messageId: string
    publishTime: string
    attributes?: Record<string, string>
  }
  subscription: string
}

export interface DecodedPayload {
  action: string
  body: unknown
}

export interface HandlerMetadata {
  messageId: string
  publishTime: Date
  subscription: string
  attributes?: Record<string, string>
}

export interface HandlerResult {
  success: boolean
  message?: string
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLISHER (Outgoing Pub/Sub Messages)
// ═══════════════════════════════════════════════════════════════════════════════

export interface PublishMessage {
  action: string
  body: Record<string, unknown>
}

export interface PublishResult {
  messageId: string
  topic: string
}
