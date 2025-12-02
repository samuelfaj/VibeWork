## PROMPT
Create the backend package structure with package.json, tsconfig.json, and the core ElysiaJS application with Swagger documentation. This is the foundation for all other backend infrastructure.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/package.json`
- `/backend/tsconfig.json`
- `/backend/src/app.ts`
- `/backend/src/index.ts`
- `/backend/src/__tests__/app.test.ts`

### Patterns to Follow

**Elysia app setup (app.ts):**
```typescript
import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

export const app = new Elysia()
  .use(cors())
  .use(swagger({
    path: '/swagger',
    documentation: {
      info: {
        title: 'VibeWork API',
        version: '1.0.0'
      }
    }
  }))
  .onError(({ error, code }) => {
    console.error(`[backend] Error: ${code}`, error)
    return { error: 'Internal Server Error' }
  })
```

**Entry point (index.ts):**
```typescript
import { app } from './app'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`[backend] Starting server on port ${PORT}`)
})

const shutdown = async () => {
  console.log('[backend] Graceful shutdown initiated')
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
```

## LAYER
2

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Use Bun as runtime
- All config via environment variables
- Swagger at /swagger path
