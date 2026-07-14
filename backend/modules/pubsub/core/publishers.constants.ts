// modules/pubsub/core/publishers.constants.ts
import { t } from 'elysia'

/**
 * Outbound Pub/Sub topics owned by this monorepo.
 * Only register topics that product modules actually publish.
 */
export const PUBLISHERS = {
  NOTIFICATION_CREATED: {
    topic: 'notification-created',
    schema: t.Object({
      id: t.String({ minLength: 1 }),
      userId: t.String({ minLength: 1 }),
      type: t.Union([t.Literal('in-app'), t.Literal('email')]),
      message: t.String({ minLength: 1 }),
      createdAt: t.String({ minLength: 1 }),
    }),
    description: 'Notification created event for email/async consumers',
  },
}
