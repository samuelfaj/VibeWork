# Backend Database Guide

Comprehensive guide to database setup, schemas, and operations.

## Overview

VibeWork uses two databases:

- **MySQL** (via Drizzle ORM) for relational data
- **MongoDB** (via Typegoose) for documents

### Database Architecture

```
┌─────────────────────┐
│   Application       │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐  ┌─────────────┐
│ Drizzle │  │  Mongoose/  │
│  ORM    │  │  Typegoose  │
└────┬────┘  └────┬────────┘
     │            │
     ▼            ▼
┌──────────┐  ┌──────────────┐
│  MySQL   │  │   MongoDB    │
│   8.0    │  │     6.0      │
└──────────┘  └──────────────┘
```

## MySQL Database

### Connection Configuration

**Environment:**

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=vibe_db

MYSQL_POOL_MAX_CONNECTIONS=10
MYSQL_POOL_IDLE_TIMEOUT_MS=30000
```

**Setup in Code:** `backend/src/infra/database/mysql.ts`

- Connection pooling
- Query timeout configuration
- Error handling

### Schema Definition

Schemas are defined using Drizzle with TypeScript:

**Location:** `backend/modules/users/schema/user.schema.ts`

```typescript
import { mysqlTable, varchar, timestamp, int, text } from 'drizzle-orm/mysql-core'

export const usersTable = mysqlTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }),
  passwordHash: text('password_hash'),
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const sessionsTable = mysqlTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

### Available Tables

**users**

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash TEXT,
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

**sessions**

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

**verifications** (Better-Auth)

```sql
CREATE TABLE verifications (
  id VARCHAR(255) PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  value VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_identifier_value (identifier, value)
);
```

**accounts** (OAuth)

```sql
CREATE TABLE accounts (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  expires_at BIGINT,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY uniq_provider_account (provider, account_id)
);
```

### Migrations

Migrations manage schema changes over time.

**Create Migration:**

```bash
cd backend
bun run db:create-migration add_email_verified_column
```

Creates `src/migrations/0001_add_email_verified_column.sql`

**Write Migration:**

```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX idx_email_verified ON users(email_verified);
```

**Run Migrations:**

```bash
bun run db:migrate
```

**Check Migration Status:**

```bash
bun run db:migrations:status
```

**Rollback Migration:**

```bash
bun run db:rollback
```

### Using Drizzle ORM

**Basic Queries:**

```typescript
import { db } from '@/infra/database'
import { usersTable } from '@/modules/users/schema'

// SELECT
const users = await db.select().from(usersTable).limit(10)

// SELECT WHERE
const user = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, 'user@example.com'))
  .limit(1)

// INSERT
const newUser = await db.insert(usersTable).values({
  id: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
})

// UPDATE
await db.update(usersTable).set({ name: 'Jane Doe' }).where(eq(usersTable.id, 'user_123'))

// DELETE
await db.delete(usersTable).where(eq(usersTable.id, 'user_123'))
```

**Advanced Queries:**

```typescript
import { and, or, gt, lt, like } from 'drizzle-orm'

// Complex WHERE
const results = await db.select()
  .from(usersTable)
  .where(and(
    like(usersTable.email, '%@example.com'),
    gt(usersTable.createdAt, new Date('2024-01-01'))
  ))

// Transactions
await db.transaction(async (trx) => {
  await trx.insert(usersTable).values(...)
  await trx.update(sessionsTable).set(...)
})

// Aggregation
const count = await db.select({
  count: sql`count(*)`.as('count')
}).from(usersTable)
```

## MongoDB Database

### Connection Configuration

**Environment:**

```env
MONGODB_URL=mongodb://localhost:27017/vibe_notifications
MONGODB_CONNECTION_POOL_SIZE=10
```

**Setup in Code:** `backend/src/infra/database/mongodb.ts`

- Connection pooling
- Error handling
- Retry logic

### Schema Definition

Schemas are defined using Typegoose (TypeScript first):

**Location:** `backend/modules/notifications/models/notification.model.ts`

```typescript
import { prop, getModelForClass, modelOptions } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({
  options: {
    allowDiscriminators: true,
  },
  schemaOptions: {
    timestamps: true,
    collection: 'notifications',
  },
})
export class Notification {
  @prop({ type: () => String })
  _id?: Types.ObjectId

  @prop({ required: true })
  title!: string

  @prop({ required: true })
  message!: string

  @prop({ enum: ['email', 'push', 'in-app'], required: true })
  type!: 'email' | 'push' | 'in-app'

  @prop({ required: true })
  userId!: string

  @prop({ default: false })
  read!: boolean

  @prop()
  readAt?: Date

  @prop()
  sentAt?: Date

  @prop({ default: Date.now })
  createdAt?: Date

  @prop({ default: Date.now })
  updatedAt?: Date
}

export const NotificationModel = getModelForClass(Notification)
```

### Available Collections

**notifications**

```json
{
  "_id": "ObjectId",
  "title": "string",
  "message": "string",
  "type": "enum(email, push, in-app)",
  "userId": "string",
  "read": "boolean",
  "readAt": "Date or null",
  "sentAt": "Date or null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Using Mongoose/Typegoose

**Basic Operations:**

```typescript
import { NotificationModel } from '@/modules/notifications/models'

// CREATE
const notification = await NotificationModel.create({
  title: 'Welcome',
  message: 'Welcome to VibeWork',
  type: 'email',
  userId: 'user_123',
})

// READ
const notif = await NotificationModel.findById(notificationId)

const notifs = await NotificationModel.find({ userId: 'user_123' })
  .limit(20)
  .sort({ createdAt: -1 })

// UPDATE
await NotificationModel.updateOne(
  { _id: notificationId },
  { $set: { read: true, readAt: new Date() } }
)

// DELETE
await NotificationModel.deleteOne({ _id: notificationId })
```

**Advanced Operations:**

```typescript
// Aggregation
const stats = await NotificationModel.aggregate([
  { $match: { userId: 'user_123' } },
  {
    $group: {
      _id: '$type',
      count: { $sum: 1 },
    },
  },
])

// Bulk operations
const bulk = NotificationModel.collection.initializeUnorderedBulkOp()
bulk.find({ read: false }).update({ $set: { read: true } })
const result = await bulk.execute()

// Pagination
const page = 1
const limit = 20
const skip = (page - 1) * limit

const notifications = await NotificationModel.find().skip(skip).limit(limit).sort({ createdAt: -1 })

const total = await NotificationModel.countDocuments()
```

## Database Operations

### Backups

**MySQL Backup:**

```bash
# Dump database
docker-compose exec mysql mysqldump -u root -p vibe_db > backup.sql

# Restore
docker-compose exec -T mysql mysql -u root -p vibe_db < backup.sql
```

**MongoDB Backup:**

```bash
# Dump database
docker-compose exec mongodb mongodump --db vibe_notifications --out /dump

# Restore
docker-compose exec mongodb mongorestore /dump
```

### Monitoring

**MySQL:**

```bash
# Connect
docker-compose exec mysql mysql -u root -p vibe_db

# Show tables
SHOW TABLES;

# Show indexes
SHOW INDEXES FROM users;

# Query stats
SELECT table_name, table_rows FROM information_schema.tables
WHERE table_schema = 'vibe_db';
```

**MongoDB:**

```bash
# Connect
docker-compose exec mongodb mongosh vibe_notifications

# List collections
show collections

# Database stats
db.stats()

# Collection stats
db.notifications.stats()

# Index info
db.notifications.getIndexes()
```

## Performance Optimization

### MySQL Optimization

**Indexes:**

```sql
-- Add index for common queries
CREATE INDEX idx_user_created ON users(email, created_at);

-- Check index usage
ANALYZE TABLE users;
EXPLAIN SELECT * FROM users WHERE email = 'user@example.com';
```

**Connection Pooling:**

```env
MYSQL_POOL_MAX_CONNECTIONS=10
MYSQL_POOL_IDLE_TIMEOUT_MS=30000
```

### MongoDB Optimization

**Indexes:**

```typescript
// In migration/setup
await NotificationModel.collection.createIndex({ userId: 1, createdAt: -1 })
await NotificationModel.collection.createIndex({ read: 1 })
await NotificationModel.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }) // 30 days
```

**Projection:**

```typescript
// Only fetch needed fields
const notifications = await NotificationModel.find({ userId: 'user_123' }).select({
  title: 1,
  message: 1,
  createdAt: 1,
})
```

## Testing with Databases

### Unit Tests (with Mocks)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { userService } from '@/modules/users'

describe('userService', () => {
  it('should create user', async () => {
    const mockDb = {
      insert: vi.fn().mockResolvedValue({ id: 'user_123' }),
    }

    // Use mock instead of real database
    const user = await userService.create(
      {
        email: 'test@example.com',
      },
      mockDb
    )

    expect(user.id).toBe('user_123')
  })
})
```

### Integration Tests (with Containers)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { MySQLContainer } from '@testcontainers/mysql'

describe('userService integration', () => {
  let container: MySQLContainer

  beforeAll(async () => {
    container = await new MySQLContainer().start()
    // Initialize with test database
  })

  afterAll(async () => {
    await container.stop()
  })

  it('should persist user to database', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      password: 'password123',
    })

    const found = await userService.findById(user.id)
    expect(found.email).toBe('test@example.com')
  })
})
```

## Database Cleanup

### Reset Databases

```bash
# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose up -d

# Re-run migrations
bun run db:migrate
```

### Clear Test Data

```bash
# MySQL
docker-compose exec mysql mysql -u root -p vibe_db -e "DELETE FROM users; DELETE FROM sessions;"

# MongoDB
docker-compose exec mongodb mongosh vibe_notifications --eval "db.notifications.deleteMany({})"
```

## Production Considerations

### Connection Pooling

- Configure appropriate pool sizes based on load
- Monitor connection usage
- Use read replicas for scaling reads

### Replication

- MySQL: Master-slave replication
- MongoDB: Replica sets for high availability

### Backup Strategy

- Automated daily backups
- Point-in-time recovery
- Regular backup restoration tests

### Monitoring

- Query performance monitoring
- Connection pool metrics
- Slow query logs
- Replication lag

## Next Steps

- **[API Reference](./api-reference.md)** - See how data is used
- **[Modules Guide](./modules.md)** - Understand data models
- **[Testing Guide](./testing.md)** - Learn database testing
- **[Infrastructure Guide](../infrastructure.md)** - Production databases

---

**Last Updated**: December 2024
