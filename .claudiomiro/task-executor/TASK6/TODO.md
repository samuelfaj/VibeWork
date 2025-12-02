Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context (tech stack, architecture, conventions)
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK6/TASK.md` - Task-level context (what this task is about)
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK6/PROMPT.md` - Task-specific context (files to touch, patterns to follow)

**You MUST read these files before implementing to understand:**
- Tech stack and framework versions
- Project structure and architecture
- Coding conventions and patterns
- Related code examples with file:line references
- Integration points and dependencies

**DO NOT duplicate this context below - it's already in the files above.**

## Implementation Plan

- [ ] **Item 1 — Create User Module Structure + Drizzle Schema + Migration**
  - **What to do:**
    1. Create directory structure at `/backend/modules/users/`
    2. Create `/backend/modules/users/schema/user.schema.ts` with Drizzle MySQL table:
       - `id`: varchar(36) PRIMARY KEY (UUID format)
       - `name`: varchar(255) NOT NULL
       - `email`: varchar(255) NOT NULL UNIQUE
       - `emailVerified`: boolean DEFAULT false NOT NULL
       - `passwordHash`: varchar(255) NOT NULL (for argon2 hash)
       - `image`: text (nullable, for profile picture)
       - `createdAt`: timestamp with fsp:3, defaultNow()
       - `updatedAt`: timestamp with fsp:3, defaultNow(), $onUpdate()
    3. Create `/backend/drizzle.config.ts` with MySQL dialect:
       - Schema path: `./modules/users/schema/*.ts`
       - Output: `./drizzle` folder for migrations
       - Database credentials from environment variables
    4. Add drizzle-kit scripts to `/backend/package.json`:
       - `"db:generate": "bunx drizzle-kit generate"`
       - `"db:migrate": "bunx drizzle-kit migrate"`
       - `"db:push": "bunx drizzle-kit push"`
    5. Run `bunx drizzle-kit push` to apply schema to MySQL

  - **Context (read-only):**
    - PROMPT.md:30-39 — Drizzle schema pattern with exact column definitions
    - TASK5/PROMPT.md:45-58 — MySQL connection setup in `/backend/infra/database/mysql.ts`
    - AI_PROMPT.md:139-148 — Drizzle ORM MySQL pattern
    - Better-Auth docs — User table requires: id, name, email, emailVerified, image, createdAt, updatedAt

  - **Touched (will modify/create):**
    - CREATE: `/backend/modules/users/schema/user.schema.ts`
    - CREATE: `/backend/drizzle.config.ts`
    - MODIFY: `/backend/package.json` — Add db:* scripts

  - **Interfaces / Contracts:**
    ```typescript
    // user.schema.ts exports
    import { mysqlTable, varchar, text, timestamp, boolean } from 'drizzle-orm/mysql-core'

    export const users = mysqlTable('user', {
      id: varchar('id', { length: 36 }).primaryKey(),
      name: varchar('name', { length: 255 }).notNull(),
      email: varchar('email', { length: 255 }).notNull().unique(),
      emailVerified: boolean('email_verified').default(false).notNull(),
      passwordHash: varchar('password_hash', { length: 255 }).notNull(),
      image: text('image'),
      createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
      updatedAt: timestamp('updated_at', { fsp: 3 })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
    })

    export type User = typeof users.$inferSelect
    export type NewUser = typeof users.$inferInsert
    ```

  - **Tests:**
    Type: build verification (schema validation happens at compile time)
    - Verify: TypeScript compiles without errors
    - Verify: `bunx drizzle-kit push` succeeds
    - Verify: `user` table exists in MySQL with correct columns

  - **Migrations / Data:**
    - Database: Run `bunx drizzle-kit push` to apply schema
    - Config: Requires MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE env vars
    - Note: Better-Auth also needs `session` and `account` tables (created automatically by Better-Auth)

  - **Observability:**
    N/A - Schema definition only

  - **Security & Permissions:**
    - Email uniqueness enforced at DB level (prevents duplicate accounts)
    - passwordHash column stores argon2 hash (never plaintext)

  - **Performance:**
    - Email has UNIQUE index for fast lookups during login
    - Primary key on id for efficient joins

  - **Commands:**
    ```bash
    # Create directories
    mkdir -p /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend/modules/users/schema

    # After creating files, push schema to MySQL (Docker must be running)
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bunx drizzle-kit push

    # Type check
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run typecheck
    ```

  - **Risks & Mitigations:**
    - **Risk:** Better-Auth may expect specific table/column names
      **Mitigation:** Use Better-Auth's expected names (user, email, etc.) and configure adapter if needed
    - **Risk:** MySQL container not running
      **Mitigation:** Ensure `docker-compose up -d` from TASK1 is running first

---

- [ ] **Item 2 — Implement Password Utilities with Argon2 + Unit Tests**
  - **What to do:**
    1. Install `@node-rs/argon2` dependency in backend package
    2. Create `/backend/modules/users/core/password.ts`:
       - `hashPassword(password: string): Promise<string>` — Hash with argon2
       - `verifyPassword(hash: string, password: string): Promise<boolean>` — Verify hash
       - Use secure defaults (argon2id variant)
    3. Create `/backend/modules/users/core/__tests__/password.test.ts`:
       - Test: hashPassword returns a string starting with `$argon2`
       - Test: verifyPassword returns true for correct password
       - Test: verifyPassword returns false for incorrect password
       - Test: hashPassword produces different hashes for same input (salting)
       - Test: empty password handling

  - **Context (read-only):**
    - PROMPT.md:54-59 — Password utility function signatures
    - AI_PROMPT.md:373-377 — Testing guidance (unit tests in core/)
    - TASK3/TODO.md:81-88 — Vitest test pattern for unit tests

  - **Touched (will modify/create):**
    - CREATE: `/backend/modules/users/core/password.ts`
    - CREATE: `/backend/modules/users/core/__tests__/password.test.ts`
    - MODIFY: `/backend/package.json` — Add @node-rs/argon2 dependency

  - **Interfaces / Contracts:**
    ```typescript
    // password.ts exports
    export async function hashPassword(password: string): Promise<string>
    export async function verifyPassword(hash: string, password: string): Promise<boolean>
    ```

  - **Tests:**
    Type: unit tests with Vitest
    - Happy path: `hashPassword('secret123')` returns string starting with `$argon2`
    - Happy path: `verifyPassword(hash, 'secret123')` returns `true`
    - Failure: `verifyPassword(hash, 'wrongpassword')` returns `false`
    - Edge case: Two calls to `hashPassword('same')` produce different hashes
    - Edge case: Empty string password throws or returns false (decide behavior)

  - **Migrations / Data:**
    N/A - Pure utility functions

  - **Observability:**
    - Log warning if password verification takes >500ms (potential timing attack or performance issue)

  - **Security & Permissions:**
    - Use argon2id variant (recommended for password hashing)
    - Memory cost: 65536 (64MB), time cost: 3, parallelism: 4 (OWASP recommendations)
    - Never log passwords or hashes

  - **Performance:**
    - Argon2 is intentionally slow (~100-500ms) to prevent brute force
    - Target: <500ms per hash operation

  - **Commands:**
    ```bash
    # Install argon2
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun add @node-rs/argon2

    # Run password tests only
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork && bun test backend/modules/users/core/__tests__/password.test.ts --silent

    # Type check
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run typecheck
    ```

  - **Risks & Mitigations:**
    - **Risk:** @node-rs/argon2 may have native binding issues on some platforms
      **Mitigation:** Use pure JS fallback or alternative library if needed (e.g., argon2)

---

- [ ] **Item 3 — Configure Better-Auth with Drizzle Adapter + Session Tables**
  - **What to do:**
    1. Install Better-Auth dependencies in backend:
       - `better-auth`
    2. Create `/backend/infra/auth.ts`:
       - Import `betterAuth` from 'better-auth'
       - Import `drizzleAdapter` from 'better-auth/adapters/drizzle'
       - Import `db` from './database/mysql'
       - Configure with MySQL provider
       - Enable emailAndPassword authentication
       - Configure session settings (7 day expiry)
    3. Create Better-Auth required tables (session, account, verification):
       - Add to `/backend/modules/users/schema/auth.schema.ts`
       - `session` table: id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId
       - `account` table: id, accountId, providerId, userId, accessToken, refreshToken, etc.
       - `verification` table: id, identifier, value, expiresAt, createdAt, updatedAt
    4. Run migration to create auth tables

  - **Context (read-only):**
    - PROMPT.md:42-52 — Better-Auth config pattern
    - AI_PROMPT.md:173-182 — Better-Auth with Drizzle pattern
    - Better-Auth docs — Drizzle adapter requires session, account, verification tables

  - **Touched (will modify/create):**
    - CREATE: `/backend/infra/auth.ts`
    - CREATE: `/backend/modules/users/schema/auth.schema.ts`
    - MODIFY: `/backend/package.json` — Add better-auth dependency

  - **Interfaces / Contracts:**
    ```typescript
    // auth.ts exports
    import { betterAuth } from 'better-auth'
    import { drizzleAdapter } from 'better-auth/adapters/drizzle'
    import { db } from './database/mysql'

    export const auth = betterAuth({
      database: drizzleAdapter(db, { provider: 'mysql' }),
      emailAndPassword: {
        enabled: true,
        // Custom password hashing using our argon2 utilities
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Update session every 24 hours
      },
    })

    export type Session = typeof auth.$Infer.Session
    ```

  - **Tests:**
    Type: build verification + integration (tested in Item 4)
    - Verify: TypeScript compiles without errors
    - Verify: Better-Auth initializes without errors
    - Verify: Session/account/verification tables created in MySQL

  - **Migrations / Data:**
    - Database: Run `bunx drizzle-kit push` after adding auth schema tables
    - Config: Better-Auth uses same MySQL connection as Drizzle

  - **Observability:**
    - Better-Auth logs authentication events by default

  - **Security & Permissions:**
    - Session tokens are cryptographically secure
    - HttpOnly cookies for session storage
    - CSRF protection enabled by default

  - **Performance:**
    N/A - Configuration only

  - **Commands:**
    ```bash
    # Install better-auth
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun add better-auth

    # Push auth schema to MySQL
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bunx drizzle-kit push

    # Type check
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run typecheck
    ```

  - **Risks & Mitigations:**
    - **Risk:** Better-Auth schema may conflict with custom user schema
      **Mitigation:** Use Better-Auth's expected table names and add custom fields as needed

---

- [ ] **Item 4 — Implement Auth Routes (Signup, Login) + User Routes (Me)**
  - **What to do:**
    1. Create `/backend/modules/users/services/user.service.ts`:
       - `createUser(data: NewUser): Promise<User>` — Insert user into DB
       - `findUserByEmail(email: string): Promise<User | null>` — Query by email
       - `findUserById(id: string): Promise<User | null>` — Query by ID
    2. Create `/backend/modules/users/routes/auth.routes.ts`:
       - Mount Better-Auth handler at `/api/auth/*`
       - Better-Auth handles: `/api/auth/sign-up/email`, `/api/auth/sign-in/email`, `/api/auth/sign-out`
    3. Create `/backend/modules/users/routes/user.routes.ts`:
       - `GET /users/me` — Protected route, returns current user from session
       - Use Better-Auth session validation via `auth.api.getSession({ headers })`
    4. Create `/backend/modules/users/index.ts`:
       - Export Elysia plugin that combines auth.routes and user.routes
    5. Register user module in main Elysia app (`/backend/src/app.ts`)

  - **Context (read-only):**
    - TASK.md:49-51 — Route specifications (POST /signup, POST /login, GET /users/me)
    - AI_PROMPT.md:122-135 — ElysiaJS route pattern with TypeBox validation
    - Better-Auth Elysia docs — Mount handler with `app.mount(auth.handler)`
    - TASK3/TODO.md:61-79 — SignupSchema, LoginSchema, UserResponseSchema contracts

  - **Touched (will modify/create):**
    - CREATE: `/backend/modules/users/services/user.service.ts`
    - CREATE: `/backend/modules/users/routes/auth.routes.ts`
    - CREATE: `/backend/modules/users/routes/user.routes.ts`
    - CREATE: `/backend/modules/users/index.ts`
    - MODIFY: `/backend/src/app.ts` — Register user module

  - **Interfaces / Contracts:**
    ```typescript
    // user.service.ts
    export class UserService {
      async createUser(data: NewUser): Promise<User>
      async findUserByEmail(email: string): Promise<User | null>
      async findUserById(id: string): Promise<User | null>
    }

    // Routes (Better-Auth handles these automatically):
    // POST /api/auth/sign-up/email — Body: { email, password, name }
    // POST /api/auth/sign-in/email — Body: { email, password }
    // POST /api/auth/sign-out — Invalidates session
    // GET /api/auth/session — Returns current session

    // Custom routes:
    // GET /users/me — Returns UserResponse (uses contract schema)
    ```

  - **Tests:**
    Type: integration tests (deferred to TASK8 with Testcontainers)
    - Happy path: POST /api/auth/sign-up/email creates user and returns session
    - Happy path: POST /api/auth/sign-in/email authenticates and returns session
    - Happy path: GET /users/me returns user when authenticated
    - Failure: GET /users/me returns 401 when not authenticated
    - Failure: POST /api/auth/sign-up/email with existing email returns error
    - Edge case: Login with wrong password returns generic error (no user enumeration)

  - **Migrations / Data:**
    N/A - Uses existing schema

  - **Observability:**
    - Log signup attempts (success/failure) without passwords
    - Log login attempts (success/failure) without passwords
    - Include request ID for tracing

  - **Security & Permissions:**
    - Error messages don't leak user existence (generic "Invalid credentials")
    - Rate limiting should be added in production (not in scope for this task)
    - Password validation uses contract schema (minLength: 8)
    - Email validation uses contract schema (format: email)

  - **Performance:**
    - Session lookup should be <50ms (indexed by token)
    - User lookup should be <50ms (indexed by email)

  - **Commands:**
    ```bash
    # Start backend (Docker must be running)
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run dev

    # Test signup manually (after server is running)
    curl -X POST http://localhost:3000/api/auth/sign-up/email \
      -H "Content-Type: application/json" \
      -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

    # Type check
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run typecheck
    ```

  - **Risks & Mitigations:**
    - **Risk:** Better-Auth route paths may differ from expected
      **Mitigation:** Check Better-Auth docs for exact route paths, adjust if needed
    - **Risk:** Session validation may require specific header format
      **Mitigation:** Use Better-Auth's `auth.api.getSession({ headers })` method

---

- [ ] **Item 5 — Create Module CLAUDE.md Documentation**
  - **What to do:**
    1. Create `/backend/modules/users/CLAUDE.md` documenting:
       - Module purpose and scope
       - API endpoints with request/response examples
       - Database schema (user, session, account tables)
       - Authentication flow (signup → login → session → protected routes)
       - Environment variables required
       - Development commands (run, test, migrate)
       - Security considerations

  - **Context (read-only):**
    - TASK.md:57 — Requirement for module CLAUDE.md
    - AI_PROMPT.md:268-275 — CLAUDE.md documentation requirements
    - Items 1-4 above — Content to document

  - **Touched (will modify/create):**
    - CREATE: `/backend/modules/users/CLAUDE.md`

  - **Interfaces / Contracts:**
    N/A - Documentation only

  - **Tests:**
    N/A - Documentation only

  - **Migrations / Data:**
    N/A - Documentation only

  - **Observability:**
    N/A - Documentation only

  - **Security & Permissions:**
    - Document security best practices in CLAUDE.md

  - **Performance:**
    N/A - Documentation only

  - **Commands:**
    ```bash
    # No commands needed - just create the file
    ```

  - **Risks & Mitigations:**
    - **Risk:** Documentation may become outdated
      **Mitigation:** Keep CLAUDE.md close to code, update when API changes

---

## Verification (global)
- [ ] Run targeted tests ONLY for changed code:
      ```bash
      # Run password utility tests
      cd /Users/samuelfajreldines/Desenvolvimento/VibeWork && bun test backend/modules/users/core --silent

      # Type check backend only
      cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run typecheck

      # Push schema and verify tables exist
      cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bunx drizzle-kit push
      ```
      **CRITICAL:** Do not run full-project checks. Tests are scoped to users module only.
- [ ] All acceptance criteria met (see below)
- [ ] Code follows conventions from AI_PROMPT.md and PROMPT.md
- [ ] Integration points properly implemented:
      - User schema compatible with Better-Auth
      - Routes use contract schemas from `@vibe-code/contract`
      - Auth routes mounted in main app
- [ ] Manual verification:
      - Start server: `cd backend && bun run dev`
      - Test signup: `curl -X POST http://localhost:3000/api/auth/sign-up/email -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","name":"Test"}'`
      - Test login: `curl -X POST http://localhost:3000/api/auth/sign-in/email -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123"}'`
      - Test me: `curl http://localhost:3000/users/me -H "Cookie: <session_cookie>"`

## Acceptance Criteria
- [ ] `user` table created via Drizzle migration with columns: id, name, email, emailVerified, passwordHash, image, createdAt, updatedAt
- [ ] Better-Auth integrated with Drizzle adapter (session, account, verification tables)
- [ ] `POST /api/auth/sign-up/email` creates user and returns session cookie
- [ ] `POST /api/auth/sign-in/email` authenticates and returns session cookie
- [ ] `GET /users/me` returns current user (protected, requires session)
- [ ] Password uses argon2 hashing (via @node-rs/argon2)
- [ ] Unit test exists for password hashing in `core/__tests__/password.test.ts`
- [ ] Module `CLAUDE.md` documents API endpoints and auth flow
- [ ] No plaintext passwords stored (only argon2 hashes)
- [ ] Email uniqueness enforced at DB level (UNIQUE constraint)
- [ ] Protected routes check session (401 if not authenticated)
- [ ] Error messages don't leak user existence

## Impact Analysis
- **Directly impacted:**
  - `/backend/modules/users/schema/user.schema.ts` (new)
  - `/backend/modules/users/schema/auth.schema.ts` (new)
  - `/backend/modules/users/core/password.ts` (new)
  - `/backend/modules/users/core/__tests__/password.test.ts` (new)
  - `/backend/modules/users/services/user.service.ts` (new)
  - `/backend/modules/users/routes/auth.routes.ts` (new)
  - `/backend/modules/users/routes/user.routes.ts` (new)
  - `/backend/modules/users/index.ts` (new)
  - `/backend/infra/auth.ts` (new)
  - `/backend/drizzle.config.ts` (new)
  - `/backend/src/app.ts` (modified - register user module)
  - `/backend/package.json` (modified - add dependencies and scripts)
  - `/backend/modules/users/CLAUDE.md` (new)

- **Indirectly impacted:**
  - TASK8 depends on this for integration tests with Testcontainers
  - TASK11 depends on this for E2E auth flow tests
  - TASK12 depends on auth being functional
  - Frontend (TASK9) will consume auth endpoints via Eden

## Diff Test Plan
| Changed Symbol | Test Type | Test Cases |
|---------------|-----------|------------|
| hashPassword | unit | returns argon2 hash, different hashes for same input |
| verifyPassword | unit | true for correct password, false for incorrect |
| users schema | build | TypeScript compiles, drizzle-kit push succeeds |
| auth.routes | manual | signup creates user, login returns session |
| user.routes | manual | /me returns user when authenticated, 401 when not |

## Follow-ups
- Integration tests for auth flow are deferred to TASK8 (Testcontainers)
- Rate limiting for auth endpoints should be added in production
- Email verification flow is supported by Better-Auth but not required for this task
