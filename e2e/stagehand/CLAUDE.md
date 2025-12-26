# E2E Stagehand Tests

AI-powered end-to-end tests using [@browserbasehq/stagehand](https://github.com/browserbase/stagehand) for intelligent browser automation.

## Overview

Stagehand uses AI (OpenAI gpt-5.2) to understand and interact with web pages using natural language instructions. This allows for more resilient tests that don't break with minor UI changes.

## Directory Structure

```
e2e/stagehand/
├── package.json           # Dependencies and scripts
├── vitest.config.ts       # Vitest test runner configuration
├── tsconfig.json          # TypeScript configuration
├── globalSetup.ts         # Pre-test service orchestration
├── .env.example           # Environment variables template
├── CLAUDE.md              # This documentation
├── helpers/
│   ├── stagehand.ts       # Stagehand initialization and utilities
│   ├── services.ts        # Service health checks
│   └── testData.ts        # Test user creation utilities
└── tests/
    └── auth/
        └── auth.test.ts   # Authentication tests
```

## Setup

### 1. Install Dependencies

```bash
cd e2e/stagehand
bun install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
APP_URL=http://localhost:5173
API_URL=http://localhost:3000
HEADLESS=true
```

### 3. Start Services

Ensure Docker services are running:

```bash
docker-compose up -d
```

## Running Tests

```bash
# Run all tests (headless)
bun run test

# Run tests with visible browser
HEADLESS=false bun run test:headed

# Run tests in watch mode
bun run test:watch

# Run from monorepo root
bun run test:e2e:stagehand
```

## Writing Tests

### Test Pattern

```typescript
import 'dotenv/config'
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { Stagehand } from '@browserbasehq/stagehand'
import { z } from 'zod'
import { APP_URL, createStagehand, delay } from '../../helpers/stagehand'

describe('Feature E2E Tests', () => {
  let stagehand: Stagehand

  beforeAll(async () => {
    stagehand = await createStagehand()
  })

  afterAll(async () => {
    await stagehand.close()
  })

  test('should do something', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(APP_URL)
    await delay(1500)

    // Use natural language actions
    await stagehand.act('Click the submit button')

    // Extract data with AI and validate with Zod
    const result = await stagehand.extract(
      'Check if the operation was successful',
      z.object({
        success: z.boolean(),
        message: z.string().optional(),
      })
    )

    expect(result.success).toBe(true)
  })
})
```

### Key Methods

#### `stagehand.act(instruction)`

Execute an action on the page using natural language:

```typescript
await stagehand.act('Type "user@example.com" in the email field')
await stagehand.act('Click the login button')
await stagehand.act('Select "United States" from the country dropdown')
```

#### `stagehand.extract(instruction, schema)`

Extract data from the page with AI validation:

```typescript
const result = await stagehand.extract(
  'Get the user profile information',
  z.object({
    name: z.string(),
    email: z.string(),
    isVerified: z.boolean(),
  })
)
```

#### `page.goto(url)`

Navigate to a URL:

```typescript
await page.goto(`${APP_URL}/dashboard`)
```

### Helper Functions

| Function                                  | Description                     |
| ----------------------------------------- | ------------------------------- |
| `createStagehand()`                       | Initialize Stagehand instance   |
| `delay(ms)`                               | Wait for specified milliseconds |
| `waitForElement(page, selector, timeout)` | Wait for element to appear      |
| `loginUser(stagehand, email, password)`   | Log in a user                   |
| `clearSession(stagehand)`                 | Clear cookies and storage       |
| `createTestUser()`                        | Create test user via API        |
| `generateTestUserData()`                  | Generate test user data         |

## Adding Tests for New Features

When adding a new feature to the application:

1. **Create test file**: `tests/{feature}/{feature}.test.ts`
2. **Test happy paths**: User can complete primary flows
3. **Test error states**: Invalid inputs, network errors
4. **Test edge cases**: Empty states, long inputs, etc.

### Example: Adding Dashboard Tests

```typescript
// tests/dashboard/dashboard.test.ts
import 'dotenv/config'
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { Stagehand } from '@browserbasehq/stagehand'
import { z } from 'zod'
import { APP_URL, createStagehand, loginUser, delay } from '../../helpers/stagehand'
import { createTestUser } from '../../helpers/testData'

describe('Dashboard E2E Tests', () => {
  let stagehand: Stagehand
  let testUser: { email: string; password: string }

  beforeAll(async () => {
    stagehand = await createStagehand()
    testUser = await createTestUser()
  })

  afterAll(async () => {
    await stagehand.close()
  })

  test('should display user dashboard after login', async () => {
    await loginUser(stagehand, testUser.email, testUser.password)
    await delay(2000)

    const result = await stagehand.extract(
      'Check if the dashboard is displayed with user information',
      z.object({
        hasDashboard: z.boolean(),
        hasUserInfo: z.boolean(),
      })
    )

    expect(result.hasDashboard).toBe(true)
  })
})
```

## Configuration

### Timeouts

- **Test timeout**: 120 seconds (AI operations take time)
- **Hook timeout**: 60 seconds
- **Element wait**: 30 seconds (default)

### Parallelization

- **Max forks**: 2 (limits Chrome instances)
- **Concurrency**: 1 per file (sequential within files)

## Troubleshooting

### Tests timing out

- Increase timeout in `vitest.config.ts`
- Add more `delay()` calls between actions
- Check if services are running

### AI actions failing

- Be more specific in instructions
- Use visible text rather than element IDs
- Add context about the current page state

### Services not starting

- Run `docker-compose up -d` manually
- Check `docker-compose logs` for errors
- Verify ports 3000 and 5173 are free

## Best Practices

1. **Use natural language**: Write instructions as you would tell a human
2. **Be specific**: "Click the blue Submit button" is better than "Click submit"
3. **Add delays**: AI needs time to process and act
4. **Use Zod schemas**: Validate extracted data structure
5. **Clear sessions**: Start each test with clean state
6. **Test error states**: Don't just test happy paths
