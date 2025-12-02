Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.3/TASK.md` - Task-level context
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.3/PROMPT.md` - Task-specific patterns

**You MUST read these files before implementing.**

---

## Dependencies

**From TASK3 (Contract Package):**
- `packages/contract/src/notification.ts` - TypeBox schemas: `CreateNotificationSchema`, `NotificationSchema`

**From TASK5 (Backend Core):**
- `backend/src/app.ts` - Elysia app to mount routes

**From TASK7.1:**
- `/backend/modules/notifications/services/notification.service.ts` - CRUD operations
- `/backend/modules/notifications/core/notification.formatter.ts` - Response formatting

**From TASK7.2:**
- `/backend/modules/notifications/services/notification-publisher.ts` - Pub/Sub publishing

---

## Implementation Plan

- [ ] **Item 1 — Notification Routes**
  - **What to do:**
    1. Create `/backend/modules/notifications/routes/notification.routes.ts`
    2. Implement `POST /notifications`:
       - Validate body with `CreateNotificationSchema`
       - Call `notificationService.createNotification()`
       - Call `publishNotificationCreated()`
       - Return 201 with formatted response
    3. Implement `GET /notifications`:
       - Get userId from auth context
       - Call `notificationService.getUserNotifications(userId)`
       - Support pagination (page, limit query params)
       - Return paginated response
    4. Implement `PATCH /notifications/:id/read`:
       - Get userId from auth context
       - Call `notificationService.markAsRead(id, userId)`
       - Return 404 if not found, 403 if wrong user
       - Return formatted response

  - **Context (read-only):**
    - `PROMPT.md:26-58` — ElysiaJS routes pattern

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/routes/notification.routes.ts`

  - **Security:**
    - Require authentication on all routes
    - Filter by userId from auth context
    - Validate ObjectId format for :id param

---

- [ ] **Item 2 — Module Index**
  - **What to do:**
    1. Create `/backend/modules/notifications/index.ts`
    2. Import `notificationRoutes`
    3. Export `notificationsModule` Elysia plugin

  - **Context (read-only):**
    - `PROMPT.md:60-65` — Module index pattern

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/index.ts`

---

- [ ] **Item 3 — App Integration**
  - **What to do:**
    1. Modify `/backend/src/app.ts`
    2. Import `notificationsModule` from `./modules/notifications`
    3. Mount with `.use(notificationsModule)`

  - **Touched (will modify):**
    - MODIFY: `/backend/src/app.ts`

---

- [ ] **Item 4 — Integration Tests**
  - **What to do:**
    1. Create `/backend/modules/notifications/__tests__/notification.routes.test.ts`
    2. Use Testcontainers for MongoDB
    3. Test scenarios:
       - POST creates notification, returns 201
       - GET returns only user's notifications
       - PATCH marks as read
       - GET with no notifications returns empty array
       - POST with invalid type returns 400
       - PATCH non-existent returns 404

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/__tests__/notification.routes.test.ts`

  - **Commands:**
    ```bash
    bun test backend/modules/notifications/__tests__/notification.routes.test.ts --silent
    ```

---

- [ ] **Item 5 — Module Documentation (CLAUDE.md)**
  - **What to do:**
    1. Create `/backend/modules/notifications/CLAUDE.md`
    2. Document:
       - Module purpose
       - API endpoints with request/response examples
       - Dependencies (contract, Pub/Sub, MongoDB)
       - How to test locally
       - Environment variables
       - Architecture overview (ASCII)

  - **Touched (will create):**
    - CREATE: `/backend/modules/notifications/CLAUDE.md`

---

## Verification

- [ ] Run integration tests:
      ```bash
      bun test backend/modules/notifications/__tests__/notification.routes.test.ts --silent
      ```

- [ ] Run all notification module tests:
      ```bash
      bun test backend/modules/notifications --silent
      ```

- [ ] Type check:
      ```bash
      bun run typecheck --filter=backend
      ```

---

## Acceptance Criteria

- [ ] `POST /notifications` creates notification and returns 201
- [ ] `GET /notifications` lists only authenticated user's notifications
- [ ] `PATCH /notifications/:id/read` marks notification as read
- [ ] Routes validate with contract schemas
- [ ] Module mounted in main app
- [ ] `CLAUDE.md` documents all endpoints
- [ ] Integration tests pass

---

## Follow-ups

- **Auth middleware:** If TASK6 not complete, create placeholder auth guard that extracts userId from `X-User-Id` header for testing.
- **Email recipient:** Need to decide how to get recipient email for email notifications (add to schema or lookup from User service).
