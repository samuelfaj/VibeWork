@dependencies [TASK0]
@scope backend

# Task: Shared Contract Package (TypeBox Schemas)

## Summary
Create the `packages/contract` package with TypeBox schemas for User and Notification entities. These schemas are shared between backend (Elysia validation) and frontend (Eden type inference).

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates `/packages/contract/` package structure
- Defines TypeBox schemas for User and Notification
- Enables type-safe Eden RPC between frontend and backend

## Complexity
Low

## Dependencies
Depends on: [TASK0]
Blocks: [TASK6, TASK7, TASK8, TASK9.1, TASK9.2, TASK9.3, TASK9.4, TASK9.5]
Parallel with: [TASK1, TASK2, TASK4]

## Detailed Steps
1. Create package structure:
   - `/packages/contract/package.json`
   - `/packages/contract/tsconfig.json`
   - `/packages/contract/src/index.ts`
   - `/packages/contract/src/user.ts`
   - `/packages/contract/src/notification.ts`

2. Define User schemas in `user.ts`:
   - `UserSchema`: id, email, createdAt
   - `SignupSchema`: email, password
   - `LoginSchema`: email, password
   - `UserResponseSchema`: user data without password

3. Define Notification schemas in `notification.ts`:
   - `NotificationSchema`: id, userId, type, message, read, createdAt
   - `CreateNotificationSchema`: userId, type, message
   - `NotificationTypeSchema`: 'in-app' | 'email'

4. Export all schemas from `index.ts`

5. Create `CLAUDE.md` documenting the package

## Acceptance Criteria
- [ ] Package compiles with `bun run build`
- [ ] TypeBox schemas export correctly
- [ ] User and Notification schemas defined
- [ ] All schemas have proper TypeScript types inferred
- [ ] `CLAUDE.md` documents how to add new schemas

## Code Review Checklist
- [ ] Schemas use TypeBox t.* functions
- [ ] All required fields marked appropriately
- [ ] Email validation uses format: 'email'
- [ ] Password has minLength constraint
- [ ] Exports are properly organized

## Reasoning Trace
Centralized contract package enables type-safe communication between frontend and backend via Eden. TypeBox schemas serve triple duty: runtime validation, TypeScript types, and OpenAPI documentation. Separating into dedicated package ensures clean dependency graph.
