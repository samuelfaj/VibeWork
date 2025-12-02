Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.1/TASK.md` - Task-level context
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.1/PROMPT.md` - Task-specific patterns

**You MUST read these files before implementing.**

---

## Dependencies

**From TASK3 (Contract Package):**
- `packages/contract/src/notification.ts` - TypeBox schemas for alignment

**From TASK5 (Backend Core):**
- `backend/infra/database/mongodb.ts` - MongoDB/Mongoose connection

---

## Implementation Plan

- [ ] **Item 1 — Notification Typegoose Model**
  - **What to do:**
    1. Create `/backend/modules/notifications/models/notification.model.ts`
    2. Define `Notification` class with Typegoose decorators
    3. Properties: `userId` (string, required), `type` ('in-app' | 'email', enum), `message` (string, required), `read` (boolean, default false), `createdAt` (Date, default now)
    4. Export `NotificationModel` via `getModelForClass(Notification)`

  - **Context (read-only):**
    - `PROMPT.md:26-48` — Typegoose model pattern

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/models/notification.model.ts`

  - **Performance:**
    - Add index on `userId` + `createdAt` for efficient queries

---

- [ ] **Item 2 — Notification Formatter**
  - **What to do:**
    1. Create `/backend/modules/notifications/core/notification.formatter.ts`
    2. `formatNotificationResponse(doc)` - Maps MongoDB doc to API response
    3. Convert `_id` to string `id`
    4. Format `createdAt` to ISO string

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/core/notification.formatter.ts`

---

- [ ] **Item 3 — Notification Service**
  - **What to do:**
    1. Create `/backend/modules/notifications/services/notification.service.ts`
    2. `createNotification(data): Promise<Notification>`
    3. `getUserNotifications(userId): Promise<Notification[]>`
    4. `markAsRead(id, userId): Promise<Notification | null>`
    5. ALL queries MUST filter by `userId`

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/services/notification.service.ts`

  - **Security:**
    - Filter by userId in ALL queries
    - Log operations without message content

---

- [ ] **Item 4 — Email Service**
  - **What to do:**
    1. Create `/backend/modules/notifications/services/email.service.ts`
    2. Define `EmailService` interface
    3. Implement `SESEmailService` using AWS SES SDK
    4. Implement `MockEmailService` for testing
    5. Export `createEmailService(useMock?)` factory function

  - **Context (read-only):**
    - `PROMPT.md:50-70` — Email service pattern

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/services/email.service.ts`

---

- [ ] **Item 5 — Unit Tests**
  - **What to do:**
    1. Create `/backend/modules/notifications/core/__tests__/notification.formatter.test.ts`
    2. Create `/backend/modules/notifications/services/__tests__/email.service.test.ts`
    3. Test formatter with happy path and edge cases
    4. Test MockEmailService resolves without error
    5. Test SESEmailService calls AWS SDK (mock SDK)

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/core/__tests__/notification.formatter.test.ts`
    - CREATE: `/backend/modules/notifications/services/__tests__/email.service.test.ts`

  - **Commands:**
    ```bash
    bun test backend/modules/notifications/core --silent
    bun test backend/modules/notifications/services/__tests__/email.service.test.ts --silent
    ```

---

## Verification

- [ ] Run unit tests:
      ```bash
      bun test backend/modules/notifications --silent
      ```

- [ ] Type check:
      ```bash
      bun run typecheck --filter=backend
      ```

---

## Acceptance Criteria

- [ ] `Notification` model defined with Typegoose decorators
- [ ] `NotificationService` implements create, list, markAsRead
- [ ] All queries filter by userId
- [ ] `EmailService` interface with SES and Mock implementations
- [ ] Unit tests pass
