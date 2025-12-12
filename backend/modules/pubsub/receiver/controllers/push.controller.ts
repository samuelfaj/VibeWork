// modules/pubsub/receiver/controllers/push.controller.ts
import type { Context } from 'elysia'
import type { PubSubPushMessage } from '@modules/pubsub/core/pubsub.types'
import { getLanguageFromHeader, getTranslation } from '@i18n'
import { HandlerService } from '../services/handler.service'
import { PayloadDecoderService, PayloadDecodingError } from '../services/payload-decoder.service'

// ═══════════════════════════════════════════════════════════════════════════════
// CONTROLLER
// Handles HTTP request/response for Pub/Sub push messages
// ═══════════════════════════════════════════════════════════════════════════════

export class PushController {
  /**
   * POST /pubsub/push - Handle incoming Pub/Sub push message
   */
  static async handlePush({ body, set, request }: Context<{ body: PubSubPushMessage }>) {
    const lang = getLanguageFromHeader(request.headers.get('accept-language'))

    // Decode payload
    let payload, metadata
    try {
      const decoded = PayloadDecoderService.decode(body)
      payload = decoded.payload
      metadata = decoded.metadata
    } catch (error) {
      if (error instanceof PayloadDecodingError) {
        set.status = 400
        return {
          error: {
            code: error.code,
            message: getTranslation(`errors.pubsub.${error.code}`, lang),
          },
        }
      }
      throw error
    }

    // Look up handler
    const entry = HandlerService.findHandler(payload.action)

    if (!entry) {
      console.warn(
        '[PubSub] No handler for action:',
        payload.action,
        'messageId:',
        metadata.messageId
      )
      return { success: true, handled: false }
    }

    // Execute handler
    try {
      const result = await entry.handler(payload.body, metadata)
      return { success: true, handled: true, result }
    } catch (error) {
      console.error('[PubSub] Handler error:', {
        action: payload.action,
        messageId: metadata.messageId,
        error: (error as Error).message,
      })
      set.status = 500
      return {
        error: {
          code: 'HANDLER_ERROR',
          message: getTranslation('errors.pubsub.handlerFailed', lang),
        },
      }
    }
  }
}
