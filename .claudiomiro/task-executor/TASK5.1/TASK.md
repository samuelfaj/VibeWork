@dependencies [TASK0, TASK1]
@scope backend

# Task: Backend Package Initialization + Elysia App Core

## Summary
Create the backend package structure with package.json, tsconfig.json, and the core ElysiaJS application with Swagger documentation.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates `/backend/` package structure
- Sets up ElysiaJS with Swagger at `/swagger`
- Entry point with graceful shutdown handling

## Complexity
Medium

## Dependencies
Depends on: [TASK0, TASK1]
Blocks: [TASK5.2, TASK5.3, TASK5.4, TASK5.5]
Parallel with: []

## Detailed Steps
1. Create `/backend/package.json` with dependencies:
   - Runtime: `elysia`, `@elysiajs/swagger`, `@elysiajs/cors`
   - MySQL: `drizzle-orm`, `mysql2`
   - MongoDB: `mongoose`, `@typegoose/typegoose`, `reflect-metadata`
   - Cache: `ioredis`
   - Pub/Sub: `@google-cloud/pubsub`
   - i18n: `i18next`
   - Dev: `typescript`, `@types/node`, `vitest`

2. Create `/backend/tsconfig.json`:
   - `experimentalDecorators: true` (for Typegoose)
   - `emitDecoratorMetadata: true`
   - Paths: `@/*` -> `./src/*`, `@infra/*` -> `./infra/*`

3. Create `/backend/src/app.ts`:
   - Elysia app with Swagger plugin at `/swagger`
   - CORS configuration
   - Global error handler stub

4. Create `/backend/src/index.ts`:
   - Entry point that starts server on port 3000
   - Graceful shutdown handlers

5. Write unit test `/backend/src/__tests__/app.test.ts`

## Acceptance Criteria
- [ ] `/backend/package.json` exists with all dependencies
- [ ] `/backend/tsconfig.json` configured with decorators
- [ ] ElysiaJS app exports from `/backend/src/app.ts`
- [ ] Swagger UI accessible at `/swagger`
- [ ] Server starts on port 3000
- [ ] Graceful shutdown handlers registered
- [ ] Unit test passes

## Code Review Checklist
- [ ] All config via environment variables
- [ ] Error handling on startup failures
- [ ] Graceful shutdown handlers

## Reasoning Trace
Backend package initialization is the foundation. All other TASK5 subtasks depend on this core structure being in place.
