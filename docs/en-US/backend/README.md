# Backend Documentation

The VibeWork backend is a modular monolith built with Bun and ElysiaJS. This section covers all aspects of backend development.

## Quick Navigation

- **[Backend Setup](./setup.md)** - Installation and configuration
- **[API Reference](./api-reference.md)** - All API endpoints
- **[Modules](./modules.md)** - Users and Notifications modules
- **[Database](./database.md)** - Schema, ORM, migrations
- **[Infrastructure](./infrastructure.md)** - Redis, Pub/Sub, Email
- **[Testing](./testing.md)** - Unit and integration tests

## Overview

The backend provides:

- REST API endpoints for the frontend
- User authentication and management
- Notification system with email delivery
- Database schemas and migrations
- Infrastructure services (cache, events, email)
- Comprehensive testing coverage

## Architecture

```
backend/
├── src/
│   ├── index.ts              # Server entry point
│   ├── app.ts                # Elysia app configuration
│   ├── routes/               # API route definitions
│   │   ├── health.ts         # Health check endpoints
│   │   └── __tests__/
│   ├── infra/                # Infrastructure layer
│   │   ├── index.ts
│   │   ├── cache.ts          # Redis client
│   │   ├── pubsub.ts         # Pub/Sub client
│   │   ├── auth.ts           # Better-Auth config
│   │   └── database/         # MySQL, MongoDB
│   ├── i18n/                 # Translations
│   │   ├── index.ts
│   │   └── locales/          # Translation files
│   └── __tests__/            # Integration tests
├── modules/
│   ├── users/                # Authentication & users
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schema/
│   │   └── CLAUDE.md
│   └── notifications/        # Notifications system
│       ├── routes/
│       ├── services/
│       ├── models/
│       └── CLAUDE.md
├── tests/                    # Test utilities
├── dist/                     # Build output
├── package.json
├── tsconfig.json
├── vitest.config.ts          # Unit test config
├── vitest.integration.config.ts
├── drizzle.config.ts         # ORM config
├── Dockerfile                # Container config
└── CLAUDE.md                 # Original documentation
```

## Technology Stack

| Technology         | Purpose                   |
| ------------------ | ------------------------- |
| **Bun**            | JavaScript runtime        |
| **ElysiaJS**       | REST API framework        |
| **MySQL 8.0**      | Relational database       |
| **MongoDB 6.0**    | Document database         |
| **Drizzle ORM**    | MySQL ORM                 |
| **Mongoose**       | MongoDB connector         |
| **Typegoose**      | MongoDB TypeScript models |
| **Redis 7.0**      | Caching layer             |
| **Google Pub/Sub** | Event messaging           |
| **AWS SES**        | Email delivery            |
| **Better-Auth**    | Authentication            |
| **i18next**        | Internationalization      |
| **Vitest**         | Testing framework         |
| **Testcontainers** | Integration testing       |

## Key Features

### 1. Type-Safe API

- ElysiaJS with TypeBox schemas
- Automatic validation on all routes
- Swagger documentation auto-generated
- Type inference for consumers

### 2. Authentication

- Session-based with HTTP-only cookies
- Argon2id password hashing
- Multiple auth methods (email/password, OAuth)
- Automatic session validation

### 3. Modular Architecture

- Feature modules (users, notifications)
- Clear separation of concerns
- Extractable to microservices
- Shared infrastructure layer

### 4. Database Support

- **MySQL**: User data, sessions, relational data
- **MongoDB**: Notifications, flexible documents
- **Redis**: Application caching
- Connection pooling and optimization

### 5. Event-Driven

- Google Cloud Pub/Sub for async events
- Decoupled components
- Subscription handlers
- Email notifications via SES

### 6. Internationalization

- Full i18n support (en, pt-BR)
- Error messages translated
- Locale detection from headers

## Common Tasks

### Setup Development Environment

```bash
cd backend
bun install
docker-compose up -d
bun run db:migrate
bun run dev
```

### Run Tests

```bash
bun run test           # Unit tests
bun run test:integration  # Integration tests
bun run test:coverage  # Coverage report
```

### Build for Production

```bash
bun run build          # Creates dist/
docker build -t backend:latest .  # Docker image
```

### View API Documentation

```
http://localhost:3000/swagger
```

### Check Health

```bash
curl http://localhost:3000/healthz
curl http://localhost:3000/readyz
```

## Directory Structure Explained

### `/src` - Source Code

**`app.ts`**

- Elysia app configuration
- Middleware setup (CORS, error handling, i18n)
- Route registration
- Swagger documentation

**`routes/`**

- HTTP route handlers
- Health check endpoints
- Module route registration

**`infra/`**

- Database connections
- Cache initialization
- Authentication setup
- Event bus configuration

**`i18n/`**

- Translation configuration
- Message files (en, pt-BR)
- Translation functions

### `/modules` - Feature Modules

**`users/`**

- Authentication system
- User profiles
- Session management
- Better-Auth integration

**`notifications/`**

- Notification CRUD
- Email delivery
- Pub/Sub integration
- Status tracking

## Configuration

### Environment Variables

See [Backend Setup](./setup.md) for all configuration options.

### Database Migrations

```bash
# Create migration
bun run db:create-migration <name>

# Run migrations
bun run db:migrate

# Rollback
bun run db:rollback
```

### Redis Configuration

```env
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=vibe:
```

### Pub/Sub Configuration

```env
PUBSUB_EMULATOR_HOST=localhost:8085  # Local
GOOGLE_CLOUD_PROJECT=vibe-local
```

## API Endpoints

### Authentication

- `POST /api/auth/sign-up/email` - Create account
- `POST /api/auth/sign-in/email` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get session

### Users

- `GET /api/users/me` - Current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/:id` - User profile (public)

### Notifications

- `POST /api/notifications` - Create notification
- `GET /api/notifications` - List user notifications
- `GET /api/notifications/:id` - Get notification
- `PATCH /api/notifications/:id` - Update notification
- `PATCH /api/notifications/:id/read` - Mark as read

### Health

- `GET /healthz` - Liveness probe
- `GET /readyz` - Readiness probe
- `GET /swagger` - API documentation

See [API Reference](./api-reference.md) for detailed documentation.

## Testing Strategy

### Unit Tests

- Test individual functions and services
- Mock external dependencies
- Fast execution
- High coverage expected

### Integration Tests

- Test with real databases (Testcontainers)
- Test API routes end-to-end
- Slower but more realistic
- Critical paths covered

### E2E Tests

- Test from frontend perspective
- Full system testing
- Located in `/e2e` workspace
- See [E2E Testing](./testing.md)

See [Testing Guide](./testing.md) for details.

## Development Workflow

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Add code in appropriate module
   - Write tests alongside code
   - Follow code style conventions

3. **Test Locally**

   ```bash
   bun run test
   bun run test:integration
   bun run lint
   bun run typecheck
   ```

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat(module): description"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/my-feature
   ```

See [Contributing Guide](../contributing.md) for details.

## Debugging

### Enable Debug Logging

```bash
# In .env
DEBUG=vibe:*
```

### Debug in VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "runtimeExecutable": "bun",
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

### View Database

```bash
# MySQL
docker-compose exec mysql mysql -u root -p vibe_db

# MongoDB
docker-compose exec mongodb mongosh vibe_notifications

# Redis
docker-compose exec redis redis-cli
```

## Performance Optimization

### Database

- Connection pooling
- Query optimization with indexes
- Caching frequently accessed data
- Pagination for large result sets

### Caching

- Redis for expensive queries
- Invalidation on data updates
- TTL-based expiration

### API

- Response compression
- Efficient serialization
- Pagination for large lists
- Rate limiting at reverse proxy

## Monitoring in Production

### Health Checks

- `/healthz` - Liveness (is server running?)
- `/readyz` - Readiness (can handle traffic?)

These endpoints should be probed by orchestration systems.

### Logging

- Structure logs as JSON
- Include request IDs for tracing
- Log errors with stack traces
- Configurable log levels

### Metrics

- Request rate and latency
- Error rates by endpoint
- Database connection pool usage
- Cache hit/miss rates

## Deployment

See [Infrastructure Guide](../infrastructure.md) and [Deployment Guide](../deployment.md) for:

- Docker containerization
- GCP Cloud Run deployment
- Database setup
- Environment configuration

## Documentation References

- **Original**: `backend/CLAUDE.md`
- **Modules**:
  - `backend/modules/users/CLAUDE.md` - Authentication
  - `backend/modules/notifications/CLAUDE.md` - Notifications

## Getting Help

- [Backend Setup](./setup.md) - Configuration issues
- [API Reference](./api-reference.md) - Endpoint details
- [Testing Guide](./testing.md) - Test examples
- [Architecture Overview](../architecture.md) - System design
- CLAUDE.md files in each module for detailed documentation

---

**Last Updated**: December 2024
