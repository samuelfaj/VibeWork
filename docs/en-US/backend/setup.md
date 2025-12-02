# Backend Setup Guide

Complete guide to setting up the backend development environment.

## Prerequisites

- Bun 1.0+
- Docker & Docker Compose
- MySQL 8.0+ (via Docker)
- MongoDB 6.0+ (via Docker)
- Redis 7.0+ (via Docker)
- Google Cloud SDK (for production)
- AWS CLI (for SES email)

## Step 1: Install Bun

```bash
curl -fsSL https://bun.sh/install | bash
bun --version  # Should be 1.0+
```

## Step 2: Clone and Install

```bash
git clone <repo-url> VibeWork
cd VibeWork
bun install
```

## Step 3: Configure Environment

Create `.env` file from template:

```bash
cp .env.example .env
```

### MySQL Configuration

```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_secure_password_here
MYSQL_DATABASE=vibe_db

# Connection Pool
MYSQL_POOL_MAX_CONNECTIONS=10
MYSQL_POOL_IDLE_TIMEOUT_MS=30000
```

**Details:**

- **MYSQL_HOST**: Database host (localhost for local Docker)
- **MYSQL_PORT**: Default 3306
- **MYSQL_USER**: Root user for local development
- **MYSQL_PASSWORD**: Set in docker-compose.yml
- **MYSQL_DATABASE**: Database name
- **Connection pooling**: Configurable for performance

### MongoDB Configuration

```env
MONGODB_URL=mongodb://localhost:27017/vibe_notifications
MONGODB_CONNECTION_POOL_SIZE=10
```

**Details:**

- **MONGODB_URL**: Connection string
- **Database**: Auto-created if doesn't exist
- **Connection pooling**: Included in connection string

### Redis Configuration

```env
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=vibe:
REDIS_TTL_SECONDS=3600
```

**Details:**

- **REDIS_URL**: Redis connection
- **Key prefix**: Namespace for keys
- **TTL**: Default expiration time

### Authentication Configuration

```env
AUTH_SECRET=your_secret_key_here
# Generate: openssl rand -base64 32

AUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback/[provider]
AUTH_TRUST_HOST=true
```

**Details:**

- **AUTH_SECRET**: Secure random key for sessions
- **Generate**: `openssl rand -base64 32`
- **CALLBACK_URL**: OAuth redirect URI
- **TRUST_HOST**: Allow localhost in development

### Email Configuration (AWS SES)

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SES_FROM_ADDRESS=noreply@example.com

# Optional: Use IAM role instead of credentials
AWS_ROLE_ARN=arn:aws:iam::account:role/service-role
```

**Details:**

- **AWS_REGION**: SES region
- **Credentials**: IAM user with SES permissions
- **FROM_ADDRESS**: Verified sender email
- **For production**: Use IAM roles, not keys

### Google Cloud Configuration

```env
# Local Development (Pub/Sub Emulator)
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local

# Production (GCP)
GOOGLE_CLOUD_PROJECT=your-gcp-project
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

**Details:**

- **Emulator**: Local testing without GCP
- **Project**: GCP project ID
- **Credentials**: Service account JSON file

### Server Configuration

```env
# Application
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=info
DEBUG=vibe:*
```

**Details:**

- **PORT**: Server port (3000 by default)
- **NODE_ENV**: development, staging, production
- **CORS**: Frontend origin
- **LOG_LEVEL**: info, debug, warn, error
- **DEBUG**: Namespace filter for logs

### Internationalization

```env
# Default locale and supported languages
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=en,pt-BR
```

## Step 4: Start Local Services

Start all required services:

```bash
# From root directory
docker-compose up -d

# Verify services
docker-compose ps
```

Expected output:

```
NAME         STATUS
mysql        Up 3 seconds
mongodb      Up 3 seconds
redis        Up 3 seconds
pubsub       Up 3 seconds
```

### Service Ports

| Service | Port  | URL             |
| ------- | ----- | --------------- |
| MySQL   | 3306  | localhost:3306  |
| MongoDB | 27017 | localhost:27017 |
| Redis   | 6379  | localhost:6379  |
| Pub/Sub | 8085  | localhost:8085  |

### Verify Connections

```bash
# MySQL
docker-compose exec mysql mysql -u root -p vibe_db -e "SELECT 1;"

# MongoDB
docker-compose exec mongodb mongosh vibe_notifications --eval "db.version()"

# Redis
docker-compose exec redis redis-cli ping
# Expected: PONG

# Pub/Sub
curl http://localhost:8085/v1/projects/vibe-local
```

## Step 5: Database Initialization

### Run Migrations

```bash
cd backend
bun run db:migrate
```

This creates all tables in MySQL:

- `users` - User accounts
- `sessions` - Active sessions
- Other auth tables

### Seed Database (Optional)

```bash
bun run db:seed
```

Creates sample data for development.

### View Schema

```bash
# Export current schema
bun run db:export-schema

# View in MySQL
docker-compose exec mysql mysql -u root -p vibe_db
```

## Step 6: Start Backend Server

```bash
cd backend
bun run dev
```

Expected output:

```
⚡ Start (PID 12345)
  🔥 HTTP server running at http://localhost:3000
  📝 Swagger: http://localhost:3000/swagger
```

### Verify Server is Running

```bash
# Health check
curl http://localhost:3000/healthz
# {"status":"ok"}

# Readiness check
curl http://localhost:3000/readyz
# {"status":"ready"}

# API docs
open http://localhost:3000/swagger
```

## Development Commands

### Testing

```bash
# Unit tests
bun run test

# Watch mode
bun run test:watch

# Coverage
bun run test:coverage

# Integration tests (requires Docker)
bun run test:integration
```

### Code Quality

```bash
# Linting
bun run lint
bun run lint:fix

# Type checking
bun run typecheck

# Formatting
bun run format
bun run format:check
```

### Database Operations

```bash
# Create migration
bun run db:create-migration <name>

# Run migrations
bun run db:migrate

# Rollback last migration
bun run db:rollback

# Reset database
bun run db:reset

# View schema
bun run db:export-schema
```

### Build and Deployment

```bash
# Development build
bun run build

# Production build
bun run build:prod

# Docker image
docker build -t vibe-backend:latest -f backend/Dockerfile .

# Run in Docker
docker run -p 3000:3000 vibe-backend:latest
```

## Common Issues and Solutions

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 bun run dev
```

### Database Connection Errors

```bash
# Check if MySQL is running
docker-compose logs mysql

# Check connection string
# Ensure MYSQL_HOST is 'localhost' not '127.0.0.1'
echo $MYSQL_HOST

# Test connection
docker-compose exec mysql mysql -u root -p -h localhost
```

### Redis Connection Errors

```bash
# Check Redis is running
docker-compose logs redis

# Test connection
redis-cli ping

# Check REDIS_URL format
# Should be: redis://localhost:6379
```

### Module Not Found

```bash
# Rebuild workspace packages
bun install --force

# Clear node_modules
rm -rf node_modules
bun install
```

### Type Errors

```bash
# Run type checking
bun run typecheck

# Clear TypeScript cache
rm -rf dist

# Rebuild
bun run build
```

### Pub/Sub Emulator Not Starting

```bash
# Ensure port 8085 is free
lsof -i :8085

# Check docker-compose logs
docker-compose logs pubsub

# Restart emulator
docker-compose restart pubsub
```

## IDE Setup

### VS Code

**Recommended Extensions:**

- Bun for VSCode
- Thunder Client (REST testing)
- MongoDB for VS Code
- MySQL
- Prettier
- ESLint

**Launch Configuration** (`.vscode/launch.json`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend Debug",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["run"],
      "cwd": "${workspaceFolder}/backend",
      "console": "integratedTerminal",
      "env": {
        "DEBUG": "vibe:*",
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### WebStorm/IntelliJ IDEA

1. Set Project SDK to Bun
2. Configure run configuration:
   - Working directory: `backend/`
   - Script: `src/index.ts`
   - Interpreter: Bun

## Environment File Checklist

- [ ] `.env` file created
- [ ] MYSQL credentials configured
- [ ] MONGODB_URL set
- [ ] REDIS_URL set
- [ ] AUTH_SECRET generated
- [ ] AWS_REGION and SES address set (can be test values)
- [ ] PUBSUB_EMULATOR_HOST configured
- [ ] PORT and CORS_ORIGIN set

## Troubleshooting Checklist

- [ ] Bun installed and up to date
- [ ] Docker services running (`docker-compose ps`)
- [ ] All services responding to health checks
- [ ] .env file in root directory
- [ ] Database migrations run successfully
- [ ] Server starts without errors
- [ ] API endpoints responding (Swagger: http://localhost:3000/swagger)

## Next Steps

1. **Understand Architecture**: Read [Architecture Overview](../architecture.md)
2. **Learn API Structure**: Read [API Reference](./api-reference.md)
3. **Explore Modules**: Read [Modules Guide](./modules.md)
4. **Run Tests**: `bun run test`
5. **Make a Change**: Create feature branch and modify something
6. **Start Frontend**: `cd frontend && bun run dev`

## Production Setup

For production deployment, see:

- [Infrastructure Guide](../infrastructure.md)
- [Deployment Guide](../deployment.md)

These cover:

- GCP Cloud SQL setup
- Cloud Run deployment
- Environment configuration
- Security considerations
- Monitoring setup

---

**Last Updated**: December 2024
