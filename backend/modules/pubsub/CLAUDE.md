# @vibework/pubsub

Centralized Google Cloud Pub/Sub module handling both message receiving and publishing for asynchronous event-driven communication.

## Purpose

Unified Pub/Sub messaging infrastructure:

- **Receiver**: HTTP endpoint for receiving Pub/Sub push messages, decoding payloads, and routing to handlers
- **Publisher**: Generic and specialized services for publishing messages to Pub/Sub topics
- **Core**: Shared types, constants, and handler registry

## Structure

```
modules/pubsub/
├── core/
│   ├── pubsub.types.ts          # TypeScript interfaces
│   └── handlers.constants.ts    # Handler table & action constants
├── receiver/
│   ├── controllers/
│   │   └── push.controller.ts   # HTTP request/response handling
│   ├── routes/
│   │   ├── push.routes.ts
│   │   └── push.routes.test.ts
│   ├── services/
│   │   ├── payload-decoder.service.ts
│   │   └── payload-decoder.service.test.ts
│   └── test/
│       └── push-message.factory.ts
├── publisher/
│   └── services/
│       ├── pubsub.publisher.ts         # Generic publisher for any topic
│       ├── pubsub.publisher.test.ts
│       ├── whatsapp.publisher.ts       # Specialized WhatsApp publisher
│       └── whatsapp.publisher.test.ts
├── index.ts                     # Barrel exports
└── CLAUDE.md                    # This documentation
```

## Architecture

### Receiver (Incoming Messages)

```
HTTP POST /pubsub/push
  → Routes → Controller → PayloadDecoderService
      → Lookup Handler → Execute Handler → Response
```

| Layer          | Responsibility                              |
| -------------- | ------------------------------------------- |
| **Routes**     | HTTP routing, request validation (Elysia)   |
| **Controller** | Request/response handling, error formatting |
| **Service**    | Payload decoding, error handling            |
| **Handler**    | Business logic (in domain modules)          |

### Publisher (Outgoing Messages)

```
Service Code
  → PubSubPublisher.publish('topic', payload)
      → Buffer.from(JSON.stringify(payload))
          → pubsub.topic('topic').publishMessage(data)
```

Specialized publishers build on `PubSubPublisher`:

```
WhatsAppPublisher.send(phone, message, leadId, step)
  → PubSubPublisher.publish('send-whatsapp-message', { ... })
```

## API Endpoints

### POST /pubsub/push

Receives and processes Pub/Sub push messages.

**Request Body (from Google Cloud Pub/Sub):**

```json
{
  "message": {
    "data": "base64-encoded-json",
    "messageId": "1234567890",
    "publishTime": "2025-12-11T16:00:00.000Z"
  },
  "subscription": "projects/xxx/subscriptions/yyy"
}
```

**Decoded Payload Format:**

```json
{
  "action": "initiate-lead-follow-up",
  "body": { "countryPhone": "5551999999999" }
}
```

**Responses:**

| Status | Condition        | Response                              |
| ------ | ---------------- | ------------------------------------- |
| 200    | Handler found    | `{ success: true, handled: true }`    |
| 200    | No handler (ack) | `{ success: true, handled: false }`   |
| 400    | Invalid payload  | `{ error: { code, message } }`        |
| 500    | Handler threw    | `{ error: { code: "HANDLER_ERROR" }}` |

## Publishing to Pub/Sub

### Generic Publisher

```typescript
import { PubSubPublisher } from '@/modules/pubsub'

await PubSubPublisher.publish('my-topic', {
  action: 'my-action',
  userId: 'user-123',
  data: { foo: 'bar' },
})
```

### Specialized Publishers

```typescript
import { WhatsAppPublisher } from '@/modules/pubsub'

await WhatsAppPublisher.send(
  '5551999999999', // countryPhone
  'Hello! 👋', // message
  'lead-123', // leadId
  'initial' // step
)
```

## Handler Registration

All handlers are registered in `core/handlers.constants.ts`:

```typescript
export const PUBSUB_ACTIONS = {
  INITIATE_LEAD_FOLLOW_UP: 'initiate-lead-follow-up',
  LEAD_RESPONDED: 'lead-responded',
  PROCESS_SCHEDULED_FOLLOWUPS: 'process-scheduled-followups',
} as const

export const pubsubHandlers: HandlerEntry[] = [
  {
    action: PUBSUB_ACTIONS.INITIATE_LEAD_FOLLOW_UP,
    handler: FollowUpHandler.initiateFollowUp,
    description: 'Creates lead and sends initial follow-up message',
  },
  // ... more handlers
]
```

## Adding New Handlers

1. Add action constant to `PUBSUB_ACTIONS`
2. Create handler as static class method in domain module
3. Register in `pubsubHandlers` array

```typescript
// In core/handlers.constants.ts
import { MyDomainHandler } from '../../my-domain'

export const PUBSUB_ACTIONS = {
  // existing...
  MY_NEW_ACTION: 'my-new-action',
} as const

export const pubsubHandlers: HandlerEntry[] = [
  // existing...
  {
    action: PUBSUB_ACTIONS.MY_NEW_ACTION,
    handler: MyDomainHandler.handleAction,
    description: 'Description of what it does',
  },
]
```

## Adding New Publishers

1. Create specialized publisher class inheriting from or using `PubSubPublisher`
2. Implement topic-specific sending logic
3. Export from `index.ts`

```typescript
// publisher/services/custom.publisher.ts
import { PubSubPublisher } from './pubsub.publisher'

export class CustomPublisher {
  private static readonly TOPIC = 'custom-topic'

  static async send(data: MyData): Promise<PublishResult> {
    return await PubSubPublisher.publish(this.TOPIC, data)
  }
}
```

## Payload Decoder Service

Static class for decoding Pub/Sub push messages:

```typescript
import { PayloadDecoderService } from '@/modules/pubsub'

const { payload, metadata } = PayloadDecoderService.decode(pushMessage)
// payload = { action: string, body: unknown }
// metadata = { messageId, publishTime, subscription, attributes }
```

**Error Codes:**

| Code                | Description             |
| ------------------- | ----------------------- |
| `INVALID_BASE64`    | Invalid base64 encoding |
| `INVALID_JSON`      | Invalid JSON            |
| `MISSING_ACTION`    | No `action` field       |
| `INVALID_STRUCTURE` | Payload not an object   |

## Topics

Application topics (topics must be created manually in GCP):

| Topic                         | Direction | Purpose                     |
| ----------------------------- | --------- | --------------------------- |
| `initiate-lead-follow-up`     | Receive   | New leads from Meta forms   |
| `lead-responded`              | Receive   | Lead response events        |
| `process-scheduled-followups` | Receive   | Cloud Scheduler trigger     |
| `send-whatsapp-message`       | Send      | WhatsApp message publishing |

## Registering with App

In `src/app.ts`:

```typescript
import { pubsubModule } from '@/modules/pubsub'

export const app = new Elysia().use(pubsubModule) // Adds POST /pubsub/push endpoint
```

## Testing

```bash
# Test receiver
bun test modules/pubsub/receiver

# Test publisher
bun test modules/pubsub/publisher

# Test all
bun test modules/pubsub
```

**Test Pattern (Receiver):**

```typescript
vi.mock('../../core/handlers.constants', () => ({
  findHandler: vi.fn(),
}))

it('should handle action', async () => {
  vi.mocked(findHandler).mockReturnValue({
    action: 'test',
    handler: vi.fn().mockResolvedValue({ success: true }),
  })
  // ... make request
})
```

**Test Pattern (Publisher):**

```typescript
vi.mock('../../../src/infra')

it('should publish message', async () => {
  vi.mocked(pubsub.topic).mockReturnValue({
    publishMessage: vi.fn().mockResolvedValue('msg-123'),
  })
  // ... call publisher
})
```

## Troubleshooting

### No Handler for Action

```
[PubSub] No handler for action: unknown-action
```

- Ensure action is registered in `core/handlers.constants.ts`
- Check action name matches exactly

### Payload Decoding Error

```
PayloadDecodingError: Failed to decode base64
```

- Verify message data is properly base64 encoded
- Check message structure matches `PubSubPushMessage`

### Handler Execution Error

```
[PubSub] Handler error: Handler failed
```

- Check handler logs for specific error
- Verify handler input/output matches contract
- Check dependencies are available

## Related Documentation

- [Google Cloud Pub/Sub Documentation](https://cloud.google.com/pubsub/docs)
- [Module Architecture](../CLAUDE.md)
- [Infra - Pub/Sub Configuration](../../src/infra/CLAUDE.md)
