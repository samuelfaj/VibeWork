## PROMPT
Implement integration tests using Testcontainers for MySQL and MongoDB. Create tests for User module (signup, login) and Notification module (CRUD). Configure Vitest with 80% coverage threshold.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/vitest.config.ts`
- `/backend/vitest.integration.config.ts`
- `/backend/modules/users/__tests__/integration.test.ts`
- `/backend/modules/notifications/__tests__/integration.test.ts`

### Patterns to Follow

**Testcontainers setup:**
```typescript
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql'
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb'

let mysqlContainer: StartedMySqlContainer
let mongoContainer: StartedMongoDBContainer

beforeAll(async () => {
  mysqlContainer = await new MySqlContainer().start()
  mongoContainer = await new MongoDBContainer().start()

  // Set connection strings
  process.env.MYSQL_URL = mysqlContainer.getConnectionUri()
  process.env.MONGODB_URI = mongoContainer.getConnectionString()
}, 60000) // 60s timeout for container startup

afterAll(async () => {
  await mysqlContainer.stop()
  await mongoContainer.stop()
})
```

**Vitest coverage config:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
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
})
```

### Integration Points
- Tests User module from TASK6
- Tests Notification module from TASK7
- Uses Drizzle migrations for MySQL setup

## EXTRA DOCUMENTATION
- Testcontainers: https://node.testcontainers.org/
- Vitest: https://vitest.dev/

## LAYER
5

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Use random ports (Testcontainers default)
- 60s timeout for container startup
- Clean up containers in afterAll
- Verify with `bun run test:integration`
