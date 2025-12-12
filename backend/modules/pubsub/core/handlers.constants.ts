/* eslint-disable @typescript-eslint/no-require-imports */
import type { HandlerEntry } from './pubsub.types'

export const HANDLERS: Record<string, HandlerEntry> = {
  INITIATE_LEAD_FOLLOW_UP: {
    action: 'initiate-lead-follow-up',
    get handler() {
      return require('../../leads').FollowUpHandler.initiateFollowUp
    },
    description: 'Creates lead and sends initial follow-up message',
  },
  LEAD_RESPONDED: {
    action: 'lead-responded',
    get handler() {
      return require('../../leads').FollowUpHandler.handleResponse
    },
    description: 'Marks lead as responded and stops follow-up sequence',
  },
  PROCESS_SCHEDULED_FOLLOWUPS: {
    action: 'process-scheduled-followups',
    get handler() {
      return require('../../leads').FollowUpHandler.processScheduledFollowUps
    },
    description: 'Processes all leads due for follow-up (Cloud Scheduler)',
  },
}
