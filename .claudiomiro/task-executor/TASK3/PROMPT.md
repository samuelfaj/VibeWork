## PROMPT
Create the `packages/contract` shared package with TypeBox schemas for User and Notification entities. These schemas enable type-safe Eden RPC between frontend and backend. Include CLAUDE.md documentation.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/packages/contract/package.json`
- `/packages/contract/tsconfig.json`
- `/packages/contract/src/index.ts`
- `/packages/contract/src/user.ts`
- `/packages/contract/src/notification.ts`
- `/packages/contract/CLAUDE.md`

### Schema Definitions

**User schemas (user.ts):**
```typescript
import { t } from 'elysia'

export const SignupSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 })
})

export const LoginSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String()
})

export const UserResponseSchema = t.Object({
  id: t.String(),
  email: t.String({ format: 'email' }),
  createdAt: t.String()
})
```

**Notification schemas (notification.ts):**
```typescript
import { t } from 'elysia'

export const NotificationTypeSchema = t.Union([
  t.Literal('in-app'),
  t.Literal('email')
])

export const CreateNotificationSchema = t.Object({
  userId: t.String(),
  type: NotificationTypeSchema,
  message: t.String()
})
```

## EXTRA DOCUMENTATION
- TypeBox: https://github.com/sinclairzx81/typebox
- Elysia validation: https://elysiajs.com/validation/overview.html

## LAYER
1

## PARALLELIZATION
Parallel with: [TASK1, TASK2, TASK4]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Use TypeBox via Elysia's `t` export
- All schemas must have proper TypeScript inference
- Export all types alongside schemas
- Verify with `bun run build` in package directory
