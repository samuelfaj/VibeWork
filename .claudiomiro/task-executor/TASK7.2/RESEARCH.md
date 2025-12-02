# Research for TASK7.2

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.2/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.2/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

---

## Task Understanding Summary

Implement Pub/Sub publisher for `notification-created` events and subscriber for async email notification processing, integrating with existing EmailService and Notification model.

---

## Files Discovered to Read/Modify

### Dependencies (read-only)

- `backend/src/infra/pubsub.ts:1-30` - Pub/Sub client export (`pubsub`), connection check, close functions
- `backend/modules/notifications/models/notification.model.ts:1-22` - Notification Typegoose model with `_id`, `userId`, `type`, `message`, `read`, `createdAt`
- `backend/modules/notifications/services/email.service.ts:1-42` - EmailService interface + `createEmailService()` factory
- `backend/modules/notifications/services/notification.service.ts:1-23` - `createNotification()` function (may need to call publisher)

### Files to Create

- `backend/modules/notifications/services/notification-publisher.ts`
- `backend/modules/notifications/services/notification-subscriber.ts`
- `backend/modules/notifications/services/__tests__/notification-publisher.test.ts`

---

## Similar Components Found (LEARN FROM THESE)

### 1. Pub/Sub Infrastructure - `backend/src/infra/pubsub.ts:1-30`

**Why similar:** Base Pub/Sub client we'll use
**Patterns to reuse:**

- Lines 3-8: PubSub instantiation with emulator support
- Lines 10-24: Connection check pattern with timeout
  **Key learnings:**
- Import as `import { pubsub } from '@/infra/pubsub'` or relative path
- Use `pubsub.topic(TOPIC_NAME)` for publishing
- Use `pubsub.subscription(SUBSCRIPTION_NAME)` for subscribing

### 2. Email Service Factory - `backend/modules/notifications/services/email.service.ts:37-41`

**Why similar:** Will be called by subscriber
**Pattern:**

```typescript
export function createEmailService(useMock?: boolean): EmailService {
  return (useMock ?? process.env.EMAIL_SERVICE_MOCK === 'true')
    ? new MockEmailService()
    : new SESEmailService()
}
```

**Key learnings:**

- Use `createEmailService()` factory in subscriber
- Interface: `sendEmail(to: string, subject: string, body: string): Promise<void>`

### 3. Notification Formatter - `backend/modules/notifications/core/notification.formatter.ts:12-21`

**Why similar:** Shows how to serialize notification for payload
**Pattern:**

```typescript
return {
  id: doc._id.toString(),
  userId: doc.userId,
  type: doc.type,
  message: doc.message,
  read: doc.read,
  createdAt: doc.createdAt.toISOString(),
}
```

---

## Reusable Components (USE THESE, DON'T RECREATE)

### 1. Pub/Sub Client - `backend/src/infra/pubsub.ts`

**Purpose:** Google Cloud Pub/Sub client with emulator support
**How to use:**

```typescript
import { pubsub } from '../../src/infra/pubsub'
// or adjust path based on location
```

### 2. EmailService Factory - `backend/modules/notifications/services/email.service.ts`

**Purpose:** Create email service (mock or SES)
**How to use:**

```typescript
import { createEmailService } from './email.service'
const emailService = createEmailService()
await emailService.sendEmail(to, subject, body)
```

### 3. Notification Model - `backend/modules/notifications/models/notification.model.ts`

**Purpose:** Typegoose model for MongoDB
**Type reference:** Use for type definitions in publisher/subscriber

---

## Codebase Conventions Discovered

### File Organization

- Services go in `modules/{module}/services/`
- Tests go in `modules/{module}/services/__tests__/`
- Use export functions (not classes) for services

### Naming Conventions

- Files: `kebab-case.ts` (e.g., `notification-publisher.ts`)
- Functions: `camelCase` (e.g., `publishNotificationCreated`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `TOPIC_NAME`)

### Error Handling Pattern

```typescript
// From backend/src/infra/pubsub.ts:10-24
try {
  // operation
  return true
} catch {
  console.error('[Context] Operation failed')
  return false
}
```

### Testing Pattern

```typescript
// From backend/src/infra/__tests__/pubsub.test.ts:1-43
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock at top level
const mockMethod = vi.fn().mockResolvedValue(value)
vi.mock('module', () => ({
  Class: class MockClass {
    method = mockMethod
  },
}))

describe('Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
    process.env.VAR = 'value'
  })

  it('should do something', async () => {
    const { importedFunction } = await import('../module')
    const result = await importedFunction()
    expect(result).toBe(expected)
  })
})
```

---

## Integration & Impact Analysis

### Functions/Classes/Components Being Modified:

None - this task creates NEW files. However:

### Potential Future Integration Point:

- `backend/modules/notifications/services/notification.service.ts:5-8`
  - **Function:** `createNotification()`
  - **Future integration:** After creating notification in DB, call `publishNotificationCreated()`
  - **NOT in scope for this task** - just building publisher/subscriber

### Pub/Sub Topic/Subscription:

- **Topic name:** `notification-created`
- **Subscription name:** `notification-created-sub`
- **Payload contract:**

```typescript
{
  id: string // Notification _id.toString()
  userId: string
  type: 'in-app' | 'email'
  message: string
  createdAt: string // ISO format
}
```

---

## Test Strategy Discovered

### Testing Framework

- **Framework:** Vitest
- **Test command:** `bun test` or `vitest run`
- **Config:** Via `vitest` in package.json

### Test Patterns Found

- **Test file location:** `__tests__/` subdirectory within service folder
- **Test structure:** describe-it with vi.mock at module level
- **Example from:** `backend/src/infra/__tests__/pubsub.test.ts:1-43`

### Mocking Approach

- **Pattern:** vi.mock with class mocks at top level
- **Dynamic import:** Use `await import('../module')` after mock setup
- **Clear mocks:** `vi.clearAllMocks()` and `vi.resetModules()` in beforeEach

### Key Mock Pattern for Pub/Sub:

```typescript
// Mock topic with publishMessage
const mockPublishMessage = vi.fn().mockResolvedValue('message-id-123')
const mockTopic = vi.fn().mockReturnValue({
  publishMessage: mockPublishMessage,
})

vi.mock('../../src/infra/pubsub', () => ({
  pubsub: {
    topic: mockTopic,
    subscription: mockSubscription,
  },
}))
```

---

## Risks & Challenges Identified

### Technical Risks

1. **Subscription Lifecycle Management**
   - Impact: Medium
   - Mitigation: Implement `startNotificationSubscriber()` and `stopNotificationSubscriber()` for graceful shutdown
   - Pattern: Similar to `closeRedisConnection()` in cache.ts

2. **Message Acknowledgment on Error**
   - Impact: Medium
   - Mitigation: Use `message.nack()` on EmailService error to allow retry
   - Reference: TODO.md specifies "Nack message on EmailService error"

3. **Payload Validation**
   - Impact: Low
   - Mitigation: Validate parsed JSON has required fields before processing

### Complexity Assessment

- Overall: Medium
- Reasoning: Standard Pub/Sub patterns, well-documented in Context7

### Missing Information

- [ ] **User lookup for email address** - Subscriber receives userId, but EmailService needs email address
  - **Impact:** Need to either include email in payload OR look up user
  - **Recommendation:** Follow PROMPT.md pattern which uses message content, not user lookup

---

## Execution Strategy Recommendation

**Based on research findings, execute in this order:**

1. **Create notification-publisher.ts**
   - Read: `PROMPT.md:26-43` for publish pattern
   - Follow: `backend/src/infra/pubsub.ts` for pubsub import
   - Create: `backend/modules/notifications/services/notification-publisher.ts`
   - Export: `publishNotificationCreated(notification): Promise<string>`

2. **Create notification-subscriber.ts**
   - Read: `PROMPT.md:46-67` for subscriber pattern
   - Reuse: `createEmailService()` from email.service.ts
   - Create: `backend/modules/notifications/services/notification-subscriber.ts`
   - Exports: `startNotificationSubscriber()`, `stopNotificationSubscriber()`
   - Handle: Only process type === 'email', ignore 'in-app'

3. **Create unit tests**
   - Follow: `backend/src/infra/__tests__/pubsub.test.ts` for mock pattern
   - Create: `backend/modules/notifications/services/__tests__/notification-publisher.test.ts`
   - Test cases:
     - Publisher publishes correct JSON payload
     - Publisher returns messageId
     - Subscriber calls EmailService for email type
     - Subscriber ignores in-app type
     - Subscriber nacks on error

4. **Verification**
   - Run: `bun test backend/modules/notifications/services --silent`
   - Run: `bun run typecheck --filter=backend`

---

**Research completed:** 2025-12-02
**Total similar components found:** 3
**Total reusable components identified:** 3
**Estimated complexity:** Medium
