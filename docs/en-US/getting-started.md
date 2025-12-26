# Getting Started

This guide will help you set up your development environment and start working with VibeWork.

## Prerequisites

Before you begin, make sure you have installed:

- **Bun 1.0+** - [Installation guide](https://bun.sh)
- **Docker & Docker Compose** - [Installation guide](https://docs.docker.com/get-docker/)
- **Git** - For version control
- **A code editor** - VS Code, WebStorm, or similar

### Verify Installation

```bash
bun --version
docker --version
docker-compose --version
git --version
```

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/VibeWork.git
cd VibeWork
```

## Step 2: Install Dependencies

```bash
# Install all workspace dependencies
bun install
```

This command uses Bun workspaces to install dependencies for:

- Root workspace
- `/backend` package
- `/frontend` package
- `/shared/contract`
- `/e2e/playwright`
- `/e2e/stagehand`

## Step 3: Configure Environment Variables

### Create `.env` file

Copy the example environment file:

```bash
cp .env.example .env
```

### Edit `.env`

Update the environment variables for your setup:

```env
# Backend Server
PORT=3000
NODE_ENV=development

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_secure_password_here
MYSQL_DATABASE=vibe_db

# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017/vibe_notifications

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Google Pub/Sub (local development with emulator)
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local

# Email Configuration (AWS SES)
AWS_REGION=us-east-1
AWS_SES_FROM_ADDRESS=noreply@example.com

# Better-Auth Configuration
AUTH_SECRET=your_secret_key_here
# Generate with: openssl rand -base64 32

# Frontend Configuration
VITE_API_URL=http://localhost:3000
```

## Step 4: Start Local Services

```bash
# Start MySQL, MongoDB, Redis, and Pub/Sub Emulator
docker-compose up -d
```

Verify services are running:

```bash
# Check running containers
docker-compose ps

# You should see:
# - mysql (port 3306)
# - mongodb (port 27017)
# - redis (port 6379)
# - pubsub (port 8085)
```

## Step 5: Initialize Database

### Run Database Migrations

```bash
cd backend
bun run db:migrate
bun run db:seed  # Optional: populate with sample data
```

This creates the necessary tables in MySQL.

## Step 6: Start Development Servers

You can start all development servers at once:

```bash
# From root directory
bun run dev
```

This command (via Turborepo) starts:

- **Backend**: http://localhost:3000
  - API: http://localhost:3000/api
  - Swagger Docs: http://localhost:3000/swagger
  - Health Check: http://localhost:3000/healthz
- **Frontend**: http://localhost:5173
  - Application: http://localhost:5173

Or start them individually:

```bash
# Terminal 1: Backend
cd backend && bun run dev

# Terminal 2: Frontend
cd frontend && bun run dev
```

## Step 7: Verify Installation

### Backend Health Check

```bash
curl http://localhost:3000/healthz
# Expected response: {"status": "ok"}
```

### Frontend Access

Open your browser and navigate to:

- **Frontend**: http://localhost:5173

### API Documentation

View the interactive Swagger documentation:

- **Swagger UI**: http://localhost:3000/swagger

## First Time Usage

### 1. Create an Account

1. Open http://localhost:5173
2. Click "Sign Up"
3. Enter email and password
4. Submit the form

### 2. Verify Authentication

1. The account should be created
2. You should be logged in automatically
3. You'll see the dashboard or home page

### 3. Test API Directly

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword"}'

# Get session
curl http://localhost:3000/api/auth/session

# Sign out
curl -X POST http://localhost:3000/api/auth/sign-out
```

## Common Tasks

### View Logs

```bash
# Backend logs
docker-compose logs -f mysql

# Frontend logs - check terminal where `bun run dev` is running
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

### Reset Database

```bash
# Stop services and remove volumes
docker-compose down -v

# Restart services
docker-compose up -d

# Run migrations again
cd backend && bun run db:migrate
```

### Access Databases Directly

```bash
# MySQL
docker-compose exec mysql mysql -u root -p vibe_db
# Enter password from .env

# MongoDB
docker-compose exec mongodb mongosh vibe_notifications

# Redis
docker-compose exec redis redis-cli
```

## Running Tests

### Unit Tests

```bash
# Backend unit tests
cd backend && bun run test

# Watch mode
cd backend && bun run test:watch

# With coverage
cd backend && bun run test:coverage
```

### Integration Tests

```bash
# Requires Docker and running services
cd backend && bun run test:integration
```

### E2E Tests

```bash
# Frontend E2E tests with Playwright
bun run test:e2e

# Run in headed mode (see browser)
bun run test:e2e:headed

# Debug mode
bun run test:e2e:debug
```

## Code Quality

### Linting

```bash
# Check for issues
bun run lint

# Auto-fix issues
bun run lint:fix
```

### Type Checking

```bash
# Check TypeScript types
bun run typecheck
```

### Code Formatting

```bash
# Check formatting
bun run format:check

# Auto-format code
bun run format
```

## Building for Production

```bash
# Build all packages
bun run build

# Output will be in:
# - backend/dist/
# - frontend/dist/
```

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

Or change the port in your `.env`:

```env
PORT=3001  # Use different port
```

### Database Connection Issues

```bash
# Check if MySQL is running
docker-compose ps mysql

# Check MySQL logs
docker-compose logs mysql

# Verify connection string in .env
# Default: localhost:3306 (not 127.0.0.1)
```

### Dependencies Installation Issues

```bash
# Clear cache and reinstall
rm -rf node_modules .bun
bun install

# Or use Bun's built-in reset
bun install --force
```

### Module Not Found Errors

```bash
# Ensure all workspaces were installed
bun install

# Rebuild workspace packages
bun run build:deps
```

### Environment Variables Not Loading

1. Ensure `.env` file exists in root directory
2. Restart dev servers after changing `.env`
3. Check file permissions

## Next Steps

Once setup is complete:

1. **[Read Architecture Overview](./architecture.md)** - Understand the system design
2. **[Backend Documentation](./backend/)** - Learn backend structure
3. **[Frontend Documentation](./frontend/)** - Learn frontend setup
4. **[API Reference](./backend/api-reference.md)** - Explore available endpoints
5. **[Contributing Guide](./contributing.md)** - Learn contribution workflow

## Need Help?

- Check the [Architecture Overview](./architecture.md) for system design
- Review [Backend Setup](./backend/setup.md) for backend-specific configuration
- Review [Frontend Setup](./frontend/setup.md) for frontend-specific setup
- Check CLAUDE.md files in each package for detailed documentation
- Review test files for usage examples

---

**Last Updated**: December 2024
