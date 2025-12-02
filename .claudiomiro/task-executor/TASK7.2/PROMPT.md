## PROMPT
Implement Pub/Sub integration for async notification processing: publisher for notification-created events and subscriber for email notification processing.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/modules/notifications/services/notification-publisher.ts`
- `/backend/modules/notifications/services/notification-subscriber.ts`
- `/backend/modules/notifications/services/__tests__/notification-publisher.test.ts`

### Files From TASK7.1 to Reference
- `/backend/modules/notifications/models/notification.model.ts` - Notification type
- `/backend/modules/notifications/services/email.service.ts` - EmailService for subscriber

### Patterns to Follow

**Pub/Sub publish pattern:**
```typescript
import { pubsub } from '@/infra/pubsub'

const TOPIC_NAME = 'notification-created'

export async function publishNotificationCreated(notification: Notification): Promise<string> {
  const topic = pubsub.topic(TOPIC_NAME)
  const data = Buffer.from(JSON.stringify({
    id: notification._id.toString(),
    userId: notification.userId,
    type: notification.type,
    message: notification.message,
    createdAt: notification.createdAt.toISOString()
  }))
  const messageId = await topic.publishMessage({ data })
  return messageId
}
```

**Subscriber pattern:**
```typescript
import { pubsub } from '@/infra/pubsub'
import { createEmailService } from './email.service'

const SUBSCRIPTION_NAME = 'notification-created-sub'

export async function startNotificationSubscriber(): Promise<void> {
  const subscription = pubsub.subscription(SUBSCRIPTION_NAME)
  const emailService = createEmailService()

  subscription.on('message', async (message) => {
    const payload = JSON.parse(message.data.toString())

    if (payload.type === 'email') {
      await emailService.sendEmail(/* ... */)
    }

    message.ack()
  })
}
```

### Integration Points
- Uses Pub/Sub client from `backend/infra/pubsub.ts` (TASK5)
- Uses EmailService from TASK7.1
- Uses Notification model from TASK7.1

## EXTRA DOCUMENTATION
- Google Cloud Pub/Sub: https://cloud.google.com/pubsub/docs

## LAYER
3

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Use Pub/Sub for async, not Redis
- Topic name must be `notification-created`
- Validate message payload before processing
