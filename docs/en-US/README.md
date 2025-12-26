# VibeWork Monorepo Documentation

Welcome to the comprehensive documentation for VibeWork - a production-ready, VIBE Code compliant monorepo with a modular monolith backend and React frontend.

## Quick Navigation

### Getting Started

- **[Getting Started Guide](./getting-started.md)** - Quick start guide for local development
- **[Architecture Overview](./architecture.md)** - Understanding the system design and data flows

### Backend Documentation

- **[Backend Guide](./backend/)** - Complete backend documentation
  - [Backend Setup](./backend/setup.md) - Installation and configuration
  - [API Reference](./backend/api-reference.md) - All API endpoints
  - [Modules](./backend/modules.md) - Users and Notifications modules
  - [Database](./backend/database.md) - Schema, migrations, ORM setup
  - [Infrastructure](./backend/infrastructure.md) - Redis, Pub/Sub, Email services
  - [Testing](./backend/testing.md) - Unit and integration tests

### Frontend Documentation

- **[Frontend Guide](./frontend/)** - Complete frontend documentation
  - [Frontend Setup](./frontend/setup.md) - Installation and development setup
  - [Components](./frontend/components.md) - UI components and patterns
  - [State Management](./frontend/state-management.md) - TanStack Query setup
  - [Internationalization](./frontend/internationalization.md) - i18n configuration
  - [Testing](./frontend/testing.md) - Testing strategies and examples

### Shared Packages

- **[Contract Package](./shared/contract.md)** - TypeBox schemas for end-to-end type safety
- **[UI Components](./shared/ui-components.md)** - Shared UI component library

### Infrastructure & Deployment

- **[Infrastructure Guide](./infrastructure.md)** - Services, Docker Compose, GCP setup
- **[Deployment Guide](./deployment.md)** - Production deployment procedures
- **[Contributing Guide](./contributing.md)** - Code quality, conventions, git workflow

## Project Overview

VibeWork is a **production-ready full-stack application** featuring:

- **Backend**: Modular monolith using Bun + ElysiaJS with type-safe Eden RPC
- **Frontend**: React SPA with TanStack Query for server state management
- **Type Safety**: End-to-end type safety via TypeBox schemas
- **Databases**: MySQL (users) + MongoDB (notifications) with ORM/ODM
- **Caching**: Redis for performance optimization
- **Events**: Google Cloud Pub/Sub for async messaging
- **Email**: AWS SES integration for notifications
- **Auth**: Better-Auth for secure authentication
- **Internationalization**: Full i18n support (en, pt-BR)
- **Testing**: Vitest + Testcontainers + Playwright
- **Infrastructure**: Docker Compose (local) + Terraform (GCP)

## Tech Stack Summary

| Layer           | Technology                 | Purpose                      |
| --------------- | -------------------------- | ---------------------------- |
| **Runtime**     | Bun 1.2.8                  | Fast JavaScript runtime      |
| **Backend**     | ElysiaJS                   | Type-safe REST API framework |
| **Frontend**    | React 18 + Vite            | Single Page Application      |
| **SQL DB**      | MySQL 8.0 + Drizzle        | User data and sessions       |
| **Document DB** | MongoDB 6.0 + Typegoose    | Notifications storage        |
| **Cache**       | Redis 7.0                  | Performance caching          |
| **Events**      | Google Cloud Pub/Sub       | Async event messaging        |
| **Email**       | AWS SES                    | Email delivery               |
| **Auth**        | Better-Auth                | Authentication & sessions    |
| **API Client**  | Eden RPC                   | Type-safe frontend API       |
| **State Mgmt**  | TanStack Query 5           | Server state management      |
| **Monorepo**    | Turborepo + Bun Workspaces | Build orchestration          |
| **Testing**     | Vitest + Playwright        | Unit & E2E testing           |
| **i18n**        | i18next                    | Multi-language support       |

## Repository Structure

```
VibeWork/
├── backend/                    # ElysiaJS API backend
│   ├── src/
│   │   ├── app.ts             # Elysia app configuration
│   │   ├── routes/            # API endpoints
│   │   ├── infra/             # Infrastructure layer
│   │   └── i18n/              # Translations
│   ├── modules/
│   │   ├── users/             # Auth & user management
│   │   └── notifications/     # Notification system
│   └── CLAUDE.md              # Backend documentation
├── frontend/                   # React + Vite application
│   ├── src/
│   │   ├── features/          # Feature modules
│   │   ├── lib/               # API client & utilities
│   │   └── i18n/              # Translations
│   └── CLAUDE.md              # Frontend documentation
├── shared/
│   └── contract/              # Shared TypeBox schemas
├── infra/                     # Terraform IaC (GCP)
├── e2e/                       # Playwright tests
├── docs/                      # Documentation (this directory)
├── docker-compose.yml         # Local development services
└── CLAUDE.md                  # Root project documentation
```

## Key Concepts

### Modular Monolith Architecture

The backend is organized as a modular monolith with feature modules (users, notifications) that can be extracted into microservices independently.

### Type-Safe RPC

The frontend uses Eden RPC client with TypeBox schemas from the contract package, providing compile-time type safety for all API calls.

### Event-Driven Architecture

Notifications and async operations use Google Cloud Pub/Sub with async subscribers for decoupled processing.

### Database Strategy

- **MySQL**: User data, sessions, and relational data (via Drizzle ORM)
- **MongoDB**: Notifications and flexible documents (via Typegoose)
- **Redis**: Caching layer only (not message queue)

## Common Commands

```bash
# Development
bun install              # Install dependencies
docker-compose up -d     # Start local services
bun run db:migrate       # Run database migrations
bun run dev              # Start all dev servers

# Testing
bun run test             # Run unit tests
bun run test:integration # Run integration tests
bun run test:e2e         # Run E2E tests
bun run test:coverage    # Generate coverage reports

# Code Quality
bun run lint             # Run ESLint
bun run lint:fix         # Auto-fix linting issues
bun run typecheck        # TypeScript type checking
bun run format           # Format with Prettier

# Building
bun run build            # Build all packages
bun run clean            # Clean build artifacts

# Infrastructure
bun run infra:lint       # Validate Terraform
bun run infra:plan       # Plan Terraform changes
```

## Development Environment

### Requirements

- **Bun 1.0+** - JavaScript runtime and package manager
- **Docker & Docker Compose** - For local services
- **Node.js 18+** (optional) - For compatibility
- **Git** - Version control

### Local Services (Docker Compose)

- **MySQL 8.0** - User database (port 3306)
- **MongoDB 6.0** - Notifications database (port 27017)
- **Redis 7.0** - Cache (port 6379)
- **Google Pub/Sub Emulator** - Event messaging (port 8085)

See [Getting Started Guide](./getting-started.md) for detailed setup instructions.

## Documentation Structure

This documentation is organized by audience:

- **[Backend Documentation](./backend/)** - For backend engineers
- **[Frontend Documentation](./frontend/)** - For frontend engineers
- **[Shared Packages](./shared/)** - For full-stack developers
- **[Infrastructure](./infrastructure.md)** - For DevOps/infrastructure engineers
- **[Deployment](./deployment.md)** - For release & deployment
- **[Contributing](./contributing.md)** - For all contributors

## Additional Resources

- **Root CLAUDE.md** - Original project documentation
- **Module CLAUDE.md Files** - Detailed module documentation:
  - `backend/CLAUDE.md` - Backend overview
  - `frontend/CLAUDE.md` - Frontend overview
  - `backend/modules/users/CLAUDE.md` - Authentication
  - `backend/modules/notifications/CLAUDE.md` - Notifications
  - `shared/contract/CLAUDE.md` - Contract schemas
- **Configuration Files**:
  - `.env.example` - Environment variables
  - `docker-compose.yml` - Local development
  - `turbo.json` - Build pipeline
  - `.releaserc.js` - Semantic versioning

## Getting Help

- Check the relevant guide in the documentation
- Review existing CLAUDE.md files for detailed information
- Check GitHub issues for known problems
- Review test files for usage examples
- See [Contributing Guide](./contributing.md) for communication channels

## Version Information

- **Runtime**: Bun 1.2.8+
- **Node**: 18+ (optional, for compatibility)
- **TypeScript**: 5.0+
- **React**: 18.2+
- **ElysiaJS**: Latest

---

**Last Updated**: December 2024
**Documentation Version**: 1.0
**Project Status**: Production-Ready
