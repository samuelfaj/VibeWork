# Backend Infrastructure Guide

Guide to backend infrastructure services: Redis, Pub/Sub, Email, and configuration.

## Infrastructure Architecture

```
Application
    │
    ├─→ Redis (Cache Layer)
    ├─→ Google Pub/Sub (Event Bus)
    └─→ AWS SES (Email)
```

## Redis Caching

### Overview

Redis is used exclusively for **application caching**, not as a message queue.

### Configuration

**Environment Variables:**

```env
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=vibe:
REDIS_TTL_SECONDS=3600
REDIS_PASSWORD=  # Optional
```

**Setup:** `backend/src/infra/cache.ts`

### Connection

```typescript
import { cache } from '@/infra'

// Get connection
const redis = cache.client

// Check connection
await redis.ping() // "PONG"
```

### Basic Operations

```typescript
import { cache } from '@/infra'

// SET
await cache.set('user:123', JSON.stringify(user), 3600)

// GET
const cached = await cache.get('user:123')
const user = JSON.parse(cached)

// DELETE
await cache.delete('user:123')

// EXISTS
const exists = await cache.exists('user:123')

// EXPIRE
await cache.expire('user:123', 1800)
```

### Usage Patterns

**Cache Frequently Accessed Data:**

```typescript
async function getUserWithCache(userId: string) {
  const cacheKey = `user:${userId}`

  // Try cache first
  const cached = await cache.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Fetch from database
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1)

  // Store in cache
  await cache.set(cacheKey, JSON.stringify(user), 3600)

  return user
}
```

**Cache Invalidation:**

```typescript
async function updateUser(userId: string, data: UpdateUserData) {
  // Update database
  const updated = await db.update(usersTable).set(data).where(eq(usersTable.id, userId))

  // Invalidate cache
  await cache.delete(`user:${userId}`)

  return updated
}
```

**Batch Operations:**

```typescript
async function batchGetUsers(userIds: string[]) {
  const cacheKeys = userIds.map((id) => `user:${id}`)

  // Get from cache
  const cached = await cache.mget(cacheKeys)

  // Find missing
  const missing = userIds.filter((id, i) => !cached[i])

  // Fetch missing from DB
  const fresh = await db.select().from(usersTable).where(inArray(usersTable.id, missing))

  // Cache fresh data
  for (const user of fresh) {
    await cache.set(`user:${user.id}`, JSON.stringify(user), 3600)
  }

  // Combine cached + fresh
  return [...cached.filter(Boolean), ...fresh]
}
```

### Performance Tips

1. **Keep TTL reasonable** (1-24 hours based on data volatility)
2. **Use key prefixes** to organize cache
3. **Invalidate on updates** to prevent stale data
4. **Cache expensive queries** (joins, aggregations)
5. **Don't cache sensitive data** (passwords, tokens)
6. **Monitor cache hit rates** in production

## Google Cloud Pub/Sub

### Overview

Pub/Sub provides **event-driven messaging** for async processing.

**Use cases:**

- Send emails asynchronously
- Trigger workflows
- Decouple components
- Scale processing independently

### Configuration

**Environment Variables:**

```env
# Local Development (Emulator)
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local

# Production (GCP)
GOOGLE_CLOUD_PROJECT=your-gcp-project
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

**Docker Compose:**

```yaml
pubsub:
  image: google/cloud-sdk:emulator
  command: gcloud beta emulators pubsub start --host-port=0.0.0.0:8085
  ports:
    - '8085:8085'
  networks:
    - vibe-network
```

**Setup:** `backend/src/infra/pubsub.ts`

### Topics

**notification-created**

- Published when: New notification created
- Subscribers: Email service
- Message: `{ notificationId, userId, type }`

**notification-sent**

- Published when: Email sent successfully
- Subscribers: Analytics, logging
- Message: `{ notificationId, status, timestamp }`

### Publishing Events

```typescript
import { pubsub } from '@/infra'

// Publish event
await pubsub.publish('notification-created', {
  notificationId: 'notif_123',
  userId: 'user_123',
  type: 'email',
})
```

### Subscribing to Events

```typescript
import { pubsub } from '@/infra'

// Subscribe to topic
const subscription = pubsub.subscribe('notification-created', async (message) => {
  const { notificationId, userId, type } = message.data

  if (type === 'email') {
    await emailService.send({
      userId,
      notificationId,
    })
  }

  // Acknowledge message
  message.ack()
})
```

### Error Handling

```typescript
pubsub.subscribe('notification-created', async (message) => {
  try {
    await processNotification(message.data)
    message.ack()
  } catch (error) {
    console.error('Failed to process notification:', error)
    // Pub/Sub will retry automatically
    // After max retries, message goes to dead letter queue
  }
})
```

### Testing Pub/Sub

**Unit Tests (with Mock):**

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('notification publisher', () => {
  it('should publish notification-created event', async () => {
    const mockPubsub = {
      publish: vi.fn().mockResolvedValue('message_123'),
    }

    await publishNotificationCreated(
      {
        notificationId: 'notif_123',
        userId: 'user_123',
      },
      mockPubsub
    )

    expect(mockPubsub.publish).toHaveBeenCalledWith(
      'notification-created',
      expect.objectContaining({
        notificationId: 'notif_123',
      })
    )
  })
})
```

## AWS SES Email

### Overview

AWS SES (Simple Email Service) sends transactional emails.

### Configuration

**Environment Variables:**

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_SES_FROM_ADDRESS=noreply@example.com

# Or use IAM role (recommended for production)
AWS_ROLE_ARN=arn:aws:iam::account:role/service-role
```

**Setup:** `backend/src/infra/email.ts` (via AWS SDK)

### Email Service

**Location:** `backend/modules/notifications/services/email.service.ts`

```typescript
import { emailService } from '@/modules/notifications'

// Send email
await emailService.sendNotificationEmail({
  userId: 'user_123',
  notificationId: 'notif_123',
})
```

### Email Templates

Templates for different notification types:

```typescript
function getEmailTemplate(type: string, data: any): EmailTemplate {
  switch (type) {
    case 'welcome':
      return {
        subject: 'Welcome to VibeWork!',
        html: `<p>Welcome ${data.name}!</p>`,
      }
    case 'notification':
      return {
        subject: data.title,
        html: `<p>${data.message}</p>`,
      }
    default:
      return {
        subject: 'Notification',
        html: '<p>You have a new notification</p>',
      }
  }
}
```

### Error Handling & Retries

```typescript
async function sendEmailWithRetry(email: string, template: EmailTemplate, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await sesClient.send(
        new SendEmailCommand({
          Source: process.env.AWS_SES_FROM_ADDRESS,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: template.subject },
            Body: { Html: { Data: template.html } },
          },
        })
      )
      return response
    } catch (error) {
      if (attempt === maxRetries) throw error
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000)
    }
  }
}
```

### Production Requirements

**Email Verification:**

- All "from" addresses must be verified in SES
- Verify in AWS Console → SES → Verified identities

**Sending Limits:**

- Development: 200 emails/day
- Production: Request limit increase in AWS Console

**Best Practices:**

1. Always verify sender address
2. Use transactional templates
3. Handle bounces and complaints
4. Monitor sending quota
5. Implement retry logic

### Testing Email

**Local Development:**

```typescript
// Mock SES for tests
const mockSES = {
  send: vi.fn().mockResolvedValue({
    MessageId: 'test_123',
  }),
}

// Or use services like MailHog or Ethereal for real email testing
```

## Database Connections

### MySQL Connection Pool

**Configuration:**

```typescript
// backend/src/infra/database/mysql.ts
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.MYSQL_POOL_MAX_CONNECTIONS) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
})
```

**Connection Lifecycle:**

1. Pool acquires connection
2. Query executes
3. Pool returns connection
4. After idle timeout, connection closed

### MongoDB Connection

**Configuration:**

```typescript
// backend/src/infra/database/mongodb.ts
const mongoConnection = mongoose.createConnection(process.env.MONGODB_URL, {
  maxPoolSize: parseInt(process.env.MONGODB_CONNECTION_POOL_SIZE) || 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```

## Health Checks

### Liveness Check

```http
GET /healthz
```

Returns 200 if server is running.

```json
{ "status": "ok" }
```

### Readiness Check

```http
GET /readyz
```

Returns 200 only if all dependencies are healthy.

```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "pubsub": "ok"
  }
}
```

Returns 503 if any dependency is down.

**Implementation:**

```typescript
async function readinessCheck() {
  const checks = {
    database: await checkMysql(),
    cache: await checkRedis(),
    pubsub: await checkPubsub(),
  }

  const allOk = Object.values(checks).every((s) => s === 'ok')

  return {
    status: allOk ? 'ready' : 'not_ready',
    checks,
  }
}
```

## Logging & Monitoring

### Structured Logging

All logs include context:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "backend",
  "module": "notifications",
  "message": "Email sent successfully",
  "metadata": {
    "userId": "user_123",
    "notificationId": "notif_123",
    "duration_ms": 1234
  }
}
```

### Metrics to Monitor

- **Cache**: Hit/miss rate, latency
- **Database**: Connection pool usage, query latency
- **Pub/Sub**: Message count, latency, dead letter queue size
- **Email**: Sent count, failure rate, bounce rate
- **API**: Request rate, error rate, response time

## Environment Configuration

### Development

```env
NODE_ENV=development
LOG_LEVEL=debug
DEBUG=vibe:*

REDIS_URL=redis://localhost:6379
PUBSUB_EMULATOR_HOST=localhost:8085
AWS_REGION=us-east-1
```

### Staging

```env
NODE_ENV=staging
LOG_LEVEL=info

REDIS_URL=redis://redis-staging.internal:6379
PUBSUB_EMULATOR_HOST=  # Use real GCP
GOOGLE_CLOUD_PROJECT=vibe-staging
```

### Production

```env
NODE_ENV=production
LOG_LEVEL=warn

REDIS_URL=redis://redis-prod.internal:6379
GOOGLE_CLOUD_PROJECT=vibe-prod
AWS_REGION=us-east-1

# Use IAM roles instead of keys
AWS_ROLE_ARN=arn:aws:iam::prod-account:role/service-role
```

## Troubleshooting

### Redis Connection Issues

```bash
# Check Redis is running
docker-compose logs redis

# Test connection
redis-cli ping
# Expected: PONG

# Check key prefix
redis-cli KEYS "vibe:*"
```

### Pub/Sub Issues

```bash
# Check emulator is running
curl http://localhost:8085/v1/projects/vibe-local

# List topics
gcloud pubsub topics list --project=vibe-local

# View messages (emulator only)
gcloud pubsub subscriptions pull test-sub --project=vibe-local
```

### Email Issues

```typescript
// Check sender is verified in SES
// View verification status in AWS Console

// Monitor email sending
AWS Console → SES → Sending Statistics

// Check bounce/complaint rate
AWS Console → SES → Reputation Dashboard
```

## Next Steps

- **[Database Guide](./database.md)** - Database setup and operations
- **[Testing Guide](./testing.md)** - Testing with infrastructure
- **[Deployment Guide](../deployment.md)** - Production infrastructure

---

**Last Updated**: December 2024
