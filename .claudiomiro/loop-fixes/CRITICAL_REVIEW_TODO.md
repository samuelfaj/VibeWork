# Critical Code Review - Items

## Current Iteration: 1

---

## BLOCKERS

### - [x] [BLOCKER] Hardcoded default password in MySQL connection - PROCESSED in iteration 1

**File**: `backend/src/infra/database/mysql.ts:8`
**Problem**: Default password `password123` hardcoded in source code. If deployed without proper env vars, this weak password will be used in production.
**Fix**: Remove default or use empty string as fallback that forces explicit configuration.
**Solution**: Changed default to empty string to fail loudly if not configured.

---

## WARNINGS

### - [x] [WARNING] Notification creation endpoint lacks authentication - PROCESSED in iteration 1

**File**: `backend/modules/notifications/routes/notification.routes.ts:9-23`
**Problem**: POST `/notifications` creates notifications without validating the user is authenticated. Any caller can create notifications for arbitrary userIds.
**Fix**: Add authentication middleware similar to GET/PATCH endpoints that verify session before allowing creation.
**Solution**: Added X-User-Id header validation and authorization check for POST endpoint.

### - [x] [WARNING] Missing shutdown cleanup for MongoDB and Redis connections - PROCESSED in iteration 1

**File**: `backend/src/index.ts:11-14`
**Problem**: The shutdown handler only logs and exits. It doesn't close MongoDB, Redis, or PubSub connections, which can leave connections hanging during graceful shutdown.
**Fix**: Call `closeMongoConnection()`, `closeRedisConnection()`, and `closePubSubConnection()` before exit.
**Solution**: Added proper cleanup for all infrastructure connections in shutdown handler.

### - [x] [WARNING] Non-null assertion on emailService in subscriber - PROCESSED in iteration 1

**File**: `backend/modules/notifications/services/notification-subscriber.ts:45`
**Problem**: `emailService!.sendEmail(...)` uses non-null assertion. If `handleMessage` is somehow called before `startNotificationSubscriber`, this will crash.
**Fix**: Add null check or ensure `emailService` is initialized before attaching the message handler.
**Solution**: Added null check with error logging before using emailService.

### - [x] [WARNING] User schema mismatch between production code and integration tests - PROCESSED in iteration 1

**File**: `backend/modules/users/schema/user.schema.ts` vs `backend/modules/users/__tests__/integration.test.ts:40-48`
**Problem**: Integration test creates a table with `password_hash` column and inserts data with `passwordHash` field, but the production user schema has NO password field (Better-Auth stores passwords in `account` table). Tests are testing a schema that doesn't match production.
**Fix**: Update integration tests to match the actual production schema, or clarify that tests are intentionally testing a different schema.
**Solution**: Updated integration tests to match production schema structure (no passwordHash in user table).

---

## Completed Summary

All identified blockers and warnings have been processed in iteration 1.
