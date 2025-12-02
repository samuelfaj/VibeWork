# @vibe-code/contract

Shared TypeBox schemas for type-safe Eden RPC between frontend and backend.

## Purpose

This package defines validation schemas using TypeBox (via Elysia's `t` export) that are shared across:

- **Backend**: Elysia route validation
- **Frontend**: Eden RPC type inference

## Structure

```
packages/contract/
├── src/
│   ├── index.ts             # Barrel export
│   ├── user.ts              # User schemas (Signup, Login, UserResponse)
│   ├── user.test.ts         # User tests (co-located)
│   ├── notification.ts      # Notification schemas
│   └── notification.test.ts # Notification tests (co-located)
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Adding New Schemas

1. Create a new file in `src/` (e.g., `src/product.ts`)
2. Import `t` from Elysia and `Static` for types:
   ```typescript
   import { t } from 'elysia'
   import type { Static } from 'elysia'
   ```
3. Define your schema:

   ```typescript
   export const ProductSchema = t.Object({
     id: t.String(),
     name: t.String({ minLength: 1 }),
     price: t.Number({ minimum: 0 }),
   })

   export type Product = Static<typeof ProductSchema>
   ```

4. Export from `src/index.ts`:
   ```typescript
   export * from './product'
   ```
5. Add tests in `src/product.test.ts` (co-located with source file, NOT in separate `__tests__` directory)

## Schema Naming Conventions

- Entity schemas: `{Entity}Schema` (e.g., `UserResponseSchema`)
- Input schemas: `{Action}{Entity}Schema` (e.g., `CreateNotificationSchema`)
- Type literals: `{Entity}TypeSchema` (e.g., `NotificationTypeSchema`)
- TypeScript types: Matching name without "Schema" (e.g., `UserResponse`)

## Usage Examples

### Backend (Elysia)

```typescript
import { SignupSchema } from '@vibe-code/contract'

app.post(
  '/auth/signup',
  ({ body }) => {
    // body is typed as SignupInput
  },
  {
    body: SignupSchema,
  }
)
```

### Frontend (Eden)

```typescript
import type { SignupInput } from '@vibe-code/contract'

const signup = async (data: SignupInput) => {
  return api.auth.signup.post(data)
}
```

## Commands

```bash
# Build package
bun run build

# Type check
bun run typecheck

# Run tests
bun run test
```

## Available Schemas

### User

- `SignupSchema` - Email (format: email), password (minLength: 8)
- `LoginSchema` - Email (format: email), password (string)
- `UserResponseSchema` - id, email, createdAt

### Notification

- `NotificationTypeSchema` - Union of 'in-app' | 'email'
- `CreateNotificationSchema` - userId, type, message
- `NotificationSchema` - Full notification with id, read status, timestamps
