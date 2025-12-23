// modules/pubsub/receiver/services/handler.service.ts
import { HANDLERS } from '@modules/pubsub/core/handlers.constants'
import type { HandlerEntry } from '@modules/pubsub/core/pubsub.types'

export const HandlerService = {
  /**
   * Finds a handler by action name
   */
  findHandler(action: string): HandlerEntry | undefined {
    return Object.values(HANDLERS).find((h) => h.action === action)
  },
}
