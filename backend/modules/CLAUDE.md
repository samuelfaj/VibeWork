# Modules - Feature Modules

Modular feature modules that encapsulate business logic, routes, and data models. Each module is a self-contained feature that could potentially be extracted into a microservice.

## Purpose

Organizes backend code by business feature:

- **users** - User authentication and profile management
- **notifications** - User notifications with multi-channel delivery

This modular monolith architecture allows:

- **Independent development**: Features developed and tested in isolation
- **Clear boundaries**: Module interfaces are well-defined
- **Scalability**: Modules can be extracted to microservices
- **Code reuse**: Modules can be shared across different parts of the application

## Structure

```
modules/
├── health/                        # Health checks module
│   ├── CLAUDE.md                 # Module documentation
│   ├── index.ts                  # Module export
│   ├── routes/
│   │   ├── health.routes.ts      # Health check endpoints
│   │   └── health.routes.test.ts # Tests for routes (co-located)
│
├── users/                         # User authentication module
│   ├── CLAUDE.md                 # Module documentation
│   ├── core/
│   │   ├── password.ts           # Argon2 password hashing
│   │   └── password.test.ts      # Tests for password (co-located)
│   ├── routes/
│   │   ├── auth.routes.ts        # Better-Auth routes
│   │   └── user.routes.ts        # User profile endpoints
│   ├── schema/
│   │   ├── user.schema.ts        # Drizzle user table
│   │   └── auth.schema.ts        # Session/account tables
│   ├── services/
│   │   └── user.service.ts       # Business logic
│   └── integration.test.ts       # Integration tests (co-located)
│
└── notifications/                 # Notifications module
    ├── CLAUDE.md                 # Module documentation
    ├── routes/
    │   └── notification.routes.ts # REST API endpoints
    │   └── notification.routes.test.ts # Tests for routes (co-located)
    ├── services/
    │   ├── notification.service.ts # CRUD operations
    │   ├── notification-publisher.ts # Pub/Sub publishing
    │   ├── notification-publisher.test.ts # Tests for publisher (co-located)
    │   ├── notification-subscriber.ts # Pub/Sub subscription
    │   ├── email.service.ts       # Email delivery
    │   └── email.service.test.ts  # Tests for email service (co-located)
    ├── models/
    │   └── notification.model.ts  # Typegoose model
    ├── core/
    │   ├── notification.formatter.ts # Response formatting
    │   └── notification.formatter.test.ts # Tests for formatter (co-located)
    └── integration.test.ts        # Integration tests (co-located)
```

## Module Details

### `health` - Health Checks & Readiness Probes

**Location:** `backend/modules/health/`

**Purpose:** Provides liveness and readiness checks for container orchestration (Kubernetes, Docker Compose, etc.).

**Key Components:**

- **Routes** (`routes/health.routes.ts`)
  - `GET /healthz` - Liveness probe (simple health check)
  - `GET /readyz` - Readiness probe (checks all dependencies)

- **Implementation Details**
  - Each health check has a 5-second timeout
  - Readiness checks MySQL, MongoDB, and Redis in parallel
  - Returns HTTP 503 if any dependency check fails

**Reference:** See [`modules/health/CLAUDE.md`](health/CLAUDE.md) for detailed documentation.

---

### `users` - Authentication & User Management

**Location:** `backend/modules/users/`

**Purpose:** User registration, login, session management, and profile endpoints.

**Key Components:**

- **Routes** (`routes/auth.routes.ts`, `routes/user.routes.ts`)
  - `POST /auth/signup` - Register new user
  - `POST /auth/login` - Login user
  - `POST /auth/logout` - Logout user
  - `GET /users/me` - Get current user profile
  - `PATCH /users/me` - Update current user

- **Services** (`services/user.service.ts`)
  - User CRUD operations
  - Session management
  - Password validation

- **Core** (`core/password.ts`)
  - Argon2id password hashing
  - Password verification

- **Schema** (`schema/user.schema.ts`, `schema/auth.schema.ts`)
  - User table definition
  - Session and account tables
  - Verification links

**Database Tables:**

- `users` - User accounts
- `sessions` - Active sessions
- `accounts` - OAuth accounts (if used)
- `verificationTokens` - Email verification tokens

**Reference:** See [`modules/users/CLAUDE.md`](users/CLAUDE.md) for detailed documentation.

---

### `notifications` - User Notifications

**Location:** `backend/modules/notifications/`

**Purpose:** Send, retrieve, and manage user notifications across multiple channels.

**Key Components:**

- **Routes** (`routes/notification.routes.ts`)
  - `POST /notifications` - Create notification
  - `GET /notifications` - List user notifications
  - `GET /notifications/:id` - Get notification
  - `PATCH /notifications/:id` - Update notification (mark as read)
  - `DELETE /notifications/:id` - Delete notification

- **Services** (`services/`)
  - **notification.service.ts** - CRUD operations
  - **notification-publisher.ts** - Pub/Sub event publishing
  - **notification-subscriber.ts** - Pub/Sub event subscription (async processor)
  - **email.service.ts** - Email delivery via AWS SES

- **Models** (`models/notification.model.ts`)
  - Typegoose MongoDB model
  - Supports in-app and email notifications

- **Core** (`core/notification.formatter.ts`)
  - Response formatting
  - Data transformation

**Features:**

- CRUD operations for notifications
- Multi-channel delivery (in-app, email)
- Async processing with Pub/Sub
- Pagination support
- User isolation (X-User-Id header)
- Retry logic for failed deliveries

**Data Flow:**

1. API receives notification creation request
2. Notification published to Pub/Sub topic
3. Subscriber listens on subscription
4. Processes notification (send email, store in DB)
5. Acknowledges or retries on failure

**Reference:** See [`modules/notifications/CLAUDE.md`](notifications/CLAUDE.md) for detailed documentation.

---

## Module Architecture

### Standard Module Structure

Each module should follow this structure:

```
module-name/
├── CLAUDE.md               # Module documentation
├── routes/                 # API route handlers
│   └── *.routes.ts
├── services/               # Business logic
│   └── *.service.ts
├── models/                 # Data models (if using MongoDB)
│   └── *.model.ts
├── schema/                 # Database schema (if using MySQL)
│   └── *.schema.ts
├── core/                   # Core utilities
│   ├── *.ts
│   └── __tests__/
├── types.ts                # TypeScript types (optional)
└── __tests__/              # Integration tests
    └── *.test.ts
```

### Dependencies Between Modules

Modules should be loosely coupled:

**✅ Allowed:**

- Module → shared packages (`@vibe-code/contract`, `@vibe/ui`)
- Module → backend infrastructure (`infra/`)
- Module → i18n

**❌ Avoid:**

- Module A → Module B (unless explicit and documented)
- Cross-module service calls without abstraction
- Shared mutable state between modules

### Dependency Injection Pattern

Use services for dependency injection:

```typescript
// ✅ Good: Injected dependency
export function createNotificationService(
  pubsub: PubSubClient,
  emailService: EmailService
) {
  return {
    create: async (data) => {
      // Use injected dependencies
      await pubsub.publish(...)
      await emailService.send(...)
    },
  }
}

// ❌ Bad: Hardcoded dependencies
export const notificationService = {
  create: async (data) => {
    const pubsub = new PubSubClient()  // Hard to test
    const email = new EmailService()    // Hard to test
  },
}
```

---

## Adding a New Module

### 1. Create Module Directory

```bash
mkdir -p backend/modules/mymodule/{routes,services,schema,core,__tests__}
```

### 2. Create Routes

```typescript
// modules/mymodule/routes/mymodule.routes.ts
import { Elysia } from 'elysia'
import { myModuleService } from '../services'

export const myModuleRoutes = new Elysia({ prefix: '/mymodule' })
  .post('/', ({ body }) => myModuleService.create(body))
  .get('/', () => myModuleService.list())
  .get('/:id', ({ params: { id } }) => myModuleService.getById(id))
  .patch('/:id', ({ params: { id }, body }) => myModuleService.update(id, body))
  .delete('/:id', ({ params: { id } }) => myModuleService.delete(id))
```

### 3. Create Services

```typescript
// modules/mymodule/services/mymodule.service.ts
import { db } from '@/infra'

export const myModuleService = {
  create: async (data) => {
    // Business logic
    return db.insert(mymodules).values(data)
  },

  list: async () => {
    return db.query.mymodules.findMany()
  },

  getById: async (id) => {
    return db.query.mymodules.findFirst({
      where: eq(mymodules.id, id),
    })
  },

  update: async (id, data) => {
    return db.update(mymodules).set(data).where(eq(mymodules.id, id))
  },

  delete: async (id) => {
    return db.delete(mymodules).where(eq(mymodules.id, id))
  },
}
```

### 4. Register Routes in App

```typescript
// src/app.ts
import { myModuleRoutes } from '@/modules/mymodule/routes'

export const app = new Elysia().use(myModuleRoutes).use(otherRoutes)
```

### 5. Create Tests

```typescript
// modules/mymodule/__tests__/mymodule.routes.test.ts
import { describe, it, expect } from 'vitest'
import { app } from '@/app'

describe('MyModule Routes', () => {
  it('should create item', async () => {
    const response = await app.handle(
      new Request('http://localhost/mymodule', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      })
    )

    expect(response.status).toBe(201)
  })

  it('should list items', async () => {
    const response = await app.handle(new Request('http://localhost/mymodule'))

    expect(response.status).toBe(200)
  })
})
```

### 6. Create CLAUDE.md

Document the module with endpoints, architecture, and usage.

---

## Best Practices

### Service Layer Organization

```typescript
// ✅ Good: Clear, focused service
export const userService = {
  // Get user by email
  getByEmail: async (email: string) => {
    return db.query.users.findFirst({
      where: eq(users.email, email),
    })
  },

  // Verify password for login
  verifyPassword: async (userId: string, password: string) => {
    const user = await this.getById(userId)
    return verifyPassword(password, user.password)
  },

  // Update profile
  updateProfile: async (userId: string, data: ProfileUpdate) => {
    return db.update(users).set(data).where(eq(users.id, userId))
  },
}

// ❌ Bad: Unclear, mixed concerns
export const service = {
  do: async (x) => {
    // Multiple things happening
  },
}
```

### Error Handling

```typescript
// ✅ Good: Specific errors with context
export const userService = {
  getById: async (id: string) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!user) {
      throw new Error(`User not found: ${id}`)
    }

    return user
  },
}

// ❌ Bad: Generic errors
export const userService = {
  getById: async (id) => {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    }) // Returns undefined on not found, no error
  },
}
```

### Testing Modules

Test each layer:

```typescript
// Unit tests for core utilities
// modules/users/core/__tests__/password.test.ts

// Integration tests for routes
// modules/users/__tests__/auth.routes.test.ts

// Service tests
// modules/users/__tests__/user.service.test.ts
```

---

## Module Communication

### Calling Services from Other Modules

When modules need to communicate, use service functions:

```typescript
// ❌ Bad: Direct database access
import { db } from '@/infra'

const user = await db.query.users.findFirst(...)

// ✅ Good: Service abstraction
import { userService } from '@/modules/users/services'

const user = await userService.getById(userId)
```

### Through API Calls

For loosely coupled communication:

```typescript
// ❌ Bad: Internal service coupling
import { userService } from '@/modules/users/services'
await userService.sendWelcomeEmail(userId)

// ✅ Good: Event-driven via Pub/Sub
await pubsub.topic('user-created').publish({
  userId: userId,
  email: user.email,
})
```

---

## Related Documentation

- [`modules/users/CLAUDE.md`](users/CLAUDE.md) - User authentication module
- [`modules/notifications/CLAUDE.md`](notifications/CLAUDE.md) - Notifications module
- [`../src/infra/CLAUDE.md`](../src/infra/CLAUDE.md) - Infrastructure layer
- [`../src/routes/CLAUDE.md`](../src/routes/CLAUDE.md) - Route patterns
