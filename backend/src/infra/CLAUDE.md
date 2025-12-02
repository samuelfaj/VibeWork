# Infra - Infrastructure & Service Connections

Infrastructure layer managing connections to all external services and databases.

## Purpose

Centralizes initialization and management of:

- **MySQL Database**: Relational data (users, sessions)
- **MongoDB**: Document storage (notifications)
- **Redis Cache**: In-memory caching
- **Google Pub/Sub**: Event messaging
- **Better-Auth**: User authentication and sessions

All services are initialized on startup with health checks and graceful shutdown.

## Structure

```
infra/
├── index.ts              # Barrel exports
├── auth.ts               # Better-Auth configuration
├── cache.ts              # Redis client & health checks
├── cache.test.ts         # Tests for cache (co-located)
├── pubsub.ts             # Google Cloud Pub/Sub client
├── pubsub.test.ts        # Tests for pubsub (co-located)
└── database/
    ├── mysql.ts          # Drizzle ORM + MySQL pool
    ├── mysql.test.ts     # Tests for mysql (co-located)
    ├── mongodb.ts        # Mongoose + MongoDB connection
    └── mongodb.test.ts   # Tests for mongodb (co-located)
```

## Databases

### MySQL with Drizzle ORM

**File:** `database/mysql.ts`

Manages relational database (users, sessions, authentication data).

**Features:**

- Connection pooling for performance
- Drizzle ORM for type-safe queries
- Health check with 5-second timeout
- Graceful connection closure

**Usage:**

```typescript
import { db } from '@/infra/database/mysql'
import { users } from '@/schema/user'

// Query user
const user = await db.query.users.findFirst({
  where: eq(users.email, 'test@example.com'),
})

// Create user
await db.insert(users).values({
  email: 'user@example.com',
  password: 'hashed_password',
})

// Update user
await db.update(users).set({ name: 'John' }).where(eq(users.id, userId))

// Delete user
await db.delete(users).where(eq(users.id, userId))
```

**Connection Details:**

```typescript
// Environment variables required:
// MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})
```

**Health Check:**

```typescript
export async function checkMySQLHealth(): Promise<HealthStatus> {
  try {
    const start = Date.now()
    await db.query.users.findFirst()
    const latency = Date.now() - start

    return { status: 'ok', latency }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}
```

---

### MongoDB with Mongoose

**File:** `database/mongodb.ts`

Manages document storage (notifications, flexible data).

**Features:**

- Typegoose for type-safe schemas
- Auto-indexing
- Health check with 5-second timeout
- Graceful connection closure

**Usage:**

```typescript
import { Notification } from '@/models/notification'

// Create notification
const notification = await Notification.create({
  userId: 'user-123',
  type: 'email',
  title: 'Welcome',
  message: 'Welcome to VibeWork',
})

// Query notifications
const userNotifications = await Notification.find({
  userId: 'user-123',
  read: false,
})

// Update notification
await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true })

// Delete notification
await Notification.findByIdAndDelete(notificationId)
```

**Connection Details:**

```typescript
// Environment variable required:
// MONGODB_URI

const connection = await mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/vibework'
)
```

**Health Check:**

```typescript
export async function checkMongoDBHealth(): Promise<HealthStatus> {
  try {
    const start = Date.now()
    await Notification.findOne().limit(1)
    const latency = Date.now() - start

    return { status: 'ok', latency }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}
```

---

## Cache Layer

### Redis with ioredis

**File:** `cache.ts`

In-memory caching for frequently accessed data.

**Features:**

- Connection pooling
- Health check with 5-second timeout
- Pub/Sub support (optional)
- Graceful shutdown

**Usage:**

```typescript
import { redis } from '@/infra/cache'

// Set value (5 minute TTL)
await redis.setex('user:123', 300, JSON.stringify(userData))

// Get value
const cached = await redis.get('user:123')
const data = cached ? JSON.parse(cached) : null

// Delete value
await redis.del('user:123')

// Clear all cache
await redis.flushdb()
```

**Common Patterns:**

```typescript
// Cache with automatic refresh
export async function getCachedUser(userId: string) {
  const cached = await redis.get(`user:${userId}`)
  if (cached) return JSON.parse(cached)

  // Not cached, fetch from DB
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  // Cache for 5 minutes
  if (user) {
    await redis.setex(`user:${userId}`, 300, JSON.stringify(user))
  }

  return user
}

// Invalidate cache on update
export async function updateUser(userId: string, data: any) {
  const result = await db.update(users).set(data).where(eq(users.id, userId))

  // Invalidate cache
  await redis.del(`user:${userId}`)

  return result
}
```

**Connection Details:**

```typescript
// Environment variable:
// REDIS_URL (optional, defaults to redis://localhost:6379)

const redis = new Redis(process.env.REDIS_URL)
```

**Health Check:**

```typescript
export async function checkRedisHealth(): Promise<HealthStatus> {
  try {
    const start = Date.now()
    await redis.ping()
    const latency = Date.now() - start

    return { status: 'ok', latency }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}
```

---

## Event Messaging

### Google Cloud Pub/Sub

**File:** `pubsub.ts`

Asynchronous event publishing and subscription for decoupled components.

**Features:**

- Topics for different event types
- Subscriptions with retry policies
- Automatic acknowledgment
- Health check with 5-second timeout

**Topics:**

1. **notifications-created**: User notifications
2. **events**: Application events

**Usage:**

```typescript
import { pubsub, topics } from '@/infra/pubsub'

// Publish event
await pubsub.topic(topics.NOTIFICATIONS).publish(
  Buffer.from(
    JSON.stringify({
      userId: 'user-123',
      type: 'email',
      title: 'Welcome',
    })
  )
)

// Subscribe to events
const subscription = pubsub.subscription('subscription-name')

subscription.on('message', (message) => {
  const data = JSON.parse(message.data.toString())
  console.log('Received event:', data)
  message.ack() // Acknowledge processing
})

subscription.on('error', (error) => {
  console.error('Subscription error:', error)
  message.nack() // Retry later
})
```

**Retry Policy:**

```typescript
{
  minimumBackoff: { seconds: 10 },      // 10 second minimum wait
  maximumBackoff: { seconds: 600 },     // 10 minute maximum wait
  deadLetterPolicy: {
    deadLetterTopic: 'projects/.../topics/dead-letter',
    maxDeliveryAttempts: 5,             // Try 5 times
  },
}
```

**Connection Details:**

```typescript
// Environment variables:
// PUBSUB_PROJECT_ID - GCP project ID
// PUBSUB_EMULATOR_HOST - For development (localhost:8085)

const pubsub = new PubSub({
  projectId: process.env.PUBSUB_PROJECT_ID,
  apiEndpoint: process.env.PUBSUB_EMULATOR_HOST,
})
```

**Health Check:**

```typescript
export async function checkPubSubHealth(): Promise<HealthStatus> {
  try {
    const start = Date.now()
    const topic = pubsub.topic(topics.NOTIFICATIONS)
    const [exists] = await topic.exists()
    const latency = Date.now() - start

    if (!exists) throw new Error('Topic does not exist')
    return { status: 'ok', latency }
  } catch (error) {
    return { status: 'error', message: error.message }
  }
}
```

---

## Authentication

### Better-Auth Configuration

**File:** `auth.ts`

Manages user authentication, sessions, and security.

**Features:**

- Email/password authentication
- Session management with secure cookies
- Password hashing with Argon2
- CSRF protection

**Usage:**

```typescript
import { auth } from '@/infra/auth'

// Available in request context
// Routes have access to auth middleware
```

**Session Management:**

```typescript
// Session stored in MySQL, cookie sent to client
// Cookie contains: session_id + encrypted data

// Get current session
const session = await auth.getSession(request)

// Get current user
const user = session?.user

// Create session
await auth.createSession(userId)

// Delete session
await auth.deleteSession(sessionId)
```

---

## Health Checks

### Readiness Check Implementation

All services provide health checks with timeout protection:

```typescript
import { checkMySQLHealth, checkMongoDBHealth, checkRedisHealth, checkPubSubHealth } from '@/infra'

export async function performReadinessCheck() {
  const results = await Promise.allSettled([
    withTimeout(checkMySQLHealth(), 5000),
    withTimeout(checkMongoDBHealth(), 5000),
    withTimeout(checkRedisHealth(), 5000),
    withTimeout(checkPubSubHealth(), 5000),
  ])

  return {
    mysql: results[0].status === 'fulfilled' ? results[0].value : { status: 'error' },
    mongodb: results[1].status === 'fulfilled' ? results[1].value : { status: 'error' },
    redis: results[2].status === 'fulfilled' ? results[2].value : { status: 'error' },
    pubsub: results[3].status === 'fulfilled' ? results[3].value : { status: 'error' },
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
  ])
}
```

---

## Graceful Shutdown

### Cleanup on Application Exit

```typescript
import { db } from '@/infra/database/mysql'
import { mongoConnection } from '@/infra/database/mongodb'
import { redis } from '@/infra/cache'

async function gracefulShutdown() {
  console.log('Shutting down gracefully...')

  // Close database connections
  await db.end()
  await mongoConnection.close()
  await redis.quit()

  // Stop accepting new requests
  process.exit(0)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
```

---

## Environment Variables

Required environment variables:

```bash
# MySQL
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=vibework

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vibework

# Redis
REDIS_URL=redis://localhost:6379

# Google Cloud Pub/Sub
PUBSUB_PROJECT_ID=vibework-project
# For development:
PUBSUB_EMULATOR_HOST=localhost:8085

# Better-Auth
AUTH_SECRET=your-secret-key
```

---

## Local Development Setup

### Using Docker Compose

```bash
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f mysql
docker-compose logs -f mongodb
docker-compose logs -f redis
```

### Testing Services Locally

```bash
# Test MySQL
docker exec vibework_mysql mysql -u root -p vibework -e "SELECT 1"

# Test MongoDB
docker exec vibework_mongodb mongo vibework --eval "db.health.find()"

# Test Redis
docker exec vibework_redis redis-cli ping

# Test Pub/Sub
curl http://localhost:8085/v1/projects/vibework/topics
```

---

## Troubleshooting

### Connection Refused

1. Ensure Docker services are running: `docker-compose up -d`
2. Check environment variables are set correctly
3. Verify firewall isn't blocking connections

### Connection Pool Exhausted

```
Error: getConnection() failed, all connections are in use
```

- Increase `connectionLimit` in database config
- Check for connection leaks (not closing connections)
- Monitor active connections

### Timeout Errors

- Increase timeout threshold in health checks
- Check service responsiveness: `docker-compose logs service-name`
- Verify network connectivity

### Pub/Sub Emulator Issues

```
Error: The gRPC server is not running
```

- Ensure emulator is running: `docker-compose logs gcloud-pubsub-emulator`
- Reset emulator state: `docker-compose restart gcloud-pubsub-emulator`

---

## Related Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [ioredis Documentation](https://github.com/luin/ioredis)
- [Google Cloud Pub/Sub Documentation](https://cloud.google.com/pubsub/docs)
- [Better-Auth Documentation](https://github.com/better-auth/better-auth)
