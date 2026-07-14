import type { HandlerEntry } from './pubsub.types'

/**
 * Registry of Pub/Sub push actions (platform).
 *
 * Rules (AGENTS.md):
 * - Only register handlers for modules that **exist**
 * - Business logic lives in domain modules (`modules/<feature>/handlers/`)
 * - This file is wiring only — no product rules
 */
export const HANDLERS: Record<string, HandlerEntry> = {
  // Register domain actions here after implementing the domain handler, e.g.:
  // NOTIFICATION_EMAIL: {
  //   action: 'notification-email',
  //   get handler() {
  //     return require('../../notifications').NotificationHandler.sendEmail
  //   },
  //   description: 'Sends email for notification-created events',
  // },
}
