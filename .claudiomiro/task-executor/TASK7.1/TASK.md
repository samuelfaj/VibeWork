@dependencies [TASK3, TASK5]
@scope backend

# Task: Notification Model, Service Layer, and Email Service

## Summary
Create the foundational components of the Notification module: Typegoose model for MongoDB, notification service layer with CRUD operations, formatter for API responses, and mockable Email service with AWS SES interface.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates Typegoose model with userId, type, message, read, createdAt
- Implements notification service with CRUD operations filtered by userId
- Creates response formatter for MongoDB documents
- Implements EmailService interface with SES and Mock implementations

## Complexity
Medium

## Dependencies
Depends on: [TASK3, TASK5]
Blocks: [TASK7.2, TASK7.3]
Parallel with: []

## Detailed Steps
1. Create Notification Typegoose model:
   - `/backend/modules/notifications/models/notification.model.ts`
   - Properties: userId (string), type ('in-app' | 'email'), message (string), read (boolean), createdAt (Date)

2. Create notification formatter:
   - `/backend/modules/notifications/core/notification.formatter.ts`
   - Convert MongoDB doc to API response format

3. Create notification service:
   - `/backend/modules/notifications/services/notification.service.ts`
   - createNotification, getUserNotifications, markAsRead
   - All queries filtered by userId

4. Create email service:
   - `/backend/modules/notifications/services/email.service.ts`
   - EmailService interface
   - SESEmailService implementation
   - MockEmailService implementation
   - Factory function to create service based on environment

5. Write unit tests for formatter and email service

## Acceptance Criteria
- [ ] `Notification` model defined with Typegoose decorators
- [ ] `NotificationService` implements create, list, markAsRead
- [ ] All queries filter by userId
- [ ] `EmailService` interface defined
- [ ] `SESEmailService` and `MockEmailService` implemented
- [ ] Factory function toggles mock via environment variable
- [ ] Unit tests pass for formatter and email service

## Code Review Checklist
- [ ] Typegoose decorators properly applied
- [ ] SES service is mockable (interface pattern)
- [ ] Notifications filtered by userId in all queries
- [ ] ObjectId converted to string in formatter

## Reasoning Trace
This subtask establishes the data model and core business logic. The email service is included here because it's independent and can be developed in parallel with the model/service layer. Both are foundational for the Pub/Sub and Routes subtasks.
