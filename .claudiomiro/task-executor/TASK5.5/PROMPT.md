## PROMPT
Create comprehensive CLAUDE.md documentation for the backend package. Document all infrastructure, scripts, and setup instructions.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack and conventions

**Review created files from TASK5.1-5.4 before documenting.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/CLAUDE.md`

### Documentation Structure

```markdown
# Backend Package

## Purpose
Backend service for VibeWork monorepo...

## Tech Stack
- Runtime: Bun
- Framework: ElysiaJS
- MySQL ORM: Drizzle
- MongoDB ODM: Typegoose
- Cache: Redis (ioredis)
- Messaging: Google Pub/Sub
- i18n: i18next

## Directory Structure
```
backend/
├── src/
│   ├── index.ts          # Entry point
│   ├── app.ts            # Elysia app configuration
│   ├── routes/           # API route handlers
│   └── i18n/             # Internationalization
├── infra/
│   ├── database/         # MySQL & MongoDB connections
│   ├── cache.ts          # Redis client
│   └── pubsub.ts         # Pub/Sub client
└── modules/              # Feature modules (future)
```

## Scripts
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run test` - Run unit tests
- `bun run lint` - Lint code

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| MYSQL_HOST | MySQL host | localhost |
| ... | ... | ... |

## API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /healthz | Liveness probe |
| GET | /readyz | Readiness probe |
| GET | /swagger | API documentation |

## Development Setup
1. Copy `.env.example` to `.env`
2. Start infrastructure: `docker-compose up -d`
3. Install dependencies: `bun install`
4. Start server: `bun run dev`
```

## LAYER
2

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- No actual secrets in documentation
- Reference .env.example for variables
- Keep concise
