Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.2/TASK.md` - Task-level context
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.2/PROMPT.md` - Task-specific patterns

---

## Implementation Plan

- [ ] **Step 1 — Create MySQL infrastructure**
  - **What to do:**
    - Create `/backend/infra/database/mysql.ts`
    - MySQL pool with mysql2/promise
    - Export drizzle instance as `db`
    - checkMySqlConnection() with 5s timeout
    - closeMySqlConnection()
    - Log connection status
  - **Touched:** CREATE `/backend/infra/database/mysql.ts`

- [ ] **Step 2 — Create MongoDB infrastructure**
  - **What to do:**
    - Create `/backend/infra/database/mongodb.ts`
    - connectMongo() function
    - checkMongoConnection() returns boolean
    - closeMongoConnection()
    - Log connection status
  - **Touched:** CREATE `/backend/infra/database/mongodb.ts`

- [ ] **Step 3 — Create Redis cache client**
  - **What to do:**
    - Create `/backend/infra/cache.ts`
    - Redis client with ioredis
    - Export `redis` instance
    - checkRedisConnection() with 5s timeout
    - closeRedisConnection()
  - **Touched:** CREATE `/backend/infra/cache.ts`

- [ ] **Step 4 — Create Pub/Sub client**
  - **What to do:**
    - Create `/backend/infra/pubsub.ts`
    - PubSub client with emulator support
    - Export `pubsub` instance
    - checkPubSubConnection()
    - closePubSubConnection()
  - **Touched:** CREATE `/backend/infra/pubsub.ts`

- [ ] **Step 5 — Create barrel export**
  - **What to do:**
    - Create `/backend/infra/index.ts`
    - Re-export all infra modules
  - **Touched:** CREATE `/backend/infra/index.ts`

- [ ] **Step 6 — Create unit tests**
  - **What to do:**
    - Create test files for each module (mock external deps)
    - Test config from env vars
    - Test check functions return true/false
  - **Touched:**
    - CREATE `/backend/infra/__tests__/mysql.test.ts`
    - CREATE `/backend/infra/__tests__/mongodb.test.ts`
    - CREATE `/backend/infra/__tests__/cache.test.ts`
    - CREATE `/backend/infra/__tests__/pubsub.test.ts`

- [ ] **Step 7 — Verify**
  - **Commands:**
    ```bash
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork && bun test backend/infra --silent
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run tsc --noEmit
    ```

---

## Acceptance Criteria

- [ ] Drizzle connects to MySQL via env vars
- [ ] Typegoose connects to MongoDB via env vars
- [ ] Redis client connects via REDIS_URL
- [ ] Pub/Sub uses emulator when PUBSUB_EMULATOR_HOST set
- [ ] All check functions have 5s timeout
- [ ] All close functions for graceful shutdown
- [ ] Unit tests pass
