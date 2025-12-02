# AI Agent Prompt: VIBE Code Compliant Hybrid Data Monorepo

## 1. Purpose

**What:** Scaffold a production-ready, VIBE Code compliant monorepo with a modular monolith backend (Bun + ElysiaJS) and React frontend, featuring User (MySQL/Drizzle) and Notification (MongoDB/Typegoose) modules, with comprehensive testing, internationalization, and GCP-focused infrastructure.

**Why:** Establish a foundational architecture that ensures extreme performance, end-to-end type safety, strict modularity, and automated quality gates from day one. This becomes the template for all future development.

**Success Definition:**
- All services start and communicate via Eden RPC
- User signup/login flow works end-to-end with Better-Auth
- Notification module stores/retrieves documents from MongoDB
- All test layers pass (unit, integration with Testcontainers, E2E with Playwright)
- Git hooks enforce code quality before commits
- i18n configured for both frontend and backend
- Docker Compose runs the full stack locally

---

## 2. Environment & Codebase Context

### Tech Stack

| Layer | Technology | Version/Notes |
|-------|------------|---------------|
| Runtime | Bun | Latest stable |
| Backend Framework | ElysiaJS | With Eden for type-safe RPC |
| Relational DB | MySQL | Via Drizzle ORM |
| Document DB | MongoDB | Via Typegoose/Mongoose |
| Cache | Redis | For caching only (NOT event bus) |
| Event Bus | Google Cloud Pub/Sub | For async messaging |
| Frontend | React + Vite | With TanStack Query v5 |
| Auth | Better-Auth | Drizzle adapter, Email/Password only |
| Monorepo | Turborepo + Bun Workspaces | |
| Testing | Vitest + Testcontainers + Playwright | |
| i18n | i18next (or similar) | Frontend AND Backend |

### Project Structure (Flat Monorepo)

```
/
├── backend/                    # Bun + Elysia service
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── app.ts             # Elysia app configuration
│   │   └── i18n/              # Backend i18n setup
│   ├── modules/
│   │   ├── users/             # User module (MySQL/Drizzle)
│   │   │   ├── core/          # Pure business logic
│   │   │   ├── routes/        # Elysia routes
│   │   │   ├── schema/        # Drizzle schema
│   │   │   └── services/      # Data access layer
│   │   └── notifications/     # Notification module (MongoDB)
│   │       ├── core/          # Pure business logic
│   │       ├── routes/        # Elysia routes
│   │       ├── models/        # Typegoose models
│   │       └── services/      # Data access + email (SES)
│   ├── infra/
│   │   ├── database/          # DB connections (MySQL, MongoDB)
│   │   ├── cache.ts           # Redis cache client
│   │   └── pubsub.ts          # Google Pub/Sub client
│   ├── Dockerfile
│   ├── CLAUDE.md
│   └── package.json
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── i18n/              # Frontend i18n setup
│   │   └── features/
│   │       ├── auth/          # Login/Signup components
│   │       └── notifications/ # Notification UI
│   ├── CLAUDE.md
│   └── package.json
├── packages/
│   ├── contract/              # Shared TypeBox schemas for Eden
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   └── notification.ts
│   │   ├── CLAUDE.md
│   │   └── package.json
│   └── ui/                    # Shared component library placeholder
│       └── package.json
├── infra/                     # Terraform IaC (GCP)
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── e2e/                       # Playwright E2E tests
│   ├── tests/
│   │   └── auth.spec.ts
│   └── playwright.config.ts
├── docker-compose.yml         # Local dev environment
├── turbo.json
├── package.json               # Root package.json
├── .husky/                    # Git hooks
├── .lintstagedrc.js
├── .eslintrc.js
├── .prettierrc
├── commitlint.config.js
├── CLAUDE.md                  # Root documentation
└── CHANGELOG.md
```

### Key Architectural Decisions

1. **Modular Monolith:** Backend uses module boundaries (users, notifications) that can be extracted to microservices later
2. **Redis = Cache Only:** Clarified that Redis is NOT for event bus; use Google Pub/Sub for messaging
3. **Notifications:** In-app storage (MongoDB) + Email delivery via AWS SES
4. **Auth:** Email/Password only via Better-Auth with Drizzle MySQL adapter
5. **i18n:** Full internationalization for both frontend and backend
6. **Local Dev:** Docker Compose orchestrates MySQL, MongoDB, Redis, and Pub/Sub emulator
7. **Cloud:** GCP-focused Terraform for production infrastructure
8. **Test Coverage:** 80% threshold enforced by CI

---

## 3. Related Code Context

Since this is a greenfield scaffold, reference these external patterns:

### ElysiaJS with Eden Pattern
```typescript
// backend/src/app.ts - Elysia with TypeBox validation
import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'

export const app = new Elysia()
  .use(swagger())
  .post('/signup', ({ body }) => { /* ... */ }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 })
    })
  })
```

### Drizzle ORM with MySQL Pattern
```typescript
// backend/modules/users/schema/user.schema.ts
import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
})
```

### Typegoose with MongoDB Pattern
```typescript
// backend/modules/notifications/models/notification.model.ts
import { prop, getModelForClass } from '@typegoose/typegoose'

class Notification {
  @prop({ required: true })
  userId!: string

  @prop({ required: true })
  type!: 'in-app' | 'email'

  @prop({ required: true })
  message!: string

  @prop({ default: false })
  read!: boolean
}

export const NotificationModel = getModelForClass(Notification)
```

### Better-Auth with Drizzle Pattern
```typescript
// backend/infra/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'mysql' }),
  emailAndPassword: { enabled: true }
})
```

### Testcontainers Pattern
```typescript
// backend/modules/users/__tests__/integration.test.ts
import { MySqlContainer } from '@testcontainers/mysql'
import { MongoDBContainer } from '@testcontainers/mongodb'

let mysqlContainer: StartedMySqlContainer
let mongoContainer: StartedMongoDBContainer

beforeAll(async () => {
  mysqlContainer = await new MySqlContainer().start()
  mongoContainer = await new MongoDBContainer().start()
})
```

---

## 4. Acceptance Criteria

### Layer 0: Foundation

- [ ] Root `package.json` configures Bun workspaces for all packages
- [ ] `turbo.json` defines build, test, lint, typecheck pipelines with proper dependencies
- [ ] Docker Compose starts MySQL, MongoDB, Redis, and GCP Pub/Sub emulator
- [ ] All packages compile with zero TypeScript errors

### Layer 1: Backend Core

- [ ] ElysiaJS app starts on port 3000 with Swagger UI at `/swagger`
- [ ] Drizzle ORM connects to MySQL and applies migrations
- [ ] Typegoose/Mongoose connects to MongoDB
- [ ] Redis client connects for caching
- [ ] Google Pub/Sub client configured (with emulator for local dev)
- [ ] `/healthz` endpoint returns 200 OK immediately
- [ ] `/readyz` endpoint checks MySQL, MongoDB, Redis connectivity

### Layer 2: User Module (MySQL/Drizzle)

- [ ] `users` table schema defined with Drizzle
- [ ] Better-Auth integrated with email/password authentication
- [ ] `POST /signup` creates user and returns session
- [ ] `POST /login` authenticates and returns session
- [ ] `GET /users/me` returns current user (protected route)
- [ ] Password hashing uses secure algorithm (argon2 or bcrypt)
- [ ] Unit test for password hashing utility exists in `core/`

### Layer 3: Notification Module (MongoDB/Typegoose)

- [ ] `Notification` model defined with Typegoose
- [ ] `POST /notifications` creates notification (in-app or email)
- [ ] `GET /notifications` lists user's notifications
- [ ] `PATCH /notifications/:id/read` marks notification as read
- [ ] Email notifications trigger AWS SES (interface defined, can be mocked)
- [ ] Pub/Sub integration for async notification processing

### Layer 4: Frontend

- [ ] Vite + React app starts on port 5173
- [ ] Eden client connects to backend with full type safety
- [ ] TanStack Query v5 configured with Eden
- [ ] Login/Signup forms work end-to-end
- [ ] i18n configured with at least 2 locales (en, pt-BR)

### Layer 5: Shared Packages

- [ ] `packages/contract` exports TypeBox schemas used by both frontend and backend
- [ ] `packages/ui` placeholder exists with basic component structure

### Layer 6: Testing

- [ ] Vitest configured for unit tests with 80% coverage threshold
- [ ] Unit test example: `backend/modules/users/core/__tests__/password.test.ts`
- [ ] Integration test with Testcontainers for MySQL AND MongoDB
- [ ] Playwright configured at monorepo root
- [ ] E2E test: navigates to frontend, fills signup form, verifies success

### Layer 7: Code Quality Gates

- [ ] ESLint configured with TypeScript rules
- [ ] Prettier configured for consistent formatting
- [ ] Husky pre-commit hook runs lint-staged (Prettier + ESLint on changed files)
- [ ] Husky pre-push hook runs typecheck and fast unit tests
- [ ] Commitlint enforces Conventional Commits format
- [ ] Semantic Release configured for automated versioning/changelog

### Layer 8: Documentation

- [ ] `CLAUDE.md` in root: project overview, quick start, architecture
- [ ] `CLAUDE.md` in backend: purpose, tech, build/test commands
- [ ] `CLAUDE.md` in frontend: purpose, tech, build/test commands
- [ ] `CLAUDE.md` in packages/contract: purpose, how to add schemas
- [ ] `CLAUDE.md` in backend/modules/users: module purpose, API endpoints

### Layer 9: Infrastructure

- [ ] `backend/Dockerfile` optimized for Bun (multi-stage, minimal image)
- [ ] `infra/main.tf` skeleton for GCP: Cloud SQL (MySQL), MongoDB Atlas reference, Memorystore (Redis), Pub/Sub
- [ ] TFLint and Checkov configured for IaC quality
- [ ] `infra:lint` and `infra:security` scripts in turbo.json

### Layer 10: i18n

- [ ] Backend: i18next or similar configured, error messages translated
- [ ] Frontend: react-i18next configured with namespace structure
- [ ] At minimum 2 locales: `en` (English), `pt-BR` (Brazilian Portuguese)
- [ ] Language detection from Accept-Language header (backend) and browser (frontend)

---

## 5. Implementation Guidance

### Execution Order

**Layer 0 - Foundation (Sequential, do first):**
1. Initialize root package.json with Bun workspaces
2. Create turbo.json with pipeline definitions
3. Create docker-compose.yml
4. Set up ESLint, Prettier, Husky, Commitlint

**Layer 1 - Packages (Can parallelize):**
- packages/contract: TypeBox schemas
- packages/ui: Placeholder structure

**Layer 2 - Backend Core (Sequential):**
1. Initialize backend package
2. Set up Elysia app with Swagger
3. Configure Drizzle (MySQL connection)
4. Configure Typegoose (MongoDB connection)
5. Configure Redis cache client
6. Configure Google Pub/Sub client
7. Add health/readiness endpoints
8. Set up backend i18n

**Layer 3 - Backend Modules (Can parallelize after Layer 2):**
- User module: schema, routes, services, auth integration
- Notification module: models, routes, services, SES integration

**Layer 4 - Frontend (After packages/contract):**
1. Initialize Vite + React
2. Configure Eden client
3. Configure TanStack Query
4. Build auth UI
5. Set up frontend i18n

**Layer 5 - Testing (After features):**
1. Configure Vitest with coverage thresholds
2. Write unit test examples
3. Write integration tests with Testcontainers
4. Configure Playwright
5. Write E2E test

**Layer 6 - Infrastructure (Can parallelize):**
- Dockerfile for backend
- Terraform skeleton for GCP
- TFLint/Checkov configuration

### Expected Artifacts

| Artifact | Location | Description |
|----------|----------|-------------|
| Root package.json | `/package.json` | Workspaces, shared devDeps |
| Turbo config | `/turbo.json` | All pipeline definitions |
| Docker Compose | `/docker-compose.yml` | Local dev services |
| Backend app | `/backend/` | Full Elysia application |
| Frontend app | `/frontend/` | Full React application |
| Contracts | `/packages/contract/` | TypeBox schemas |
| E2E tests | `/e2e/` | Playwright configuration and tests |
| IaC | `/infra/` | Terraform for GCP |
| Git hooks | `/.husky/` | Pre-commit, pre-push hooks |

### Constraints

**DO NOT:**
- Use Redis for event bus/messaging (use Pub/Sub instead)
- Implement OAuth/social login (email/password only)
- Create AWS-specific Terraform (use GCP)
- Skip Testcontainers for integration tests
- Hardcode any secrets (use environment variables)
- Create overly complex abstractions for this scaffold

**MUST:**
- Use Bun as runtime (not Node.js)
- Use TypeBox for all schema validation
- Ensure Eden provides full type inference from backend to frontend
- Keep modules loosely coupled (communicate via defined interfaces)
- All environment-specific config via `.env` files

### 5.1 Testing Guidance

**Unit Tests (Vitest):**
- Test pure business logic in `core/` directories
- Example: password hashing, validation functions, notification formatting
- Mock all external dependencies
- Target: 80% coverage of changed code

**Integration Tests (Vitest + Testcontainers):**
- Spin up MySQL and MongoDB containers
- Test actual database operations
- Test service layer with real connections
- Clean up containers after tests

**E2E Tests (Playwright):**
- Full user journey: signup flow
- Test Frontend → Eden RPC → Elysia → Better-Auth → MySQL
- Use docker-compose for backend services
- Keep tests focused and fast

**Coverage Configuration:**
```typescript
// vitest.config.ts
export default {
  coverage: {
    provider: 'v8',
    thresholds: {
      global: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
}
```

---

## 6. Verification and Traceability

### Self-Verification Checklist

Before considering the task complete, verify:

- [ ] `bun install` at root succeeds
- [ ] `bun run build` compiles all packages
- [ ] `bun run typecheck` shows zero errors
- [ ] `bun run lint` passes
- [ ] `docker-compose up -d` starts all services
- [ ] `bun run test` passes all unit tests
- [ ] `bun run test:integration` passes with Testcontainers
- [ ] `bun run test:e2e` passes Playwright tests
- [ ] Swagger UI accessible at `http://localhost:3000/swagger`
- [ ] Frontend accessible at `http://localhost:5173`
- [ ] Signup flow works end-to-end
- [ ] Git commit is blocked without proper format
- [ ] Pre-push hook runs typecheck

### Requirement Traceability Matrix

| Original Requirement | Implementation Location | Verification |
|---------------------|------------------------|--------------|
| Bun + ElysiaJS | backend/src/app.ts | Server starts |
| Eden RPC | packages/contract + frontend | Type inference works |
| MySQL + Drizzle | backend/modules/users | User CRUD works |
| MongoDB + Typegoose | backend/modules/notifications | Notification CRUD works |
| Better-Auth | backend/infra/auth.ts | Login/signup works |
| React + Vite | frontend/ | App renders |
| TanStack Query | frontend/src | Queries execute |
| Turborepo | turbo.json | Pipelines run |
| Unit tests | */core/__tests__/ | Tests pass |
| Integration tests | */__tests__/integration | Testcontainers work |
| E2E tests | e2e/tests/ | Playwright passes |
| Husky hooks | .husky/ | Commits blocked |
| Conventional Commits | commitlint.config.js | Bad commits rejected |
| i18n | */i18n/ | 2 locales work |
| Health endpoints | backend/src/app.ts | /healthz, /readyz respond |
| GCP Terraform | infra/ | terraform validate passes |
| Docker | backend/Dockerfile | Image builds |

---

## 7. Reasoning Boundaries

### Prefer
- Existing ElysiaJS patterns and plugins
- Standard Drizzle/Typegoose configurations
- Established monorepo conventions
- Simple, clear module boundaries

### Avoid
- Over-abstracting for future scenarios
- Creating custom frameworks
- Deviating from stack requirements
- Adding features not in requirements

### When Uncertain
- Check ElysiaJS, Drizzle, Typegoose official docs
- Follow patterns from similar production projects
- Ask for clarification rather than assume
- Prefer simpler implementation

### Critical Clarifications Applied

1. **Multi-language = i18n:** Implement internationalization, not polyglot programming
2. **Cloud = GCP:** Terraform targets Google Cloud Platform
3. **Auth = Email/Password:** No OAuth, social login, or MFA required
4. **Coverage = 80%:** Enforce 80% threshold across all tests
5. **Notifications = In-app + Email:** Store in MongoDB, send via AWS SES
6. **Redis = Cache only:** Use Google Pub/Sub for messaging
7. **Local Dev = Docker Compose:** Orchestrate all services locally

---

## Quick Start Command Sequence

```bash
# Clone and install
bun install

# Start local services
docker-compose up -d

# Run database migrations
bun run db:migrate

# Start development
bun run dev

# Run all tests
bun run test
bun run test:integration
bun run test:e2e

# Build for production
bun run build
```
