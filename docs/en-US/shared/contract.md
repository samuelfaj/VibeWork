# Contract Package Documentation

Guide to shared TypeBox schemas for end-to-end type safety.

## Overview

The `@vibe-code/contract` package contains TypeBox schemas for API contracts. These ensure type safety between frontend and backend.

## Location

```
shared/contract/
├── src/
│   ├── index.ts          # Barrel export
│   ├── user.ts           # User schemas
│   ├── notification.ts   # Notification schemas
│   └── __tests__/
├── dist/                 # Built types
└── package.json
```

## TypeBox

TypeBox is a TypeScript-first schema validation library.

### Basic Type

```typescript
import { Type, Static } from '@sinclair/typebox'

// Define schema
export const User = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String({ minLength: 1 }),
  createdAt: Type.String({ format: 'date-time' }),
})

// Get TypeScript type
type User = Static<typeof User>
// Equivalent to:
// type User = {
//   id: string
//   email: string
//   name: string
//   createdAt: string
// }
```

## User Schemas

**File:** `src/user.ts`

```typescript
import { Type, Static } from '@sinclair/typebox'

// Sign up request
export const SignupRequest = Type.Object({
  email: Type.String({
    format: 'email',
    description: 'User email address',
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 128,
    description: 'User password (min 8 chars)',
  }),
})

export type SignupRequest = Static<typeof SignupRequest>

// User response
export const UserResponse = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.Optional(Type.String()),
  image: Type.Optional(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
})

export type UserResponse = Static<typeof UserResponse>

// Login request
export const LoginRequest = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 1 }),
})

export type LoginRequest = Static<typeof LoginRequest>

// Session
export const Session = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  expiresAt: Type.String({ format: 'date-time' }),
})

export type Session = Static<typeof Session>

// Auth response
export const AuthResponse = Type.Object({
  user: UserResponse,
  session: Session,
})

export type AuthResponse = Static<typeof AuthResponse>
```

## Notification Schemas

**File:** `src/notification.ts`

```typescript
import { Type, Static } from '@sinclair/typebox'

// Create notification request
export const CreateNotificationRequest = Type.Object({
  title: Type.String({ minLength: 1 }),
  message: Type.String({ minLength: 1 }),
  type: Type.Enum({
    email: 'email',
    push: 'push',
    in_app: 'in-app',
  }),
  userId: Type.String(),
  metadata: Type.Optional(Type.Object({})),
})

export type CreateNotificationRequest = Static<typeof CreateNotificationRequest>

// Notification response
export const NotificationResponse = Type.Object({
  id: Type.String(),
  title: Type.String(),
  message: Type.String(),
  type: Type.String(),
  userId: Type.String(),
  read: Type.Boolean({ default: false }),
  readAt: Type.Optional(Type.String({ format: 'date-time' })),
  sentAt: Type.Optional(Type.String({ format: 'date-time' })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
})

export type NotificationResponse = Static<typeof NotificationResponse>

// List response with pagination
export const PaginatedNotifications = Type.Object({
  data: Type.Array(NotificationResponse),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    hasMore: Type.Boolean(),
  }),
})

export type PaginatedNotifications = Static<typeof PaginatedNotifications>
```

## Using Schemas in Backend

### Elysia Routes

```typescript
import { Elysia } from 'elysia'
import { SignupRequest, AuthResponse } from '@vibe-code/contract'

export const authRoutes = new Elysia().post(
  '/sign-up',
  async ({ body }) => {
    // body is typed as SignupRequest
    const response = await signupUser(body)
    // Must return AuthResponse
    return response
  },
  {
    body: SignupRequest,
    response: AuthResponse,
  }
)
```

### Type Safety

- ElysiaJS validates against schema
- Request is typed
- Response is typed
- Swagger documentation auto-generated

## Using Schemas in Frontend

### Eden RPC Client

Eden automatically types based on backend routes:

```typescript
import { client } from '@/lib/api'
import type { AuthResponse } from '@vibe-code/contract'

// Type-safe call
const response = await client.api.auth['sign-up'].post({
  email: 'test@example.com',
  password: 'SecurePassword123!',
})

// response is typed as AuthResponse
console.log(response.user.id)
```

### Validation

Validate data before sending:

```typescript
import { Value } from '@sinclair/typebox/value'
import { SignupRequest } from '@vibe-code/contract'

const data = {
  email: 'test@example.com',
  password: 'password',
}

if (Value.Check(SignupRequest, data)) {
  // Valid - send to backend
  await client.api.auth['sign-up'].post(data)
} else {
  // Invalid - show errors
  const errors = [...Value.Errors(SignupRequest, data)]
  console.error(errors)
}
```

## Schema Composition

### Extend Schemas

```typescript
import { Type, Static } from '@sinclair/typebox'

const BaseUser = Type.Object({
  id: Type.String(),
  email: Type.String(),
})

// Extend with additional properties
const FullUser = Type.Composite([
  BaseUser,
  Type.Object({
    name: Type.String(),
    createdAt: Type.String(),
  }),
])

// Or use spread
const FullUser2 = Type.Object({
  ...BaseUser.properties,
  name: Type.String(),
  createdAt: Type.String(),
})
```

### Optional Fields

```typescript
// Optional property
export const User = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.Optional(Type.String()),
})

// Or with default
export const UserWithDefaults = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.String({ default: '' }),
})
```

### Conditional Fields

```typescript
// Union type
export const NotificationPayload = Type.Union([
  Type.Object({
    type: Type.Literal('email'),
    recipientEmail: Type.String({ format: 'email' }),
  }),
  Type.Object({
    type: Type.Literal('push'),
    deviceToken: Type.String(),
  }),
  Type.Object({
    type: Type.Literal('in-app'),
    userId: Type.String(),
  }),
])
```

## Schema Validation

### Runtime Validation

```typescript
import { Value } from '@sinclair/typebox/value'
import { UserResponse } from '@vibe-code/contract'

const data = JSON.parse(apiResponse)

if (!Value.Check(UserResponse, data)) {
  const errors = [...Value.Errors(UserResponse, data)]
  console.error('Invalid response:', errors)
}
```

### Custom Validators

```typescript
import { Type, Custom } from '@sinclair/typebox'

// Custom format
export const StrongPassword = Type.String({
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
})

// Or with custom validator
const StrongPassword2 = Custom<string>((schema, value) => {
  // Validation logic
  return typeof value === 'string' && value.length >= 8
})
```

## Testing Schemas

```typescript
import { describe, it, expect } from 'vitest'
import { Value } from '@sinclair/typebox/value'
import { SignupRequest } from '@vibe-code/contract'

describe('SignupRequest schema', () => {
  it('should accept valid signup data', () => {
    const data = {
      email: 'test@example.com',
      password: 'SecurePassword123',
    }

    expect(Value.Check(SignupRequest, data)).toBe(true)
  })

  it('should reject invalid email', () => {
    const data = {
      email: 'invalid-email',
      password: 'SecurePassword123',
    }

    expect(Value.Check(SignupRequest, data)).toBe(false)
  })

  it('should reject short password', () => {
    const data = {
      email: 'test@example.com',
      password: 'short',
    }

    expect(Value.Check(SignupRequest, data)).toBe(false)
  })
})
```

## Best Practices

### Do's ✅

- Define all API contracts in contract package
- Use descriptive names
- Include validation rules (minLength, format, etc.)
- Document schemas with descriptions
- Use Type composition
- Keep schemas in sync between backend and frontend
- Test schema validation

### Don'ts ❌

- Don't define schemas in multiple places
- Don't skip validation
- Don't hardcode strings
- Don't mix frontend and backend validation
- Don't over-complicate schemas
- Don't forget to export types

## Updating Schemas

### Adding a Field

1. Add field to TypeBox schema
2. Update type (automatic)
3. Update backend implementation
4. Update frontend code
5. Run tests
6. Commit together

### Removing a Field

For backward compatibility:

1. Mark field as deprecated (if external API)
2. Add Optional wrapper
3. Update consumers
4. Remove in next major version

### Breaking Changes

```typescript
// v1
export const User = Type.Object({
  id: Type.String(),
  email: Type.String(),
  fullName: Type.String(), // Changed from name
})

// Keep v1 for compatibility
export const UserV1 = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.String(),
})

export const UserV2 = Type.Object({
  id: Type.String(),
  email: Type.String(),
  fullName: Type.String(),
})
```

## Documentation

- [TypeBox Official Docs](https://sinclairzx81.github.io/typebox/)
- [TypeBox GitHub](https://github.com/sinclairzx81/typebox)
- [JSON Schema Guide](https://json-schema.org/)

---

**Last Updated**: December 2024
