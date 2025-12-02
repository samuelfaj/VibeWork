Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.2/TASK.md` - Task-level context
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.2/PROMPT.md` - Task-specific patterns

**You MUST read these files before implementing.**

---

## Dependencies

**From TASK5 (Backend Core):**
- `backend/infra/pubsub.ts` - Pub/Sub client export

**From TASK7.1 (Notification Model + Email Service):**
- `/backend/modules/notifications/models/notification.model.ts` - Notification type
- `/backend/modules/notifications/services/email.service.ts` - EmailService for processing

---

## Implementation Plan

- [ ] **Item 1 — Notification Publisher**
  - **What to do:**
    1. Create `/backend/modules/notifications/services/notification-publisher.ts`
    2. Import Pub/Sub client from `backend/infra/pubsub.ts`
    3. Define topic: `notification-created`
    4. Implement `publishNotificationCreated(notification)`:
       - Serialize notification to JSON Buffer
       - Publish to topic
       - Return messageId

  - **Context (read-only):**
    - `PROMPT.md:26-42` — Pub/Sub publish pattern

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/services/notification-publisher.ts`

  - **Interfaces:**
    ```typescript
    export async function publishNotificationCreated(notification: Notification): Promise<string>
    ```

  - **Observability:**
    - Log message publish with messageId

---

- [ ] **Item 2 — Notification Subscriber**
  - **What to do:**
    1. Create `/backend/modules/notifications/services/notification-subscriber.ts`
    2. Subscribe to `notification-created` subscription
    3. On message:
       - Parse JSON payload
       - If type === 'email', call EmailService.sendEmail()
       - Acknowledge message after processing
    4. Implement `startNotificationSubscriber()` and `stopNotificationSubscriber()`

  - **Context (read-only):**
    - `PROMPT.md:44-62` — Subscriber pattern

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/services/notification-subscriber.ts`

  - **Interfaces:**
    ```typescript
    export async function startNotificationSubscriber(): Promise<void>
    export async function stopNotificationSubscriber(): Promise<void>
    ```

  - **Security:**
    - Validate message payload schema before processing
    - Use dead-letter queue for failed messages

  - **Error Handling:**
    - Nack message on EmailService error (for retry)
    - Log errors with correlation ID

---

- [ ] **Item 3 — Unit Tests**
  - **What to do:**
    1. Create `/backend/modules/notifications/services/__tests__/notification-publisher.test.ts`
    2. Mock Pub/Sub client
    3. Test `publishNotificationCreated` calls topic.publishMessage with correct payload
    4. Test subscriber processes email type and calls EmailService
    5. Test subscriber ignores 'in-app' type

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/services/__tests__/notification-publisher.test.ts`

  - **Tests:**
    - Happy path: Publisher publishes correct payload
    - Happy path: Subscriber processes email type
    - Edge case: Subscriber ignores in-app type
    - Failure: Subscriber nacks on error

  - **Commands:**
    ```bash
    bun test backend/modules/notifications/services/__tests__/notification-publisher.test.ts --silent
    ```

---

## Verification

- [ ] Run unit tests:
      ```bash
      bun test backend/modules/notifications/services --silent
      ```

- [ ] Type check:
      ```bash
      bun run typecheck --filter=backend
      ```

---

## Acceptance Criteria

- [ ] `publishNotificationCreated` publishes to `notification-created` topic
- [ ] Subscriber processes email type notifications via EmailService
- [ ] Subscriber ignores 'in-app' type notifications
- [ ] Messages acknowledged after processing
- [ ] Unit tests pass
