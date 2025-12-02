@dependencies [TASK3, TASK5, TASK7.1]
@scope backend

# Task: Pub/Sub Integration for Async Notification Processing

## Summary
Implement Pub/Sub integration for the Notification module: publisher for notification-created events and subscriber for async processing of email notifications.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates publisher for `notification-created` topic
- Creates subscriber to process email notifications asynchronously
- Integrates with EmailService from TASK7.1

## Complexity
Medium

## Dependencies
Depends on: [TASK3, TASK5, TASK7.1]
Blocks: [TASK7.3]
Parallel with: []

## Detailed Steps
1. Create notification publisher:
   - `/backend/modules/notifications/services/notification-publisher.ts`
   - Import Pub/Sub client from `backend/infra/pubsub.ts`
   - Topic name: `notification-created`
   - `publishNotificationCreated(notification)` - Serialize to JSON Buffer

2. Create notification subscriber:
   - `/backend/modules/notifications/services/notification-subscriber.ts`
   - Subscribe to `notification-created` topic
   - If type === 'email', call EmailService
   - Acknowledge message after processing

3. Write unit tests for publisher (mock Pub/Sub)

## Acceptance Criteria
- [ ] `publishNotificationCreated` publishes to correct topic
- [ ] Subscriber processes email type notifications
- [ ] Subscriber ignores 'in-app' type notifications
- [ ] Messages acknowledged after processing
- [ ] Unit tests pass with mocked Pub/Sub

## Code Review Checklist
- [ ] Topic name consistent: `notification-created`
- [ ] Proper error handling in subscriber
- [ ] Message payload validated before processing
- [ ] Pub/Sub client imported from infra layer

## Reasoning Trace
Pub/Sub enables async processing of notifications. Email sending is offloaded to background processing, improving API response times. The subscriber pattern allows scaling email processing independently.
