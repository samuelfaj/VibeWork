# VibeWork

> A production-ready, VIBE Code compliant monorepo with a modular monolith backend (Bun + ElysiaJS) and React frontend, featuring User (MySQL/Drizzle) and Notification (MongoDB/Typegoose) modules, with comprehensive testing, internationalization, and GCP-focused infrastructure.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Bun](https://img.shields.io/badge/Bun-1.2.8%2B-orange)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

![VibeWork](https://github.com/samuelfaj/vibework/blob/main/docs/assets/logo.png?raw=true)

## 📚 Documentation

Comprehensive documentation available in multiple languages:

### English

- **[Complete Documentation](./docs/en-US/)** - Full English documentation
  - [Getting Started](./docs/en-US/getting-started.md)
  - [Architecture Overview](./docs/en-US/architecture.md)
  - [Backend Guide](./docs/en-US/backend/)
  - [Frontend Guide](./docs/en-US/frontend/)
  - [Infrastructure Guide](./docs/en-US/infrastructure.md)
  - [Deployment Guide](./docs/en-US/deployment.md)
  - [Contributing Guide](./docs/en-US/contributing.md)

### Português (Brasil)

- **[Documentação Completa](./docs/pt-BR/)** - Documentação em português
  - [Primeiros Passos](./docs/pt-BR/getting-started.md)
  - [Visão Geral da Arquitetura](./docs/pt-BR/architecture.md)
  - [Guia do Backend](./docs/en-US/backend/) (em inglês, veja en-US)
  - [Guia do Frontend](./docs/en-US/frontend/) (em inglês, veja en-US)
  - [Guia de Infraestrutura](./docs/en-US/infrastructure.md) (em inglês, veja en-US)
  - [Guia de Deployment](./docs/en-US/deployment.md) (em inglês, veja en-US)
  - [Guia de Contribuição](./docs/en-US/contributing.md) (em inglês, veja en-US)

## 🚀 Quick Start

### Prerequisites

- Bun 1.0+ ([Install](https://bun.sh))
- Docker & Docker Compose ([Install](https://docker.com))
- Git

### Setup (5 minutes)

```bash
# 1. Clone repository
git clone <repository-url>
cd VibeWork

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Edit .env with your settings

# 4. Start services
docker-compose up -d

# 5. Run migrations
cd backend && bun run db:migrate

# 6. Start development servers
cd .. && bun run dev
```

Open:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/swagger

See [Getting Started Guide](./docs/en-US/getting-started.md) for detailed setup.

## 🏗️ Project Structure

```
VibeWork/
├── backend/                    # ElysiaJS API backend
├── frontend/                   # React SPA
├── packages/
│   ├── contract/              # Shared TypeBox schemas
│   └── ui/                    # Shared UI components
├── infra/                     # Terraform IaC (GCP)
├── e2e/                       # Playwright tests
├── docs/                      # Documentation
│   ├── en-US/                 # English docs
│   └── pt-BR/                 # Portuguese docs
└── docker-compose.yml         # Local dev services
```

## 🛠️ Tech Stack

| Layer           | Technology              | Purpose                  |
| --------------- | ----------------------- | ------------------------ |
| **Runtime**     | Bun 1.2.8               | Fast JavaScript runtime  |
| **Backend**     | ElysiaJS                | Type-safe REST API       |
| **Frontend**    | React 18 + Vite         | Modern SPA               |
| **SQL DB**      | MySQL 8.0 + Drizzle     | Relational data          |
| **Document DB** | MongoDB 6.0 + Typegoose | Document storage         |
| **Cache**       | Redis 7.0               | Performance caching      |
| **Events**      | Google Cloud Pub/Sub    | Async messaging          |
| **Email**       | AWS SES                 | Email delivery           |
| **Auth**        | Better-Auth             | Authentication           |
| **RPC**         | Eden                    | Type-safe API calls      |
| **State Mgmt**  | TanStack Query          | Server state             |
| **i18n**        | i18next                 | Localization (en, pt-BR) |
| **Testing**     | Vitest + Playwright     | Unit & E2E tests         |
| **Monorepo**    | Turborepo + Bun         | Build orchestration      |

## 📖 Key Features

- **Type-Safe End-to-End**: TypeBox schemas used by frontend and backend
- **Modular Monolith**: Backend architecture ready for microservice extraction
- **Event-Driven**: Pub/Sub for async operations
- **Multi-Language**: Built-in support for English and Portuguese
- **Comprehensive Testing**: Unit, integration, and E2E tests
- **Production-Ready**: Database backups, monitoring, zero-downtime deployment
- **Infrastructure as Code**: Terraform for GCP infrastructure

## 🔧 Common Commands

```bash
# Development
bun install                    # Install dependencies
docker-compose up -d           # Start services
bun run dev                    # Start all dev servers
bun run db:migrate             # Run database migrations

# Testing
bun run test                   # Unit tests
bun run test:integration       # Integration tests
bun run test:e2e               # E2E tests
bun run test:coverage          # Coverage report

# Code Quality
bun run lint                   # Check linting
bun run lint:fix               # Auto-fix linting
bun run typecheck              # TypeScript check
bun run format                 # Format code

# Building
bun run build                  # Build all packages
bun run clean                  # Clean artifacts
```

See [CLAUDE.md](./CLAUDE.md) for detailed command reference.

## 📚 Documentation Map

### Getting Started

- **[Setup Guide (English)](./docs/en-US/getting-started.md)** - Environment configuration
- **[Guia de Início (Português)](./docs/pt-BR/getting-started.md)** - Configuração em português
- **[Architecture Overview (English)](./docs/en-US/architecture.md)** - System design and data flows
- **[Visão Geral da Arquitetura (Português)](./docs/pt-BR/architecture.md)** - Design do sistema

### Backend (English)

- **[Backend Setup](./docs/en-US/backend/setup.md)** - Installation and configuration
- **[API Reference](./docs/en-US/backend/api-reference.md)** - Complete endpoint documentation
- **[Modules Guide](./docs/en-US/backend/modules.md)** - Users & Notifications architecture
- **[Database Guide](./docs/en-US/backend/database.md)** - MySQL, MongoDB, schemas & migrations
- **[Infrastructure](./docs/en-US/backend/infrastructure.md)** - Redis, Pub/Sub, SES, health checks
- **[Testing Guide](./docs/en-US/backend/testing.md)** - Unit, integration tests

### Frontend (English)

- **[Frontend Setup](./docs/en-US/frontend/setup.md)** - Development environment
- **[Components Guide](./docs/en-US/frontend/components.md)** - React components & patterns
- **[State Management](./docs/en-US/frontend/state-management.md)** - TanStack Query guide
- **[Internationalization](./docs/en-US/frontend/internationalization.md)** - i18n configuration
- **[Testing Guide](./docs/en-US/frontend/testing.md)** - Component & E2E tests

### Shared Packages (English)

- **[Contract Package](./docs/en-US/shared/contract.md)** - TypeBox schemas & validation
- **[UI Components](./docs/en-US/shared/ui-components.md)** - Component library

### Infrastructure & Deployment (English)

- **[Infrastructure Guide](./docs/en-US/infrastructure.md)** - Docker, GCP, services
- **[Deployment Guide](./docs/en-US/deployment.md)** - Production deployment & CI/CD
- **[Contributing Guide](./docs/en-US/contributing.md)** - Code standards & workflow

### Original Module Documentation (CLAUDE.md)

- **[backend/CLAUDE.md](./backend/CLAUDE.md)** - Backend overview & commands
- **[frontend/CLAUDE.md](./frontend/CLAUDE.md)** - Frontend overview
- **[backend/modules/users/CLAUDE.md](./backend/modules/users/CLAUDE.md)** - Users & authentication
- **[backend/modules/notifications/CLAUDE.md](./backend/modules/notifications/CLAUDE.md)** - Notifications system
- **[packages/contract/CLAUDE.md](./packages/contract/CLAUDE.md)** - Shared contracts

## 🎯 Architecture

```
┌────────────────────────────┐
│  Frontend (React + Vite)   │
│  TanStack Query + Eden RPC │
└──────────────┬─────────────┘
               │ HTTP/REST
┌──────────────▼─────────────┐
│ Backend (ElysiaJS + Bun)  │
│ ├── Users Module           │
│ └── Notifications Module   │
└──────────────┬─────────────┘
               │
    ┌──────────┼──────────┬────────────┐
    ▼          ▼          ▼            ▼
  MySQL    MongoDB     Redis       Pub/Sub
  (Data)   (Docs)     (Cache)    (Events)
```

## 🔐 Security

- Passwords hashed with Argon2id (OWASP recommended)
- HTTP-only session cookies
- Input validation on all endpoints
- HTTPS/TLS in production
- Rate limiting at reverse proxy
- Environment variables for secrets

## 📊 Testing Coverage

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **E2E Tests**: User workflows covered
- **Performance**: Monitoring and alerts configured

## 🌍 Internationalization

- **English** (en) - Default
- **Portuguese (Brazil)** (pt-BR) - Fully translated
- Easy to add more languages via i18n

## 🚀 Deployment

### Development

```bash
docker-compose up -d
bun run dev
```

### Staging

```bash
gcloud run deploy vibe-backend-staging \
  --image gcr.io/project/vibe-backend:staging
```

### Production

```bash
gcloud run deploy vibe-backend \
  --image gcr.io/project/vibe-backend:latest \
  --region us-central1
```

See [Deployment Guide](./docs/en-US/deployment.md) for details.

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "feat: description"`
4. Push to branch: `git push origin feature/my-feature`
5. Create Pull Request

See [Contributing Guide](./docs/en-US/contributing.md) for conventions.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Support

### English

- Check [documentation](./docs/en-US/)
- Review existing [issues](https://github.com/yourorg/VibeWork/issues)
- Start [discussion](https://github.com/yourorg/VibeWork/discussions)
- See [CLAUDE.md](./CLAUDE.md) for original project documentation

### Português (Brasil)

- Consulte a [documentação](./docs/pt-BR/)
- Revise [problemas existentes](https://github.com/yourorg/VibeWork/issues)
- Inicie uma [discussão](https://github.com/yourorg/VibeWork/discussions)
- Veja [CLAUDE.md](./CLAUDE.md) para documentação original do projeto

## 🔗 Resources

- **[Bun Documentation](https://bun.sh)** - JavaScript runtime
- **[ElysiaJS Documentation](https://elysiajs.com)** - Backend framework
- **[React Documentation](https://react.dev)** - Frontend framework
- **[TanStack Query](https://tanstack.com/query)** - State management
- **[TypeBox](https://sinclairzx81.github.io/typebox/)** - Schema validation
- **[Drizzle ORM](https://orm.drizzle.team)** - SQL ORM
- **[Typegoose](https://typegoose.github.io)** - MongoDB ODM
- **[i18next](https://www.i18next.com)** - Localization

## 🌐 Supported Languages

- 🇬🇧 **English** - Full documentation available
- 🇧🇷 **Português (Brasil)** - Partial documentation (getting started, architecture)
- More languages can be easily added via i18n

## 👥 Authors

Built with VibeWork framework and VIBE Code standards.

---

**Status**: Production-Ready ✅
**Version**: 1.0.0
**Last Updated**: December 2024
**License**: MIT

### Quick Links

- 🚀 [Quick Start](#-quick-start)
- 📚 [English Docs](./docs/en-US/) | [Portuguese Docs](./docs/pt-BR/)
- 🤝 [Contributing](./docs/en-US/contributing.md)
- 📖 [Full Documentation Map](#-documentation-map)
- 🏗️ [Architecture Overview](./docs/en-US/architecture.md)

**Get started in 5 minutes**: Follow the [Quick Start](#-quick-start) section above!
