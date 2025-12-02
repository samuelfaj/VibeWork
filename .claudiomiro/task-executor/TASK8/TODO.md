Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**

1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context (tech stack, architecture, conventions)
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK8/TASK.md` - Task-level context (what this task is about)
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK8/PROMPT.md` - Task-specific context (files to touch, patterns to follow)

**You MUST read these files before implementing to understand:**

- Tech stack and framework versions
- Project structure and architecture
- Coding conventions and patterns
- Related code examples with file:line references
- Integration points and dependencies

**DO NOT duplicate this context below - it's already in the files above.**

## Implementation Plan

- [ ] **Item 1 — Vitest Configuration Setup (Unit + Integration)**
  - **What to do:**
    1. Install test dependencies in `/backend/package.json`:
       - `vitest` - Test runner
       - `@vitest/coverage-v8` - Coverage provider
       - `@testcontainers/mysql` - MySQL container for integration tests
       - `@testcontainers/mongodb` - MongoDB container for integration tests
    2. Create `/backend/vitest.config.ts` - Main unit test configuration:
       - Configure `test.include` for `**/*.test.ts` excluding integration patterns
       - Set coverage provider to `v8` with 80% thresholds (statements, branches, functions, lines)
       - Configure `test.environment` as `node`
       - Set reasonable timeout (5000ms for unit tests)
    3. Create `/backend/vitest.integration.config.ts` - Integration test configuration:
       - Configure `test.include` for `**/*.integration.test.ts` or `**/integration.test.ts`
       - Set longer timeout (120000ms) to account for container startup
       - Disable coverage for integration tests (focus on functional verification)
       - Set `test.pool` to `forks` for isolation between test files
    4. Add test scripts to `/backend/package.json`:
       - `"test": "vitest run"` - Unit tests only
       - `"test:watch": "vitest"` - Unit tests in watch mode
       - `"test:coverage": "vitest run --coverage"` - Unit tests with coverage
       - `"test:integration": "vitest run --config vitest.integration.config.ts"` - Integration tests

  - **Context (read-only):**
    - `PROMPT.md:46-64` — Vitest coverage configuration pattern
    - `AI_PROMPT.md:393-406` — Coverage threshold requirements (80%)
    - `AI_PROMPT.md:379-388` — Integration test strategy with Testcontainers

  - **Touched (will modify/create):**
    - CREATE: `/backend/vitest.config.ts`
    - CREATE: `/backend/vitest.integration.config.ts`
    - MODIFY: `/backend/package.json` — Add devDependencies and test scripts

  - **Interfaces / Contracts:**
    - Test scripts exposed via `package.json`:
      - `bun run test` → Runs unit tests
      - `bun run test:integration` → Runs integration tests with Testcontainers
      - `bun run test:coverage` → Runs unit tests with coverage report
    - Coverage output format: `text`, `json`, `html` in `/backend/coverage/`

  - **Tests:**
    Type: Configuration verification (no test file needed)
    - Verify: `bun run test` executes without errors
    - Verify: `bun run test:integration` executes without errors
    - Verify: Coverage threshold enforcement is active

  - **Migrations / Data:**
    N/A - No data changes

  - **Observability:**
    N/A - Test configuration only

  - **Security & Permissions:**
    N/A - No security concerns for test configuration

  - **Performance:**
    - Unit tests should complete in < 30 seconds
    - Integration tests should complete in < 5 minutes (including container startup)

  - **Commands:**

    ```bash
    # Install dependencies
    cd /backend && bun add -d vitest @vitest/coverage-v8 @testcontainers/mysql @testcontainers/mongodb

    # Verify unit test config
    cd /backend && bun run test --silent

    # Verify integration test config
    cd /backend && bun run test:integration --silent
    ```

  - **Risks & Mitigations:**
    - **Risk:** Bun compatibility issues with Vitest
      **Mitigation:** Use `vitest` with `pool: 'forks'` for better Bun support
    - **Risk:** Coverage thresholds block initial development
      **Mitigation:** Start with configuration; actual coverage builds as modules are tested

---

- [ ] **Item 2 — User Module Integration Test (MySQL + Testcontainers)**
  - **What to do:**
    1. Create `/backend/modules/users/__tests__/integration.test.ts`:
       - Import `MySqlContainer` from `@testcontainers/mysql`
       - Import Drizzle client and user schema from TASK6
       - Set up `beforeAll` to:
         - Start MySQL container with `new MySqlContainer().start()` (60s timeout)
         - Get connection URI via `mysqlContainer.getConnectionUri()`
         - Set `process.env.DATABASE_URL` to container URI
         - Initialize Drizzle connection with container
         - Run migrations programmatically (use `drizzle-kit push` or migrate utility)
       - Set up `afterAll` to:
         - Close Drizzle connection
         - Stop MySQL container with `mysqlContainer.stop()`
       - Set up `beforeEach` to truncate users table for test isolation
    2. Implement test cases:
       - **Signup Flow:**
         - Test successful user creation with valid email/password
         - Verify user exists in database after signup
         - Verify password is hashed (not stored as plaintext)
         - Test duplicate email rejection (unique constraint)
         - Test invalid email format rejection
         - Test password too short rejection
       - **Login Flow:**
         - Test successful login with correct credentials
         - Test failed login with wrong password
         - Test failed login with non-existent email
         - Verify session/token returned on successful login
    3. Use actual HTTP requests to Elysia routes (not direct service calls) for true integration

  - **Context (read-only):**
    - `PROMPT.md:23-43` — Testcontainers setup pattern
    - `AI_PROMPT.md:139-147` — Drizzle user schema pattern
    - `AI_PROMPT.md:186-196` — Testcontainers example from AI_PROMPT
    - `TASK6/` — User module implementation (routes, services, schema)

  - **Touched (will modify/create):**
    - CREATE: `/backend/modules/users/__tests__/integration.test.ts`

  - **Interfaces / Contracts:**
    - Depends on TASK6 providing:
      - User schema at `/backend/modules/users/schema/user.schema.ts`
      - Auth routes at `/backend/modules/users/routes/auth.routes.ts`
      - `POST /signup` endpoint: `{ email: string, password: string }` → `{ user: User, session: Session }`
      - `POST /login` endpoint: `{ email: string, password: string }` → `{ user: User, session: Session }`
    - Depends on TASK5 providing:
      - Drizzle connection utility at `/backend/infra/database/mysql.ts`

  - **Tests:**
    Type: Integration tests with real MySQL container
    - Happy path: Signup creates user and returns session
    - Happy path: Login with correct credentials returns session
    - Edge case: Duplicate email returns 409 Conflict
    - Edge case: Invalid email format returns 400 Bad Request
    - Edge case: Short password returns 400 Bad Request
    - Failure: Wrong password returns 401 Unauthorized
    - Failure: Non-existent user returns 401 Unauthorized

  - **Migrations / Data:**
    - Migrations run automatically in `beforeAll` against container
    - Table truncation in `beforeEach` for isolation
    - No persistent data changes

  - **Observability:**
    - Log container startup/shutdown for debugging
    - Log connection URI (without credentials) for troubleshooting

  - **Security & Permissions:**
    - Test that passwords are NOT stored in plaintext
    - Verify password hashing is applied

  - **Performance:**
    - Container startup: ~30-45 seconds (MySQL initialization)
    - Individual test cases: < 1 second each
    - Total suite: < 2 minutes

  - **Commands:**

    ```bash
    # Run user integration tests only
    cd /backend && bun run test:integration --silent -- modules/users

    # Run with verbose output for debugging
    cd /backend && bun run test:integration -- modules/users
    ```

  - **Risks & Mitigations:**
    - **Risk:** MySQL container slow to start
      **Mitigation:** Set 60s timeout in `beforeAll`; use container reuse if supported
    - **Risk:** Migration schema mismatch
      **Mitigation:** Use same migration logic as production; verify schema exists before tests
    - **Risk:** Port conflicts with local MySQL
      **Mitigation:** Testcontainers uses random ports by default

---

- [ ] **Item 3 — Notification Module Integration Test (MongoDB + Testcontainers)**
  - **What to do:**
    1. Create `/backend/modules/notifications/__tests__/integration.test.ts`:
       - Import `MongoDBContainer` from `@testcontainers/mongodb`
       - Import Typegoose/Mongoose utilities and Notification model from TASK7
       - Set up `beforeAll` to:
         - Start MongoDB container with `new MongoDBContainer().start()` (60s timeout)
         - Get connection string via `mongoContainer.getConnectionString()`
         - Set `process.env.MONGODB_URI` to container connection string
         - Initialize Mongoose connection to container
       - Set up `afterAll` to:
         - Close Mongoose connection
         - Stop MongoDB container with `mongoContainer.stop()`
       - Set up `beforeEach` to:
         - Drop/clear notifications collection for test isolation
    2. Implement test cases:
       - **Create Notification:**
         - Test creating in-app notification successfully
         - Test creating email notification successfully
         - Verify notification stored with correct fields (userId, type, message, read=false)
         - Test missing required fields rejection (userId, type, message)
         - Test invalid notification type rejection
       - **List Notifications:**
         - Test listing all notifications for a user
         - Test empty list for user with no notifications
         - Test notifications are sorted by createdAt descending
         - Test pagination if implemented
       - **Mark as Read:**
         - Test marking notification as read successfully
         - Verify read field updated to true
         - Test marking non-existent notification returns 404
         - Test marking already-read notification is idempotent
    3. Use actual HTTP requests to Elysia routes for true integration testing

  - **Context (read-only):**
    - `PROMPT.md:23-43` — Testcontainers setup pattern
    - `AI_PROMPT.md:152-169` — Typegoose Notification model pattern
    - `TASK7/` — Notification module implementation (models, routes, services)

  - **Touched (will modify/create):**
    - CREATE: `/backend/modules/notifications/__tests__/integration.test.ts`

  - **Interfaces / Contracts:**
    - Depends on TASK7 providing:
      - Notification model at `/backend/modules/notifications/models/notification.model.ts`
      - Notification routes at `/backend/modules/notifications/routes/notification.routes.ts`
      - `POST /notifications` endpoint: `{ userId: string, type: 'in-app' | 'email', message: string }` → `{ notification: Notification }`
      - `GET /notifications?userId=xxx` endpoint → `{ notifications: Notification[] }`
      - `PATCH /notifications/:id/read` endpoint → `{ notification: Notification }`
    - Depends on TASK5 providing:
      - MongoDB connection utility at `/backend/infra/database/mongodb.ts`

  - **Tests:**
    Type: Integration tests with real MongoDB container
    - Happy path: Create in-app notification stores correctly
    - Happy path: Create email notification stores correctly
    - Happy path: List notifications returns user's notifications
    - Happy path: Mark as read updates notification
    - Edge case: List for user with no notifications returns empty array
    - Edge case: Mark already-read notification is idempotent
    - Failure: Missing required fields returns 400 Bad Request
    - Failure: Invalid notification type returns 400 Bad Request
    - Failure: Mark non-existent notification returns 404 Not Found

  - **Migrations / Data:**
    - No schema migrations needed (MongoDB is schemaless)
    - Collection cleared in `beforeEach` for isolation
    - No persistent data changes

  - **Observability:**
    - Log container startup/shutdown for debugging
    - Log connection string (without credentials) for troubleshooting

  - **Security & Permissions:**
    - Verify notifications are scoped to userId
    - Test that users cannot access other users' notifications (if auth is in scope)

  - **Performance:**
    - Container startup: ~15-20 seconds (MongoDB faster than MySQL)
    - Individual test cases: < 500ms each
    - Total suite: < 1 minute

  - **Commands:**

    ```bash
    # Run notification integration tests only
    cd /backend && bun run test:integration --silent -- modules/notifications

    # Run with verbose output for debugging
    cd /backend && bun run test:integration -- modules/notifications
    ```

  - **Risks & Mitigations:**
    - **Risk:** Mongoose connection pool issues
      **Mitigation:** Properly close connection in `afterAll`; use `mongoose.disconnect()`
    - **Risk:** Collection cleanup incomplete
      **Mitigation:** Use `deleteMany({})` or `drop()` in `beforeEach`

---

- [ ] **Item 4 — Test Utilities and Shared Setup**
  - **What to do:**
    1. Create `/backend/tests/setup.ts` - Global test setup:
       - Configure environment variables for tests
       - Set up global test timeout
       - Import any polyfills needed for Bun/Vitest compatibility
    2. Create `/backend/tests/utils/testcontainers.ts` - Shared container utilities:
       - Export helper functions for container management
       - `createMySqlContainer()` - Pre-configured MySQL container factory
       - `createMongoContainer()` - Pre-configured MongoDB container factory
       - Handle container cleanup on process exit (safety net)
    3. Create `/backend/tests/utils/http.ts` - HTTP test utilities:
       - Export helper for making requests to Elysia app
       - `createTestClient(app)` - Creates test client bound to Elysia instance
       - Support for authenticated requests (with session token)
    4. Update `/backend/vitest.config.ts` to use `setupFiles: ['./tests/setup.ts']`
    5. Update `/backend/vitest.integration.config.ts` to use same setup

  - **Context (read-only):**
    - `PROMPT.md:23-43` — Container setup patterns
    - `AI_PROMPT.md:123-134` — Elysia app pattern for test client

  - **Touched (will modify/create):**
    - CREATE: `/backend/tests/setup.ts`
    - CREATE: `/backend/tests/utils/testcontainers.ts`
    - CREATE: `/backend/tests/utils/http.ts`
    - MODIFY: `/backend/vitest.config.ts` — Add setupFiles reference
    - MODIFY: `/backend/vitest.integration.config.ts` — Add setupFiles reference

  - **Interfaces / Contracts:**
    - Exported utilities:
      - `createMySqlContainer(): Promise<StartedMySqlContainer>`
      - `createMongoContainer(): Promise<StartedMongoDBContainer>`
      - `createTestClient(app: Elysia): TestClient`
    - TestClient interface:
      - `get(path: string, options?): Promise<Response>`
      - `post(path: string, body: unknown, options?): Promise<Response>`
      - `patch(path: string, body: unknown, options?): Promise<Response>`
      - `delete(path: string, options?): Promise<Response>`

  - **Tests:**
    Type: Utility code (verified by Item 2 and Item 3 tests)
    - Utilities are exercised by integration tests
    - No separate unit tests for utilities (avoid testing test code)

  - **Migrations / Data:**
    N/A - No data changes

  - **Observability:**
    N/A - Test utilities only

  - **Security & Permissions:**
    N/A - Test utilities only

  - **Performance:**
    - Utilities should add minimal overhead
    - Container factories should not start containers (lazy initialization)

  - **Commands:**

    ```bash
    # Verify utilities compile
    cd /backend && bun run typecheck

    # Verify integration tests still pass with utilities
    cd /backend && bun run test:integration --silent
    ```

  - **Risks & Mitigations:**
    - **Risk:** Utility abstraction over-engineering
      **Mitigation:** Keep utilities minimal; only extract truly shared code
    - **Risk:** Circular dependencies with app code
      **Mitigation:** Test utilities in separate `/tests/` directory, not in `/src/`

---

## Verification (global)

- [ ] Run targeted tests ONLY for changed code (USE QUIET/SILENT FLAGS):
      ```bash # Verify Vitest configuration loads
      cd /backend && bun run test --silent

      # Verify integration test configuration loads
      cd /backend && bun run test:integration --silent

      # Run user module integration tests
      cd /backend && bun run test:integration --silent -- modules/users

      # Run notification module integration tests
      cd /backend && bun run test:integration --silent -- modules/notifications

      # Run full integration suite
      cd /backend && bun run test:integration --silent

      # Verify TypeScript compilation
      cd /backend && bunx tsc --noEmit
      ```
      **CRITICAL:** Do not run full-project checks. Use --silent flag to minimize output.

- [ ] All acceptance criteria met (see below)
- [ ] Code follows conventions from AI_PROMPT.md and PROMPT.md
- [ ] Integration points properly implemented (contracts match TASK5, TASK6, TASK7)
- [ ] Containers start and stop cleanly (no orphaned processes)
- [ ] Tests are isolated (can run in any order)

## Acceptance Criteria

- [ ] Vitest configured with 80% coverage threshold (statements, branches, functions, lines)
- [ ] `/backend/vitest.config.ts` exists with correct configuration
- [ ] `/backend/vitest.integration.config.ts` exists with correct configuration
- [ ] User integration test with MySQL container passes all test cases
- [ ] Notification integration test with MongoDB container passes all test cases
- [ ] Containers start within 60s timeout
- [ ] Containers stop and clean up properly in `afterAll`
- [ ] No hardcoded container ports (random ports used)
- [ ] Tests are isolated from each other (no shared state between test files)
- [ ] `bun run test:integration` runs all integration tests successfully
- [ ] `bun run test` runs unit tests (excludes integration tests)

## Impact Analysis

- **Directly impacted:**
  - `/backend/vitest.config.ts` (new)
  - `/backend/vitest.integration.config.ts` (new)
  - `/backend/package.json` (modified - add devDependencies and scripts)
  - `/backend/modules/users/__tests__/integration.test.ts` (new)
  - `/backend/modules/notifications/__tests__/integration.test.ts` (new)
  - `/backend/tests/setup.ts` (new)
  - `/backend/tests/utils/testcontainers.ts` (new)
  - `/backend/tests/utils/http.ts` (new)

- **Indirectly impacted:**
  - TASK12 (Backend Dockerfile) - May need to exclude test dependencies from production image
  - TASK15 (Documentation) - Should document test commands in CLAUDE.md
  - CI/CD pipeline - Will use these test scripts for automated testing
  - Root `turbo.json` - May need `test:integration` pipeline definition

## Diff Test Plan

**Changed files/symbols to test:**

1. `vitest.config.ts` - Verify unit tests run correctly
2. `vitest.integration.config.ts` - Verify integration tests run correctly
3. `users/__tests__/integration.test.ts` - 7 test cases (signup: 4, login: 3)
4. `notifications/__tests__/integration.test.ts` - 9 test cases (create: 4, list: 3, read: 2)
5. `tests/utils/*` - Exercised by integration tests

**Total: 16+ test cases covering all changed code**

## Follow-ups

- None identified - TASK.md and PROMPT.md provide sufficient clarity on requirements

## CONSOLIDATED CONTEXT:

## Environment Summary (from AI_PROMPT.md)

**Tech Stack:**
| Layer | Technology | Version/Notes |
|-------|------------|---------------|
| Runtime | Bun | Latest stable |
| Backend Framework | ElysiaJS | With Eden for type-safe RPC |
| Relational DB | MySQL | Via Drizzle ORM |
| Document DB | MongoDB | Via Typegoose/Mongoose |
| Cache | Redis | For caching only (NOT event bus) |
| Event Bus | Google Cloud Pub/Sub | For async messaging |
| Frontend | React

## Detected Codebase Patterns

- **Language:** javascript
- **Test Framework:** vitest
- **Import Style:** esm
- **Test Naming:** file.test.ext
- **Code Style:** class-based
- **Key Dirs:** src/app

## Full Context Files (read if more detail needed)

- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK0/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK1/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK2/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK3/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK4/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.1/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.2/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.3/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.4/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.5/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK6/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.1/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.2/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.3/CONTEXT.md

## REFERENCE FILES (read if more detail needed):

- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK0/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK1/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK2/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK3/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK4/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.1/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.2/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.3/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.4/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.5/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK6/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.1/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.2/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK7.3/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.1/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.2/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.3/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.4/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.5/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK10/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK14/CONTEXT.md
- /Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK8/RESEARCH.md
