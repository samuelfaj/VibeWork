// modules/pubsub/receiver/services/handler.service.test.ts
import { describe, it, expect } from 'vitest'
import { HandlerService } from './handler.service'
import { HANDLERS } from '../../core/handlers.constants'

describe('HandlerService', () => {
  describe('findHandler', () => {
    it('returns undefined for unknown action when registry is empty or missing key', () => {
      const result = HandlerService.findHandler('unknown-action')
      expect(result).toBeUndefined()
    })

    it('returns undefined for empty action', () => {
      const result = HandlerService.findHandler('')
      expect(result).toBeUndefined()
    })

    it('looks up only registered actions', () => {
      const registered = Object.values(HANDLERS)
      for (const entry of registered) {
        const result = HandlerService.findHandler(entry.action)
        expect(result?.action).toBe(entry.action)
      }
      // With empty registry this is a no-op loop; assert API still works
      expect(HandlerService.findHandler('definitely-not-registered')).toBeUndefined()
    })
  })
})
