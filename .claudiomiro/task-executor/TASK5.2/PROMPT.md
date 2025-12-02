## PROMPT
Create the infrastructure layer with database connections (Drizzle/MySQL, Typegoose/MongoDB), Redis cache client, and Google Pub/Sub client. All with connection checks and graceful shutdown support.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack and conventions

**You MUST read AI_PROMPT.md before executing this task.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/infra/database/mysql.ts`
- `/backend/infra/database/mongodb.ts`
- `/backend/infra/cache.ts`
- `/backend/infra/pubsub.ts`
- `/backend/infra/index.ts`
- `/backend/infra/__tests__/mysql.test.ts`
- `/backend/infra/__tests__/mongodb.test.ts`
- `/backend/infra/__tests__/cache.test.ts`
- `/backend/infra/__tests__/pubsub.test.ts`

### Patterns to Follow

**Drizzle connection (mysql.ts):**
```typescript
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10
})

export const db = drizzle(pool)

export async function checkMySqlConnection(): Promise<boolean> {
  try {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release()
    return true
  } catch {
    return false
  }
}

export async function closeMySqlConnection(): Promise<void> {
  await pool.end()
}
```

**MongoDB connection (mongodb.ts):**
```typescript
import mongoose from 'mongoose'

export async function connectMongo(): Promise<void> {
  await mongoose.connect(process.env.MONGODB_URI!)
}

export async function checkMongoConnection(): Promise<boolean> {
  return mongoose.connection.readyState === 1
}

export async function closeMongoConnection(): Promise<void> {
  await mongoose.connection.close()
}
```

**Pub/Sub with emulator (pubsub.ts):**
```typescript
import { PubSub } from '@google-cloud/pubsub'

export const pubsub = new PubSub({
  projectId: process.env.PUBSUB_PROJECT_ID,
  ...(process.env.PUBSUB_EMULATOR_HOST && {
    apiEndpoint: process.env.PUBSUB_EMULATOR_HOST
  })
})
```

## LAYER
2

## PARALLELIZATION
Parallel with: [TASK5.3]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- All connections via environment variables
- Health checks with 5s timeout
- Connection logging without credentials
