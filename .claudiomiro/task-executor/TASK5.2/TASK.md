@dependencies [TASK0, TASK1, TASK5.1]
@scope backend

# Task: Infrastructure Layer - Database, Cache, Pub/Sub Clients

## Summary
Create the infrastructure layer with database connections (Drizzle/MySQL, Typegoose/MongoDB), Redis cache client, and Google Pub/Sub client with emulator support.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions

**Task-Specific Context:**
- Creates `/backend/infra/` directory structure
- Configures Drizzle ORM for MySQL
- Configures Typegoose/Mongoose for MongoDB
- Sets up Redis client for caching
- Sets up Google Pub/Sub with emulator support
- All clients with connection check and graceful shutdown functions

## Complexity
Medium

## Dependencies
Depends on: [TASK0, TASK1, TASK5.1]
Blocks: [TASK5.4, TASK5.5]
Parallel with: [TASK5.3]

## Detailed Steps
1. Create `/backend/infra/database/mysql.ts`:
   - MySQL connection pool with mysql2/promise
   - Drizzle ORM instance
   - checkMySqlConnection() with 5s timeout
   - closeMySqlConnection() for shutdown

2. Create `/backend/infra/database/mongodb.ts`:
   - Mongoose connection function
   - connectMongo(), checkMongoConnection()
   - closeMongoConnection() for shutdown

3. Create `/backend/infra/cache.ts`:
   - Redis client with ioredis
   - checkRedisConnection() with 5s timeout
   - closeRedisConnection() for shutdown

4. Create `/backend/infra/pubsub.ts`:
   - Pub/Sub client with emulator support
   - checkPubSubConnection()
   - closePubSubConnection() for shutdown

5. Create `/backend/infra/index.ts` barrel export

6. Write unit tests for each module

## Acceptance Criteria
- [ ] Drizzle connects to MySQL via env vars
- [ ] Typegoose connects to MongoDB via env vars
- [ ] Redis client connects via REDIS_URL
- [ ] Pub/Sub uses emulator when PUBSUB_EMULATOR_HOST set
- [ ] All check functions have 5s timeout
- [ ] All close functions for graceful shutdown
- [ ] Unit tests pass

## Code Review Checklist
- [ ] All connections use environment variables
- [ ] Never log passwords or URIs with credentials
- [ ] Connection pool limits configured
- [ ] Error handling on connection failures

## Reasoning Trace
Infrastructure layer provides clean interfaces for database, cache, and messaging. Separating concerns allows modules to import what they need. Check/close functions enable health endpoints and graceful shutdown.
