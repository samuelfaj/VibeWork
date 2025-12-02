## PROMPT
Create root CLAUDE.md documentation with project overview, architecture, quick start guide, and verify all package-level CLAUDE.md files are consistent and complete.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/CLAUDE.md`

### Files to Verify Exist
- `/backend/CLAUDE.md`
- `/frontend/CLAUDE.md`
- `/packages/contract/CLAUDE.md`
- `/backend/modules/users/CLAUDE.md`
- `/backend/modules/notifications/CLAUDE.md`

### Root CLAUDE.md Structure

```markdown
# VIBE Code Monorepo

## Overview
Production-ready monorepo with modular monolith backend and React frontend.

## Tech Stack
- Runtime: Bun
- Backend: ElysiaJS + Eden
- Databases: MySQL (Drizzle), MongoDB (Typegoose)
- Cache: Redis
- Events: Google Pub/Sub
- Frontend: React + Vite + TanStack Query

## Architecture
[High-level description]

## Quick Start
```bash
bun install
docker-compose up -d
bun run dev
```

## Project Structure
[Directory overview]

## Common Commands
- `bun run dev` - Start development
- `bun run build` - Build all packages
- `bun run test` - Run tests
- `bun run lint` - Lint code
```

## EXTRA DOCUMENTATION
None.

## LAYER
6

## PARALLELIZATION
Parallel with: [TASK12]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Test all documented commands
- Ensure cross-references are accurate
- Keep consistent format across all CLAUDE.md files
