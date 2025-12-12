// modules/pubsub/receiver/services/handler.service.test.ts
import { describe, it, expect } from 'vitest'
import { HandlerService } from './handler.service'

describe('HandlerService', () => {
  describe('findHandler', () => {
    it('should find handler for initiate-lead-follow-up action', () => {
      const result = HandlerService.findHandler('initiate-lead-follow-up')

      expect(result).toBeDefined()
      expect(result?.action).toBe('initiate-lead-follow-up')
      expect(result?.description).toBe('Creates lead and sends initial follow-up message')
    })

    it('should find handler for lead-responded action', () => {
      const result = HandlerService.findHandler('lead-responded')

      expect(result).toBeDefined()
      expect(result?.action).toBe('lead-responded')
      expect(result?.description).toBe('Marks lead as responded and stops follow-up sequence')
    })

    it('should find handler for process-scheduled-followups action', () => {
      const result = HandlerService.findHandler('process-scheduled-followups')

      expect(result).toBeDefined()
      expect(result?.action).toBe('process-scheduled-followups')
      expect(result?.description).toBe('Processes all leads due for follow-up (Cloud Scheduler)')
    })

    it('should return undefined for unknown action', () => {
      const result = HandlerService.findHandler('unknown-action')

      expect(result).toBeUndefined()
    })

    it('should return undefined for empty action', () => {
      const result = HandlerService.findHandler('')

      expect(result).toBeUndefined()
    })

    it('should be case sensitive', () => {
      const result = HandlerService.findHandler('INITIATE-LEAD-FOLLOW-UP')

      expect(result).toBeUndefined()
    })
  })
})
