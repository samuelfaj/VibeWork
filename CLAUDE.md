# VIBE Code Monorepo

Production-ready monorepo with modular monolith backend and React frontend.

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
| E2E      | Playwright                    | End-to-end tests         |

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

## Project Structure

```
/
├── backend/                    # ElysiaJS backend service
│   ├── src/                    # Entry point, app config, routes
│   ├── modules/
│   │   ├── users/              # User auth (MySQL/Drizzle/Better-Auth)
│   │   └── notifications/      # Notifications (MongoDB/Pub/Sub)
│   ├── infra/                  # DB connections, cache, pubsub
│   └── CLAUDE.md               # Backend documentation
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── features/           # Feature modules (auth, etc.)
│   │   ├── i18n/               # Internationalization
│   │   └── lib/                # Eden client, query config
│   └── CLAUDE.md               # Frontend documentation
├── packages/
│   ├── contract/               # Shared TypeBox schemas
│   │   └── CLAUDE.md           # Contract documentation
│   └── ui/                     # Shared UI components
├── infra/                      # Terraform IaC (GCP)
├── e2e/                        # Playwright E2E tests
├── docker-compose.yml          # Local development services
├── turbo.json                  # Turborepo pipeline config
└── CLAUDE.md                   # This file
```

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

| Command                    | Description                        |
| -------------------------- | ---------------------------------- |
| `bun install`              | Install all workspace dependencies |
| `docker-compose up -d`     | Start local infrastructure         |
| `bun run dev`              | Start all dev servers (Turborepo)  |
| `bun run build`            | Build all packages                 |
| `bun run test`             | Run unit tests                     |
| `bun run test:integration` | Run integration tests              |
| `bun run test:e2e`         | Run Playwright E2E tests           |
| `bun run lint`             | Run ESLint on all packages         |
| `bun run lint:fix`         | Auto-fix ESLint issues             |
| `bun run typecheck`        | TypeScript type checking           |
| `bun run format`           | Format code with Prettier          |

## Package Documentation

Each package has its own CLAUDE.md with detailed documentation:

- [`backend/CLAUDE.md`](backend/CLAUDE.md) - Backend API, routes, infrastructure
- [`frontend/CLAUDE.md`](frontend/CLAUDE.md) - Frontend features, components
- [`packages/contract/CLAUDE.md`](packages/contract/CLAUDE.md) - Shared schemas
- [`backend/modules/users/CLAUDE.md`](backend/modules/users/CLAUDE.md) - User authentication
- [`backend/modules/notifications/CLAUDE.md`](backend/modules/notifications/CLAUDE.md) - Notification system

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
2. **Redis = Cache Only**: Use Google Pub/Sub for event messaging, not Redis
3. **Type-Safe RPC**: Eden provides compile-time type safety between frontend and backend
4. **i18n Everywhere**: Both frontend and backend support internationalization (en, pt-BR)
5. **Test Coverage**: 80% threshold enforced
