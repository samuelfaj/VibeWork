@dependencies [TASK3, TASK5, TASK7.1, TASK7.2]
@scope backend

# Task: Notification API Routes, Module Integration, and Documentation

## Summary
Implement the Notification module's API routes (CRUD endpoints), integrate with the main Elysia app, and create module documentation.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates CRUD routes: POST /notifications, GET /notifications, PATCH /notifications/:id/read
- Creates module index for Elysia plugin export
- Integrates with main app
- Creates CLAUDE.md documentation

## Complexity
Medium

## Dependencies
Depends on: [TASK3, TASK5, TASK7.1, TASK7.2]
Blocks: [TASK8, TASK11, TASK12]
Parallel with: []

## Detailed Steps
1. Create notification routes:
   - `/backend/modules/notifications/routes/notification.routes.ts`
   - POST /notifications - Create notification (validates with contract schema)
   - GET /notifications - List user's notifications (paginated)
   - PATCH /notifications/:id/read - Mark as read

2. Create module index:
   - `/backend/modules/notifications/index.ts`
   - Export Elysia plugin with routes

3. Integrate with main app:
   - Modify `/backend/src/app.ts` to mount notifications module

4. Create module documentation:
   - `/backend/modules/notifications/CLAUDE.md`
   - API endpoints, dependencies, testing instructions

5. Write integration tests for routes

## Acceptance Criteria
- [ ] `POST /notifications` creates notification and returns 201
- [ ] `GET /notifications` lists only authenticated user's notifications
- [ ] `PATCH /notifications/:id/read` marks notification as read
- [ ] Routes validate with contract schemas
- [ ] Module mounted in main app
- [ ] `CLAUDE.md` documents all endpoints
- [ ] Integration tests pass

## Code Review Checklist
- [ ] Routes require authentication
- [ ] Queries filter by authenticated userId
- [ ] Pagination implemented on GET
- [ ] Validation uses schemas from contract package
- [ ] Proper error responses (400, 403, 404)

## Reasoning Trace
This subtask brings together all components from TASK7.1 and TASK7.2 into a working API. Routes call the service layer, trigger Pub/Sub publishing, and enforce authentication. Documentation ensures the module is maintainable.
