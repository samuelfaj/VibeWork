# Backend Modules Guide

Guide to the modular monolith architecture and individual modules.

## Overview

The backend is organized as a modular monolith with feature modules that can be independently developed, tested, and potentially extracted into microservices.

### Module Structure

```
backend/modules/
├── users/                    # User management & authentication
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── __tests__/
│   ├── services/
│   │   └── user.service.ts
│   ├── schema/
│   │   └── user.schema.ts
│   ├── index.ts
│   └── CLAUDE.md
└── notifications/            # Notification system
    ├── routes/
    │   └── notification.routes.ts
    ├── models/
    │   └── notification.model.ts
    ├── services/
    │   ├── notification.service.ts
    │   ├── email.service.ts
    │   └── publisher.service.ts
    ├── index.ts
    └── CLAUDE.md
```

## Users Module

The Users module handles authentication and user profile management.

### Features

- **Sign Up**: Create new user account
- **Sign In**: Login with email/password
- **Sessions**: Manage active sessions
- **Profiles**: Get/update user information
- **Password Hashing**: Argon2id algorithm
- **Session Storage**: MySQL database

### Architecture

```
Request → auth.routes.ts → Better-Auth Handler
            ↓
        Service Layer (optional)
            ↓
        MySQL (Drizzle ORM)
            ↓
        Response
```

### Files

**Routes** (`routes/`)

- `auth.routes.ts` - Better-Auth integration endpoints
- `user.routes.ts` - User profile endpoints

**Services** (`services/`)

- `user.service.ts` - User operations (create, read, update)

**Schema** (`schema/`)

- `user.schema.ts` - Drizzle table definitions

### Key Endpoints

| Endpoint                  | Method | Description    |
| ------------------------- | ------ | -------------- |
| `/api/auth/sign-up/email` | POST   | Create account |
| `/api/auth/sign-in/email` | POST   | Login          |
| `/api/auth/sign-out`      | POST   | Logout         |
| `/api/auth/session`       | GET    | Get session    |
| `/api/users/me`           | GET    | Current user   |
| `/api/users/me`           | PUT    | Update profile |
| `/api/users/:id`          | GET    | User profile   |

See [API Reference](./api-reference.md) for details.

### Database Schema

**users table:**

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**sessions table:**

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Usage Example

```typescript
// In a route handler
import { userService } from '@/modules/users'

export const getUserProfile = async (userId: string) => {
  const user = await userService.findById(userId)
  return user
}

// In a test
import { userService } from '@/modules/users'

it('should create user', async () => {
  const user = await userService.create({
    email: 'test@example.com',
    password: 'securepassword123',
  })

  expect(user.email).toBe('test@example.com')
})
```

### Configuration

**Environment Variables:**

```env
AUTH_SECRET=<random_secure_key>
AUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback/[provider]
AUTH_TRUST_HOST=true
```

**Better-Auth Setup:**
Located in `src/infra/auth.ts`

- Session adapter: MySQL via Drizzle
- Password hashing: Argon2id
- Cookie settings: HttpOnly, SameSite=Lax

### Testing

**Unit Tests:**

```bash
cd backend
bun run test modules/users
```

**Integration Tests:**

```bash
bun run test:integration modules/users
```

Test files located in `modules/users/**/__tests__/`

### Detailed Documentation

See `backend/modules/users/CLAUDE.md` for:

- Complete schema definitions
- Service interfaces
- Authentication flow
- Security considerations
- Database operations

## Notifications Module

The Notifications module handles creation, retrieval, and delivery of notifications.

### Features

- **Create Notifications**: Add new notifications
- **List Notifications**: Get user notifications with filtering
- **Update Status**: Mark as read/delivered
- **Email Delivery**: Send via AWS SES
- **Event Publishing**: Google Cloud Pub/Sub integration
- **Async Processing**: Event subscribers for background jobs

### Architecture

```
Request → notification.routes.ts
    ↓
notification.service.ts
    ↓
    ├─→ MongoDB (Typegoose)
    │
    └─→ publisher.service.ts
            ↓
        Pub/Sub Topic: "notification-created"
            ↓
        Async Subscriber
            ↓
        email.service.ts
            ↓
        AWS SES
```

### Files

**Routes** (`routes/`)

- `notification.routes.ts` - REST endpoints (CRUD)

**Services** (`services/`)

- `notification.service.ts` - Core notification operations
- `publisher.service.ts` - Pub/Sub event publishing
- `email.service.ts` - AWS SES integration

**Models** (`models/`)

- `notification.model.ts` - Typegoose schema

### Key Endpoints

| Endpoint                      | Method | Description         |
| ----------------------------- | ------ | ------------------- |
| `/api/notifications`          | POST   | Create notification |
| `/api/notifications`          | GET    | List notifications  |
| `/api/notifications/:id`      | GET    | Get notification    |
| `/api/notifications/:id`      | PATCH  | Update notification |
| `/api/notifications/:id/read` | PATCH  | Mark as read        |
| `/api/notifications/:id`      | DELETE | Delete notification |

See [API Reference](./api-reference.md) for details.

### Database Schema

**Notifications collection (MongoDB):**

```typescript
interface Notification {
  _id: ObjectId
  title: string
  message: string
  type: 'email' | 'push' | 'in-app'
  userId: string
  read: boolean
  readAt?: Date
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Event Flow

**Creating a Notification:**

```typescript
// Step 1: User creates notification
POST /api/notifications
{
  "title": "Welcome",
  "message": "Welcome to VibeWork",
  "type": "email",
  "userId": "user_123"
}

// Step 2: Service saves to MongoDB
// Step 3: Service publishes to Pub/Sub
// Step 4: Returns immediately to client

// Step 5: Async subscriber receives event
// Step 6: If type=email, send via SES
// Step 7: Update notification status
```

### Email Configuration

**Environment Variables:**

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_SES_FROM_ADDRESS=noreply@example.com
```

**Email Service:**
Located in `services/email.service.ts`

- Templates for different notification types
- Retry logic for failed sends
- Tracking of delivery status

### Pub/Sub Integration

**Topics:**

- `notification-created` - New notification created
- `notification-sent` - Email sent successfully
- `notification-failed` - Email send failed

**Subscribers:**
Located in `services/publisher.service.ts`

- Listens for `notification-created`
- Triggers email sending
- Updates notification status

**Local Development:**

```env
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local
```

### Usage Example

```typescript
// Create notification
const notification = await notificationService.create({
  title: 'Welcome',
  message: 'Welcome to VibeWork',
  type: 'email',
  userId: 'user_123',
})

// List user notifications
const notifications = await notificationService.findByUserId('user_123', {
  page: 1,
  limit: 20,
  read: false,
})

// Mark as read
await notificationService.markAsRead('notif_123')

// The email will be sent asynchronously via Pub/Sub
```

### Testing

**Unit Tests:**

```bash
cd backend
bun run test modules/notifications
```

**Integration Tests (with Docker):**

```bash
bun run test:integration modules/notifications
```

Test files in `modules/notifications/**/__tests__/`

### Detailed Documentation

See `backend/modules/notifications/CLAUDE.md` for:

- Complete Typegoose model definitions
- Pub/Sub integration details
- Email template system
- Event handling
- API contract schemas

## Module Development

### Creating a New Module

1. **Create Module Directory**

   ```bash
   mkdir -p backend/modules/my-feature/{routes,services,schema}
   ```

2. **Create Module Index**

   ```typescript
   // modules/my-feature/index.ts
   export * from './routes'
   export * from './services'
   ```

3. **Create Routes**

   ```typescript
   // modules/my-feature/routes/index.ts
   import { Elysia } from 'elysia'
   import { myFeatureService } from '../services'

   export const myFeatureRoutes = new Elysia().get('/my-feature', () => myFeatureService.getAll())
   ```

4. **Register in App**

   ```typescript
   // src/app.ts
   import { myFeatureRoutes } from '@/modules/my-feature'

   app.use(myFeatureRoutes)
   ```

5. **Add Tests**
   ```bash
   mkdir -p modules/my-feature/__tests__
   touch modules/my-feature/__tests__/service.test.ts
   ```

### Module Principles

1. **Isolation**: Module should be self-contained
2. **Exports**: Use barrel exports (index.ts)
3. **Testing**: 80% coverage minimum
4. **Documentation**: CLAUDE.md in module root
5. **Independence**: Can be extracted to microservice
6. **Interface Stability**: Stable internal APIs

### Cross-Module Communication

For modules needing to interact:

```typescript
// Import from module exports
import { userService } from '@/modules/users'
import { notificationService } from '@/modules/notifications'

// Explicit dependency injection
notificationService.create({
  userId: user.id,
  message: `Welcome ${user.name}`,
})
```

### Shared Infrastructure

Modules can use shared infrastructure:

```typescript
import { db, cache, pubsub } from '@/infra'

// Database
const users = await db.query.users.findMany()

// Cache
const cached = await cache.get('key')

// Pub/Sub
await pubsub.publish('topic', message)
```

## Module Dependencies

**Current Dependencies:**

```
users → MySQL/Drizzle
notifications → MongoDB/Typegoose
              → Pub/Sub
              → AWS SES
              → users (optional, for user data)
```

## Migrating to Microservices

The modular structure allows extracting modules to separate services:

1. **Copy module** to new service
2. **Create separate database** for module
3. **Use Pub/Sub** for inter-service communication
4. **Update module imports** in main backend
5. **Deploy separately** on Cloud Run

Example: Extracting notifications to microservice

```
# Before: single backend with users + notifications

# After:
backend/          # Users service only
notifications-svc/  # Notifications microservice
shared-libs/      # Contract definitions
```

Communication via Pub/Sub:

- notifications-svc subscribes to user-created events
- users-svc publishes events via Pub/Sub

## Next Steps

- **[Users Module Details](../backend/README.md#users-module)** - Read module CLAUDE.md
- **[Notifications Module Details](../backend/README.md#notifications-module)** - Read module CLAUDE.md
- **[API Reference](./api-reference.md)** - Explore endpoints
- **[Database Guide](./database.md)** - Understand schemas
- **[Testing Guide](./testing.md)** - Learn test patterns

---

**Last Updated**: December 2024
