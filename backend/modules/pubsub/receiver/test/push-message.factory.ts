// modules/pubsub/receiver/test/push-message.factory.ts
import type { PubSubPushMessage } from '@modules/pubsub/core/pubsub.types'

export function createPushMessage(payload: {
  action: string
  body?: Record<string, unknown>
}): PubSubPushMessage {
  return {
    message: {
      data: Buffer.from(JSON.stringify(payload)).toString('base64'),
      messageId: `msg-${Date.now()}`,
      publishTime: new Date().toISOString(),
      attributes: { source: 'test' },
    },
    subscription: 'projects/test-project/subscriptions/test-subscription',
  }
}

export function createInvalidBase64Message(): PubSubPushMessage {
  return {
    message: {
      data: Buffer.from('not valid json').toString('base64'),
      messageId: `msg-${Date.now()}`,
      publishTime: new Date().toISOString(),
    },
    subscription: 'projects/test-project/subscriptions/test-subscription',
  }
}
