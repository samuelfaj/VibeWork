// modules/pubsub/receiver/controllers/push.controller.ts
import { getLanguageFromHeader, getTranslation } from '@i18n'
import type { Context } from 'elysia'
import type { PubSubPushMessage } from '@modules/pubsub/core/pubsub.types'
import { claimIdempotencyKey } from '../../../../src/infra/idempotency'
import { logger } from '../../../../src/infra/logger'
import { HandlerService } from '../services/handler.service'
import { PayloadDecoderService, PayloadDecodingError } from '../services/payload-decoder.service'
import { PushAuthService } from '../services/push-auth.service'

export const PushController = {
  /**
   * POST /pubsub/push - Handle incoming Pub/Sub push message
   */
  async handlePush({ body, set, request }: Context<{ body: PubSubPushMessage }>) {
    const lang = getLanguageFromHeader(request.headers.get('accept-language'))

    if (!PushAuthService.isAuthorized(request)) {
      set.status = 401
      return {
        error: {
          code: 'UNAUTHORIZED',
          message: getTranslation('errors.auth.unauthorized', lang),
        },
      }
    }

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

    const claimed = await claimIdempotencyKey(`pubsub:${metadata.messageId}`)
    if (!claimed) {
      logger.info('duplicate pubsub message skipped', {
        action: payload.action,
        messageId: metadata.messageId,
      })
      return { success: true, handled: false, duplicate: true }
    }

    const entry = HandlerService.findHandler(payload.action)

    if (!entry) {
      logger.warn('no handler for pubsub action', {
        action: payload.action,
        messageId: metadata.messageId,
      })
      return { success: true, handled: false }
    }

    try {
      const result = await entry.handler(payload.body, metadata)
      return { success: true, handled: true, result }
    } catch (error) {
      logger.error('pubsub handler error', {
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
  },
}
