// modules/pubsub/receiver/routes/push.routes.ts
import { Elysia, t } from 'elysia'
import { PushController } from '../controllers/push.controller'

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// HTTP routing layer - delegates to PushController
// ═══════════════════════════════════════════════════════════════════════════════

export const pushRoutes = new Elysia({ prefix: '/pubsub' }).post(
  '/push',
  PushController.handlePush,
  {
    body: t.Object({
      message: t.Object({
        data: t.String(),
        messageId: t.String(),
        publishTime: t.String(),
        attributes: t.Optional(t.Record(t.String(), t.String())),
      }),
      subscription: t.String(),
    }),
  }
)
