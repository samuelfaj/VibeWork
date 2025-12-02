# Backend Testing Guide

Comprehensive guide to testing backend code.

## Testing Strategy

VibeWork uses a three-level testing approach:

```
┌─────────────────────────────────────────┐
│         E2E Tests (Playwright)          │  Few, high-level
│      Full app from user perspective     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│    Integration Tests (Vitest + Docker)  │  Some, real dependencies
│     API routes with real databases      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│      Unit Tests (Vitest + Mocks)        │  Many, isolated
│         Functions & services            │
└─────────────────────────────────────────┘

Coverage Goal: 80%+
```

## Unit Tests

### Setup

**Test Runner:** Vitest
**Config:** `backend/vitest.config.ts`
**Location:** `**/__tests__/` directories

### Running Unit Tests

```bash
cd backend

# Run all unit tests
bun run test

# Watch mode (auto-rerun on changes)
bun run test:watch

# Run specific file
bun run test users/__tests__/service.test.ts

# Generate coverage report
bun run test:coverage

# Check coverage threshold (80%)
bun run test:coverage:check
```

### Test Structure

**File Pattern:** `*.test.ts` or `*.spec.ts`

```typescript
// modules/users/__tests__/service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userService } from '@/modules/users'

describe('userService', () => {
  describe('create', () => {
    it('should create a user with valid input', async () => {
      const user = await userService.create({
        email: 'test@example.com',
        password: 'securepassword123',
      })

      expect(user.id).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.passwordHash).toBeDefined()
      expect(user.passwordHash).not.toBe('securepassword123')
    })

    it('should throw error for duplicate email', async () => {
      await userService.create({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(async () => {
        await userService.create({
          email: 'test@example.com',
          password: 'password456',
        })
      }).rejects.toThrow('Email already exists')
    })

    it('should validate password strength', async () => {
      expect(async () => {
        await userService.create({
          email: 'test@example.com',
          password: '123',
        })
      }).rejects.toThrow('Password too weak')
    })
  })

  describe('findById', () => {
    it('should return user by id', async () => {
      const created = await userService.create({
        email: 'test@example.com',
        password: 'password123',
      })

      const found = await userService.findById(created.id)

      expect(found.id).toBe(created.id)
      expect(found.email).toBe('test@example.com')
    })

    it('should return null for non-existent user', async () => {
      const user = await userService.findById('non_existent')

      expect(user).toBeNull()
    })
  })
})
```

### Mocking

**Mock Functions:**

```typescript
import { vi } from 'vitest'

const mockDb = {
  insert: vi.fn(),
  query: vi.fn(),
  update: vi.fn(),
}

// Set return value
mockDb.insert.mockResolvedValue({ id: '123' })

// Verify was called
expect(mockDb.insert).toHaveBeenCalledWith({
  email: 'test@example.com',
})

// Check call count
expect(mockDb.insert).toHaveBeenCalledTimes(1)
```

**Mock Modules:**

```typescript
import { vi } from 'vitest'

vi.mock('@/infra/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}))
```

### Fixtures

**Setup & Teardown:**

```typescript
import { beforeEach, afterEach } from 'vitest'

describe('userService', () => {
  let testUser: any

  beforeEach(async () => {
    // Setup before each test
    testUser = await userService.create({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  afterEach(async () => {
    // Cleanup after each test
    await userService.delete(testUser.id)
  })

  it('should update user', async () => {
    await userService.update(testUser.id, {
      name: 'Updated Name',
    })

    const updated = await userService.findById(testUser.id)
    expect(updated.name).toBe('Updated Name')
  })
})
```

## Integration Tests

### Setup

**Test Runner:** Vitest
**Config:** `backend/vitest.integration.config.ts`
**Containers:** Testcontainers for MySQL, MongoDB

### Running Integration Tests

```bash
cd backend

# Run integration tests
bun run test:integration

# Watch mode
bun run test:integration:watch

# Specific test file
bun run test:integration modules/users/__tests__/integration.test.ts

# Coverage report
bun run test:integration:coverage
```

### Test Structure

**File Pattern:** `*.integration.test.ts`

```typescript
// modules/users/__tests__/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { MySQLContainer } from '@testcontainers/mysql'
import { startServices } from '@/tests/setup'
import { userService } from '@/modules/users'

describe('userService integration', () => {
  let container: MySQLContainer
  let services: any

  beforeAll(async () => {
    // Start MySQL container
    container = await new MySQLContainer({
      environment: {
        MYSQL_ROOT_PASSWORD: 'password',
        MYSQL_DATABASE: 'test_db',
      },
    }).start()

    // Initialize services with test database
    services = await startServices({
      mysqlUrl: container.getConnectionUri(),
    })

    // Run migrations
    await services.db.migrate()
  })

  afterAll(async () => {
    // Cleanup
    await container.stop()
  })

  it('should create and persist user', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      password: 'password123',
    })

    // Fetch from database directly
    const [found] = await services.db.query('SELECT * FROM users WHERE id = ?', [user.id])

    expect(found).toBeDefined()
    expect(found.email).toBe('test@example.com')
    expect(found.password_hash).not.toBe('password123') // Hashed
  })

  it('should handle concurrent user creation', async () => {
    const promises = Array(5)
      .fill(null)
      .map((_, i) =>
        userService.create({
          email: `user${i}@example.com`,
          password: 'password123',
        })
      )

    const results = await Promise.all(promises)

    expect(results).toHaveLength(5)
    expect(results.every((r) => r.id)).toBe(true)
  })
})
```

### Database Testing

**MySQL with Testcontainers:**

```typescript
import { MySQLContainer } from '@testcontainers/mysql'

const container = await new MySQLContainer({
  environment: {
    MYSQL_ROOT_PASSWORD: 'root',
    MYSQL_DATABASE: 'test_db',
  },
}).start()

const connection = await mysql.createConnection({
  host: container.getHost(),
  port: container.getPort(),
  user: 'root',
  password: 'root',
  database: 'test_db',
})
```

**MongoDB with Testcontainers:**

```typescript
import { MongoDBContainer } from '@testcontainers/mongodb'

const container = await new MongoDBContainer().start()

const connection = await mongoose.connect(container.getConnectionString())
```

## E2E Tests

### Setup

**Test Runner:** Playwright
**Location:** `/e2e` workspace
**Config:** `playwright.config.ts`

### Running E2E Tests

```bash
# Run all E2E tests (headless)
bun run test:e2e

# Run specific test
bun run test:e2e tests/auth.spec.ts

# Run in headed mode (see browser)
bun run test:e2e:headed

# Debug mode (step through)
bun run test:e2e:debug

# Generate test report
bun run test:e2e:report
```

### Test Examples

**Auth Flow Test:**

```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should sign up new user', async ({ page }) => {
    // Click signup link
    await page.click('text=Sign Up')

    // Fill form
    await page.fill('input[name=email]', 'newuser@example.com')
    await page.fill('input[name=password]', 'SecurePassword123!')

    // Submit
    await page.click('button[type=submit]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('should login existing user', async ({ page }) => {
    // Click login
    await page.click('text=Log In')

    // Fill credentials
    await page.fill('input[name=email]', 'user@example.com')
    await page.fill('input[name=password]', 'Password123!')

    // Submit
    await page.click('button[type=submit]')

    // Verify logged in
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should logout user', async ({ page }) => {
    // Login first
    await loginUser(page, 'user@example.com', 'Password123!')

    // Click logout
    await page.click('text=Logout')

    // Verify redirected
    await expect(page).toHaveURL(/\/login/)
  })
})

async function loginUser(page, email, password) {
  await page.click('text=Log In')
  await page.fill('input[name=email]', email)
  await page.fill('input[name=password]', password)
  await page.click('button[type=submit]')
  await page.waitForNavigation()
}
```

## Coverage Goals

### Target Coverage

- **Lines**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Statements**: 80%+

### Generate Coverage Report

```bash
bun run test:coverage

# HTML report
open coverage/index.html
```

### Critical Paths to Cover

**Must have tests:**

- Authentication flows (signup, login, logout)
- Authorization checks
- Error handling
- Database operations
- API endpoints
- Business logic

**Should have tests:**

- Edge cases
- Input validation
- Cache operations
- Pub/Sub messaging
- Email sending

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: test_db
          MYSQL_ROOT_PASSWORD: root

    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bun run test

      - name: Run integration tests
        run: bun run test:integration

      - name: Upload coverage
        run: bun run test:coverage

      - name: Run E2E tests
        run: bun run test:e2e
```

## Testing Best Practices

### Do's ✅

- **Test behavior, not implementation** - Focus on what, not how
- **Keep tests isolated** - No interdependencies between tests
- **Use descriptive names** - Clear what's being tested
- **Arrange-Act-Assert pattern** - Clear test structure
- **Mock external dependencies** - Focus on unit under test
- **Test error cases** - Not just happy paths
- **Use fixtures for common setup** - DRY principle
- **Keep tests fast** - Should run in seconds

### Don'ts ❌

- **Don't test frameworks** - Trust Elysia, Drizzle, etc.
- **Don't test third-party libraries** - Unless wrapping them
- **Don't use real services in tests** - Mock or containerize
- **Don't write tests that depend on test order** - Each test standalone
- **Don't ignore test failures** - Fix immediately
- **Don't test implementation details** - Test public API
- **Don't copy test code** - Create shared test utilities

## Common Testing Patterns

### Testing Routes

```typescript
import { app } from '@/app'

it('should create notification', async () => {
  const response = await app.handle(
    new Request('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'session=test_session_123',
      },
      body: JSON.stringify({
        title: 'Test',
        message: 'Test notification',
        type: 'email',
        userId: 'user_123',
      }),
    })
  )

  expect(response.status).toBe(201)
  const data = await response.json()
  expect(data.id).toBeDefined()
})
```

### Testing Services

```typescript
it('should call cache before database', async () => {
  const cache = { get: vi.fn().mockResolvedValue(null) }
  const db = { query: vi.fn().mockResolvedValue(user) }

  const user = await userService.findById('user_123', {
    cache,
    db,
  })

  expect(cache.get).toHaveBeenCalledWith('user:user_123')
  expect(db.query).toHaveBeenCalled()
})
```

## Debugging Tests

### View Test Output

```bash
# Verbose output
bun run test -- --reporter=verbose

# Show only failures
bun run test -- --reporter=verbose --reporter.mode=only-failed

# Debug specific test
bun run test -- --inspect-brk modules/users/__tests__/service.test.ts
```

### Debug in IDE

**VS Code:**
Create `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "bun",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal",
  "cwd": "${workspaceFolder}/backend"
}
```

## Next Steps

- **[Backend Setup](./setup.md)** - Configure environment
- **[API Reference](./api-reference.md)** - Test the APIs
- **[Database Guide](./database.md)** - Understand data models
- **[CI/CD Guide](../deployment.md)** - Automated testing

---

**Last Updated**: December 2024
