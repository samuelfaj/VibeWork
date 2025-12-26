# VIBE Code Monorepo

Production-ready monorepo with modular monolith backend and React frontend.

## Language Standards

| Asset              | Language                   | Notes                                       |
| ------------------ | -------------------------- | ------------------------------------------- |
| **Code**           | English                    | Variables, functions, classes, comments     |
| **CLAUDE.md**      | English                    | All technical documentation                 |
| **README.md**      | Trilingual (EN, PT-BR, ES) | User-facing documentation                   |
| **Commits**        | English                    | Conventional commits format                 |
| **API responses**  | i18n (en, pt-BR, es)       | All user-facing messages must be translated |
| **Frontend UI**    | i18n (en, pt-BR, es)       | All UI text must use translation keys       |
| **Error messages** | i18n (en, pt-BR, es)       | All error messages must be translated       |

## Internationalization (i18n) Requirements

**CRITICAL**: All user-facing content MUST support all three languages: English (en), Brazilian Portuguese (pt-BR), and Spanish (es).

### What Must Be Translated

| Content Type          | Location                         | Required |
| --------------------- | -------------------------------- | -------- |
| API error messages    | `backend/src/i18n/locales/`      | Yes      |
| API success messages  | `backend/src/i18n/locales/`      | Yes      |
| Validation errors     | `backend/src/i18n/locales/`      | Yes      |
| UI labels and text    | `frontend/src/i18n/locales/`     | Yes      |
| Button text           | `frontend/src/i18n/locales/`     | Yes      |
| Form placeholders     | `frontend/src/i18n/locales/`     | Yes      |
| Notification messages | `backend/src/i18n/locales/`      | Yes      |
| Email templates       | `backend/modules/notifications/` | Yes      |

### Implementation Pattern

**Backend (API responses):**

```typescript
import { t, getLanguageFromHeader } from '@/i18n'

// Get language from Accept-Language header
const lang = getLanguageFromHeader(request.headers.get('accept-language'))

// Return translated message
return {
  message: t('user.created', { lng: lang }),
  data: user,
}
```

**Frontend (React components):**

```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
return <button>{t('common.submit')}</button>
```

### Adding New Translations

When adding any new user-facing text:

1. Add key to `en.json` (English - required first)
2. Add key to `pt-BR.json` (Portuguese - required)
3. Add key to `es.json` (Spanish - required)
4. Use the translation key in code, never hardcode strings

## Overview

This repository implements a full-stack web application with:

- **Backend**: Modular monolith using ElysiaJS with type-safe Eden RPC
- **Frontend**: React SPA with TanStack Query for server state
- **Shared Contracts**: TypeBox schemas for end-to-end type safety
- **Infrastructure**: Docker Compose for local dev, Terraform for GCP

## Tech Stack

| Layer    | Technology                    | Purpose                  |
| -------- | ----------------------------- | ------------------------ |
| Runtime  | Bun                           | Fast JavaScript runtime  |
| Backend  | ElysiaJS + Eden               | Type-safe REST API       |
| SQL DB   | MySQL + Drizzle ORM           | User data, sessions      |
| Document | MongoDB + Typegoose           | Notifications            |
| Cache    | Redis                         | Caching only             |
| Events   | Google Cloud Pub/Sub          | Async messaging          |
| Frontend | React + Vite + TanStack Query | SPA with server state    |
| Auth     | Better-Auth                   | Email/password auth      |
| i18n     | i18next                       | Frontend + backend       |
| Monorepo | Turborepo + Bun Workspaces    | Build orchestration      |
| Testing  | Vitest + Testcontainers       | Unit + integration tests |
| E2E      | Playwright + Stagehand        | End-to-end tests         |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React)                          │
│                    TanStack Query + Eden RPC                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Type-safe API calls
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend (ElysiaJS + Bun)                       │
│  ┌────────────────────┐    ┌────────────────────────────────────┐   │
│  │   Users Module     │    │     Notifications Module           │   │
│  │  (Better-Auth)     │    │  (Pub/Sub + Email via SES)         │   │
│  └─────────┬──────────┘    └──────────────┬─────────────────────┘   │
│            │                              │                          │
│            ▼                              ▼                          │
│  ┌─────────────────┐           ┌──────────────────┐                 │
│  │   MySQL/Drizzle │           │ MongoDB/Typegoose│                 │
│  └─────────────────┘           └──────────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │        Redis (Cache)           │
              │   Google Pub/Sub (Events)      │
              └────────────────────────────────┘
```

## Module Architecture

### Core Principle: Domain-Based Organization

```
✅ CORRECT (by domain):
modules/
├── projects/      # One folder, all roles access it
├── billing/
└── files/

❌ WRONG (by user type):
modules/
├── clients/projects/
├── admin/projects/
└── architect/projects/
```

**Why?**

- Avoids code duplication
- Single source of truth per entity
- Permissions controlled by **role**, not folder structure
- Easier maintenance and microservice extraction

### Role-Based Access Control

Same endpoint, data filtered by role:

```typescript
// All roles use the same route, data filtered automatically
.get('/projects', async ({ user }) => {
  switch (user.role) {
    case 'client':
      return projectService.getByClientId(user.clientId)
    case 'manager':
      return projectService.getByManagerId(user.id)
    default:
      return projectService.getAll()
  }
})

// Restrict by role using middleware
.post('/projects', handler, {
  beforeHandle: requireRole(['manager', 'admin'])
})
```

### Polymorphic Modules

Some modules serve multiple entities:

```typescript
// files/ and messaging/ can be linked to any entity
fileAssociation: {
  entityType: 'project' | 'contract' | 'quote',
  entityId: string
}
```

### Inter-Module Communication

```typescript
// Synchronous (read) - import services
import { projectService } from '@/modules/projects'
const project = await projectService.getById(id)

// Asynchronous (write) - use Pub/Sub events
await pubsub.topic('order-created').publish({ orderId, userId })
```

## Project Structure

```
/
├── backend/                         # ElysiaJS backend service
│   ├── src/
│   │   ├── infra/                   # Infrastructure connections → see infra/CLAUDE.md
│   │   └── i18n/                    # Internationalization
│   ├── modules/
│   │   ├── health/                  # Health checks → see modules/health/CLAUDE.md
│   │   ├── users/                   # User auth → see modules/users/CLAUDE.md
│   │   ├── notifications/           # Notifications → see modules/notifications/CLAUDE.md
│   │   └── CLAUDE.md                # Modular architecture guide
│   └── CLAUDE.md                    # Backend overview
│
├── frontend/                        # React + Vite application
│   ├── src/
│   │   ├── features/                # Feature modules → see features/CLAUDE.md
│   │   ├── lib/                     # API client, Query setup → see lib/CLAUDE.md
│   │   ├── i18n/                    # Internationalization → see i18n/CLAUDE.md
│   │   │   ├── locales/
│   │   │   │   ├── en.json
│   │   │   │   ├── pt-BR.json
│   │   │   │   └── es.json
│   │   │   └── CLAUDE.md
│   │   └── CLAUDE.md
│   └── CLAUDE.md                    # Frontend overview
│
├── shared/                          # Shared workspace → see shared/CLAUDE.md
│   ├── contract/
│   │   ├── src/
│   │   │   ├── user.ts              # User schemas
│   │   │   └── notification.ts      # Notification schemas
│   │   └── CLAUDE.md                # Contract documentation
│
├── infra/                           # Terraform IaC → see infra/CLAUDE.md
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── CLAUDE.md
│
├── e2e/                             # End-to-end tests
│   ├── playwright/                  # Playwright E2E tests
│   └── stagehand/                   # Stagehand AI E2E tests → see e2e/stagehand/CLAUDE.md
├── docker-compose.yml               # Local development services
├── turbo.json                       # Turborepo pipeline config
└── CLAUDE.md                        # This file - Documentation Map
```

**Quick Navigation:** Every major directory has a `CLAUDE.md` file with detailed documentation. Use the [Documentation Map](#documentation-map) above to find what you need.

## Quick Start

```bash
# Install dependencies
bun install

# Start local services (MySQL, MongoDB, Redis, Pub/Sub emulator)
docker-compose up -d

# Run database migrations (when backend is ready)
bun run db:migrate

# Start development servers
bun run dev

# Run tests
bun run test

# Build all packages
bun run build
```

## Common Commands

| Command                      | Description                        |
| ---------------------------- | ---------------------------------- |
| `bun install`                | Install all workspace dependencies |
| `docker-compose up -d`       | Start local infrastructure         |
| `bun run dev`                | Start all dev servers (Turborepo)  |
| `bun run build`              | Build all packages                 |
| `bun run test`               | Run unit tests                     |
| `bun run test:integration`   | Run integration tests              |
| `bun run test:e2e`           | Run Playwright E2E tests           |
| `bun run test:e2e:stagehand` | Run AI-powered Stagehand E2E tests |
| `bun run lint`               | Run ESLint on all packages         |
| `bun run lint:fix`           | Auto-fix ESLint issues             |
| `bun run typecheck`          | TypeScript type checking           |
| `bun run format`             | Format code with Prettier          |

## Documentation Map

Every important folder has detailed CLAUDE.md documentation. Use this map to find the right documentation for your task:

### Frontend Documentation

| Documentation                                                        | Purpose                                             |
| -------------------------------------------------------------------- | --------------------------------------------------- |
| [`frontend/CLAUDE.md`](frontend/CLAUDE.md)                           | Frontend application overview, structure, setup     |
| [`frontend/src/features/CLAUDE.md`](frontend/src/features/CLAUDE.md) | Feature-based architecture, adding new features     |
| [`frontend/src/lib/CLAUDE.md`](frontend/src/lib/CLAUDE.md)           | API client (Eden), TanStack Query, Ant Design setup |
| [`frontend/src/i18n/CLAUDE.md`](frontend/src/i18n/CLAUDE.md)         | Internationalization (en, pt-BR, es), translations  |

### Backend Documentation

| Documentation                                                                        | Purpose                                       |
| ------------------------------------------------------------------------------------ | --------------------------------------------- |
| [`backend/CLAUDE.md`](backend/CLAUDE.md)                                             | Backend overview, API structure, setup        |
| [`backend/src/infra/CLAUDE.md`](backend/src/infra/CLAUDE.md)                         | Database, cache, Pub/Sub, auth connections    |
| [`backend/modules/CLAUDE.md`](backend/modules/CLAUDE.md)                             | Modular architecture, adding new modules      |
| [`backend/modules/health/CLAUDE.md`](backend/modules/health/CLAUDE.md)               | Health checks, readiness probes               |
| [`backend/modules/users/CLAUDE.md`](backend/modules/users/CLAUDE.md)                 | User authentication, sessions, profiles       |
| [`backend/modules/notifications/CLAUDE.md`](backend/modules/notifications/CLAUDE.md) | Notifications, Pub/Sub events, email delivery |

### Shared Code Documentation

| Documentation                                            | Purpose                                      |
| -------------------------------------------------------- | -------------------------------------------- |
| [`shared/CLAUDE.md`](shared/CLAUDE.md)                   | Shared workspace overview, building packages |
| [`shared/contract/CLAUDE.md`](shared/contract/CLAUDE.md) | TypeBox schemas, type definitions            |

### Infrastructure Documentation

| Documentation                        | Purpose                                    |
| ------------------------------------ | ------------------------------------------ |
| [`infra/CLAUDE.md`](infra/CLAUDE.md) | Terraform setup, GCP resources, deployment |

### E2E Testing Documentation

| Documentation                                        | Purpose                             |
| ---------------------------------------------------- | ----------------------------------- |
| [`e2e/stagehand/CLAUDE.md`](e2e/stagehand/CLAUDE.md) | AI-powered E2E tests with Stagehand |
| [`e2e/playwright/`](e2e/playwright/)                 | Playwright E2E tests                |

### Finding Documentation by Task

**Need to...**

- **Add a new frontend feature?** → [`frontend/src/features/CLAUDE.md`](frontend/src/features/CLAUDE.md)
- **Add a new backend API endpoint?** → [`backend/src/routes/CLAUDE.md`](backend/src/routes/CLAUDE.md)
- **Create a new backend module?** → [`backend/modules/CLAUDE.md`](backend/modules/CLAUDE.md)
- **Add translation keys?** → [`frontend/src/i18n/CLAUDE.md`](frontend/src/i18n/CLAUDE.md)
- **Use the API client?** → [`frontend/src/lib/CLAUDE.md`](frontend/src/lib/CLAUDE.md)
- **Connect to a database?** → [`backend/src/infra/CLAUDE.md`](backend/src/infra/CLAUDE.md)
- **Deploy to GCP?** → [`infra/CLAUDE.md`](infra/CLAUDE.md)
- **Define a new data schema?** → [`shared/contract/CLAUDE.md`](shared/contract/CLAUDE.md)
- **Add E2E tests for a feature?** → [`e2e/stagehand/CLAUDE.md`](e2e/stagehand/CLAUDE.md)

## Environment Setup

### Required Services (via Docker Compose)

- MySQL 8.0 (port 3306)
- MongoDB 7.0 (port 27017)
- Redis 7.0 (port 6379)
- Google Pub/Sub Emulator (port 8085)

### Environment Variables

See individual package CLAUDE.md files for package-specific variables.

## Key Architectural Decisions

1. **Modular Monolith**: Backend uses module boundaries that can be extracted to microservices
2. **Domain-Based Organization**: Modules organized by domain, NOT by user type
3. **Role-Based Access Control**: Same endpoints for all users, data filtered by role
4. **Polymorphic Modules**: Some modules (files, messaging) serve multiple entities
5. **Redis = Cache Only**: Use Google Pub/Sub for event messaging, not Redis
6. **Type-Safe RPC**: Eden provides compile-time type safety between frontend and backend
7. **Trilingual i18n (MANDATORY)**: All user-facing content MUST be translated to en, pt-BR, and es - no exceptions
8. **Test Coverage**: 80% threshold enforced
9. **Co-located Tests**: Test files live alongside source files (e.g., `file.ts` and `file.test.ts`), NOT in separate `__tests__` directories
10. **E2E Tests Required**: All new features MUST include Stagehand E2E tests before being considered complete

**CRITICAL**: Never use `--no-verify` for git commits.

## E2E Testing Requirements

**CRITICAL**: All new features MUST include Stagehand E2E tests to verify the feature works end-to-end.

### When to Add E2E Tests

| Scenario                  | E2E Tests Required       |
| ------------------------- | ------------------------ |
| New user-facing feature   | Yes                      |
| New page or route         | Yes                      |
| New form or workflow      | Yes                      |
| Bug fix affecting UI      | Yes                      |
| Internal refactoring only | No                       |
| Backend-only changes      | No (unless affecting UI) |

### E2E Test Checklist

Before a feature is considered complete:

- [ ] Happy path tested (user can complete the main flow)
- [ ] Error states tested (invalid inputs, API errors)
- [ ] Edge cases tested (empty states, long inputs)
- [ ] Tests pass locally: `bun run test:e2e:stagehand`

### Writing E2E Tests

1. Create test file: `e2e/stagehand/tests/{feature}/{feature}.test.ts`
2. Use natural language for Stagehand actions
3. Validate with Zod schemas for extracted data
4. See [`e2e/stagehand/CLAUDE.md`](e2e/stagehand/CLAUDE.md) for detailed instructions

### Example

```typescript
import { Stagehand } from '@browserbasehq/stagehand'
import { z } from 'zod'

test('should create new project', async () => {
  await stagehand.act('Click the "New Project" button')
  await stagehand.act('Type "My Project" in the project name field')
  await stagehand.act('Click the submit button')

  const result = await stagehand.extract(
    'Check if project was created successfully',
    z.object({ success: z.boolean() })
  )

  expect(result.success).toBe(true)
})
```
