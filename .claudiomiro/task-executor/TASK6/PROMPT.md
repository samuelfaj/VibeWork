## PROMPT
Implement the User module with Drizzle schema for MySQL, Better-Auth integration for email/password authentication, and API endpoints (signup, login, me). Include password hashing utilities with unit tests.

## COMPLEXITY
High

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/modules/users/schema/user.schema.ts`
- `/backend/modules/users/core/password.ts`
- `/backend/modules/users/core/__tests__/password.test.ts`
- `/backend/modules/users/services/user.service.ts`
- `/backend/modules/users/routes/auth.routes.ts`
- `/backend/modules/users/routes/user.routes.ts`
- `/backend/modules/users/index.ts`
- `/backend/infra/auth.ts`
- `/backend/drizzle.config.ts`
- `/backend/modules/users/CLAUDE.md`

### Patterns to Follow

**Drizzle schema (user.schema.ts):**
```typescript
import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
})
```

**Better-Auth config (auth.ts):**
```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './database/mysql'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'mysql' }),
  emailAndPassword: { enabled: true }
})
```

**Password utilities (password.ts):**
```typescript
import { hash, verify } from '@node-rs/argon2'

export async function hashPassword(password: string): Promise<string>
export async function verifyPassword(hash: string, password: string): Promise<boolean>
```

### Integration Points
- Uses schemas from `packages/contract`
- Integrates with ElysiaJS app from TASK5
- Migrations run via `bun run db:migrate`

## EXTRA DOCUMENTATION
- Better-Auth: https://www.better-auth.com/
- Drizzle migrations: https://orm.drizzle.team/docs/migrations

## LAYER
3

## PARALLELIZATION
Parallel with: [TASK7]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Email/password only (no OAuth)
- Use argon2 for password hashing
- Validate with contract schemas
- Include unit test for password.ts
- Run migration: `bunx drizzle-kit push`
