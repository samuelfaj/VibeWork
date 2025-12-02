# RESEARCH.md (Adapted from TASK7.1)

> This research was adapted from TASK7.1 (85% similar). Matching topics: authentication, api, database, testing, config, middleware, service, component, validation, error, logging.

# Research for TASK7.1

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.1/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.1/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

---

## Task Understanding Summary

Create Notification Typegoose model, service layer with CRUD operations, response formatter, and mockable Email service with AWS SES interface. See TODO.md for full implementation checklist.

---

## Files Discovered to Read/Modify

### Existing Files (Read-Only Context)

- `packages/contract/src/notification.ts:1-24` - TypeBox schemas for notification (id, userId, type, message, read, createdAt)
- `backend/src/infra/database/mongodb.ts:1-33` - MongoDB/Mongoose connection (already configured)
- `backend/src/infra/pubsub.ts:1-30` - Factory pattern with environment-based service switching
- `backend/modules/users/core/password.ts:1-30` - Core utility pattern example
- `backend/modules/users/core/__tests__/password.test.ts:1-43` - Unit test pattern example

### Files to Create

- `backend/modules/notifications/models/notification.model.ts`
- `backend/modules/notifications/core/notification.formatter.ts`
- `backend/modules/notifications/services/notification.service.ts`
- `backend/modules/notifications/services/email.service.ts`
- `backend/modules/notifications/core/__tests__/notification.formatter.test.ts`
- `backend/modules/notifications/services/__tests__/email.service.test.ts`

---

## Similar Components Found (LEARN FROM THESE)

### 1. Core Utility Pattern - `backend/modules/users/core/password.ts:1-30`

**Why similar:** Pure business logic in `core/` directory with validation and error handling
**Patterns to reuse:**

- Lines 10-15: Input validation before operation
- Lines 17-29: Try-catch with graceful failure returns
  **Key learnings:**
- Export named functions (not classes)
- Guard clauses at function start
- Consistent error handling with try-catch

### 2. Test Pattern - `backend/modules/users/core/__tests__/password.test.ts:1-43`

**Why similar:** Unit test for core utilities with comprehensive coverage
**Patterns to reuse:**

- Lines 1-2: Import from vitest and local module
- Lines 4-42: describe/it with multiple edge cases
- Happy path + error cases + boundary conditions
  **Key learnings:**
- Direct imports from vitest (`describe, it, expect`)
- No mocking for pure functions
- Test names describe behavior clearly

### 3. Environment-Based Factory - `backend/src/infra/pubsub.ts:3-8`

**Why similar:** Conditional service initialization based on environment
**Pattern:**

```typescript
export const pubsub = new PubSub({
  projectId: process.env.PUBSUB_PROJECT_ID,
  ...(process.env.PUBSUB_EMULATOR_HOST && {
    apiEndpoint: process.env.PUBSUB_EMULATOR_HOST,
  }),
})
```

**Key learnings:** Use spread operator with conditional for environment switching

### 4. Mock Pattern - `backend/src/infra/__tests__/mongodb.test.ts:3-18`

**Why similar:** External service mocking with vi.mock()
**Pattern:**

```typescript
const mockConnection = { readyState: 1, db: { admin: vi.fn(() => ({...})) } }
vi.mock('mongoose', () => ({ default: { connect: vi.fn(), connection: mockConnection } }))
```

**Key learnings:**

- Create mock objects before vi.mock()
- Use class pattern for mockable services
- Dynamic import after mock: `await import('../module')`

---

## Reusable Components (USE THESE, DON'T RECREATE)

### 1. Mongoose Connection - `backend/src/infra/database/mongodb.ts`

**Purpose:** MongoDB connection management
**How to use:**

```typescript
import mongoose from 'mongoose'
// Connection already established via connectMongo()
// Typegoose uses mongoose.connection internally
```

**Integration:** Typegoose models use existing mongoose connection automatically

### 2. Contract Schemas - `packages/contract/src/notification.ts:12-19`

**Purpose:** API response schema definition
**Reference for formatter output:**

```typescript
// NotificationSchema defines expected response format:
{
  id: string,        // Must convert _id to id
  userId: string,
  type: 'in-app' | 'email',
  message: string,
  read: boolean,
  createdAt: string  // Must format Date to ISO string
}
```

**Integration:** Formatter must produce output matching this schema

---

## Codebase Conventions Discovered

### File Organization

- `modules/[name]/core/` - Pure business logic utilities
- `modules/[name]/core/__tests__/` - Unit tests for core
- `modules/[name]/services/` - Data access and external integrations
- `modules/[name]/services/__tests__/` - Tests for services
- `modules/[name]/models/` - Database models (Typegoose/Drizzle)

### Naming Conventions

- Files: `kebab-case.ts` (e.g., `notification.model.ts`, `email.service.ts`)
- Functions: `camelCase` (e.g., `createNotification`, `formatNotificationResponse`)
- Classes: `PascalCase` (e.g., `Notification`, `SESEmailService`)
- Interfaces: `PascalCase` (e.g., `EmailService`)

### Error Handling Pattern

```typescript
// From password.ts:24-28
try {
  return await operation()
} catch {
  return false // Or appropriate fallback
}
```

### Testing Pattern

```typescript
// From password.test.ts:1-8
import { describe, it, expect } from 'vitest'
import { functionToTest } from '../module'

describe('module name', () => {
  it('should describe expected behavior', async () => {
    const result = await functionToTest(input)
    expect(result).toBe(expected)
  })
})
```

---

## Integration & Impact Analysis

### Upstream Dependencies

1. **Mongoose** from `backend/src/infra/database/mongodb.ts`
   - **What I need:** Active mongoose connection
   - **How to access:** Typegoose uses global mongoose connection
   - **Status:** Already implemented

2. **Contract Types** from `packages/contract/src/notification.ts`
   - **What I need:** NotificationType, CreateNotificationInput, Notification types
   - **How to access:** `import { ... } from '@vibework/contract'`
   - **Status:** Already implemented

### Downstream Consumers (Blocked by this task)

1. **TASK7.2** - Notification routes will use NotificationService
2. **TASK7.3** - Pub/Sub integration will use NotificationService.createNotification

### No Breaking Changes

This is a new module - no existing code depends on it yet.

---

## Test Strategy Discovered

### Testing Framework

- **Framework:** Vitest
- **Test command:** `bun test` or `vitest run`
- **Config:** Uses default vitest configuration

### Test Patterns Found

- **Test file location:** `__tests__/` directory inside module
- **Test structure:** describe-it with clear behavior descriptions
- **Example from:** `backend/modules/users/core/__tests__/password.test.ts:4-42`

### Mocking Approach

- **For external libraries:** `vi.mock('module-name', () => ({ ... }))`
- **For internal modules:** `vi.mock('../../path', () => ({ ... }))`
- **Pattern from:** `backend/src/infra/__tests__/mongodb.test.ts:13-18`

### AWS SDK Mocking Pattern (for email.service.test.ts)

```typescript
vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: class MockSESClient {
    send = vi.fn().mockResolvedValue({})
  },
  SendEmailCommand: class MockSendEmailCommand {
    constructor(public input: unknown) {}
  },
}))
```

---

## Risks & Challenges Identified

### Technical Risks

1. **AWS SES SDK Not Installed**
   - Impact: Medium
   - Mitigation: Need to add `@aws-sdk/client-ses` to dependencies
   - Verified: Not in `backend/package.json:18-31`

2. **Typegoose Index Configuration**
   - Impact: Low
   - Mitigation: Use `@index()` decorator for userId + createdAt compound index
   - Reference: Typegoose docs for index configuration

### Complexity Assessment

- Overall: Medium
- Reasoning: Multiple files to create but patterns are clear from existing code

### Missing Information

- [x] AWS SES region configuration - Use `process.env.AWS_REGION` or default to 'us-east-1'
- [x] Email sender address - Use `process.env.EMAIL_FROM` with validation

---

## Execution Strategy Recommendation

**Based on research findings, execute in this order:**

1. **Create Notification Model** - `backend/modules/notifications/models/notification.model.ts`
   - Follow pattern from PROMPT.md:26-47
   - Add index on userId + createdAt
   - Export NotificationModel via getModelForClass()

2. **Create Notification Formatter** - `backend/modules/notifications/core/notification.formatter.ts`
   - Follow contract schema from `packages/contract/src/notification.ts:12-19`
   - Convert `_id` (ObjectId) to `id` (string)
   - Format `createdAt` to ISO string

3. **Create Notification Service** - `backend/modules/notifications/services/notification.service.ts`
   - Follow core utility pattern from `password.ts`
   - Implement: createNotification, getUserNotifications, markAsRead
   - ALL queries filter by userId for security

4. **Create Email Service** - `backend/modules/notifications/services/email.service.ts`
   - Follow factory pattern from `pubsub.ts:3-8`
   - Interface + SESEmailService + MockEmailService
   - Factory function with environment toggle

5. **Create Unit Tests**
   - Formatter test: `backend/modules/notifications/core/__tests__/notification.formatter.test.ts`
   - Email test: `backend/modules/notifications/services/__tests__/email.service.test.ts`
   - Follow test pattern from `password.test.ts`
   - Mock AWS SDK following mongodb.test.ts pattern

6. **Verify**
   - Run: `bun test backend/modules/notifications --silent`
   - Typecheck: `bun run typecheck --filter=backend`

---

**Research completed:** 2025-12-02
**Total similar components found:** 4
**Total reusable components identified:** 2
**Estimated complexity:** Medium

---

## Task-Specific Additions

Review the content above and adapt as needed for this specific task.
