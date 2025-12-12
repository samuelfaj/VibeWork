// modules/pubsub/core/publishers.constants.ts
import { t } from 'elysia'

export const PUBLISHERS = {
  SEND_WHATSAPP_MESSAGE: {
    topic: 'send-whatsapp-message',
    schema: t.Object({
      countryPhone: t.String({ minLength: 1 }),
      message: t.String({ minLength: 1 }),
      leadId: t.String({ minLength: 1 }),
      step: t.String({ minLength: 1 }),
    }),
    description: 'Send WhatsApp message to a lead',
  },
}
