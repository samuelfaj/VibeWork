// modules/pubsub/index.ts

// ═══════════════════════════════════════════════════════════════════════════════
// RECEIVER EXPORTS (HTTP Pub/Sub push endpoint)
// ═══════════════════════════════════════════════════════════════════════════════

import { pushRoutes } from './receiver/routes/push.routes'

// Export the module for app registration
export const pubsubModule = pushRoutes

// Re-export receiver controllers for external use
export { PushController } from './receiver/controllers/push.controller'

// Re-export receiver services
export {
  PayloadDecoderService,
  PayloadDecodingError,
} from './receiver/services/payload-decoder.service'
export type { PayloadDecodingErrorCode } from './receiver/services/payload-decoder.service'

export { HandlerService } from './receiver/services/handler.service'

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLISHER EXPORTS (Outgoing Pub/Sub messages)
// ═══════════════════════════════════════════════════════════════════════════════

// Export publisher service with registry-based validation
export {
  PublisherService,
  PublisherError,
  getPublisher,
  validatePayload,
  getSchemaFields,
} from './publisher/services/publisher.service'

// Export publisher registry
export { PUBLISHERS } from './core/publishers.constants'

// ═══════════════════════════════════════════════════════════════════════════════
// HANDLER EXPORTS (Handler registry)
// ═══════════════════════════════════════════════════════════════════════════════

export { HANDLERS } from './core/handlers.constants'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPE EXPORTS (Handler types only - no handler registration to avoid circular deps)
// ═══════════════════════════════════════════════════════════════════════════════

export type {
  HandlerEntry,
  HandlerMetadata,
  HandlerResult,
  PubSubPushMessage,
  DecodedPayload,
  PublishMessage,
  PublishResult,
} from './core/pubsub.types'
