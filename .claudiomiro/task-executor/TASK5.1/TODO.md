Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.1/TASK.md` - Task-level context
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.1/PROMPT.md` - Task-specific patterns

---

## Implementation Plan

- [ ] **Step 1 — Create package.json**
  - **What to do:**
    - Create `/backend/package.json` with:
      - name: "@vibework/backend"
      - scripts: dev, build, test, lint
      - dependencies: elysia, @elysiajs/swagger, @elysiajs/cors, drizzle-orm, mysql2, mongoose, @typegoose/typegoose, reflect-metadata, ioredis, @google-cloud/pubsub, i18next
      - devDependencies: typescript, @types/node, vitest
  - **Touched:** CREATE `/backend/package.json`

- [ ] **Step 2 — Create tsconfig.json**
  - **What to do:**
    - Create `/backend/tsconfig.json` extending root config
    - Enable experimentalDecorators and emitDecoratorMetadata
    - Configure paths: @/* -> ./src/*, @infra/* -> ./infra/*
  - **Touched:** CREATE `/backend/tsconfig.json`

- [ ] **Step 3 — Create Elysia app**
  - **What to do:**
    - Create `/backend/src/app.ts`
    - Configure Swagger at /swagger
    - Configure CORS
    - Add global error handler
  - **Touched:** CREATE `/backend/src/app.ts`

- [ ] **Step 4 — Create entry point**
  - **What to do:**
    - Create `/backend/src/index.ts`
    - Start server on PORT (default 3000)
    - Register SIGTERM/SIGINT handlers
  - **Touched:** CREATE `/backend/src/index.ts`

- [ ] **Step 5 — Create unit test**
  - **What to do:**
    - Create `/backend/src/__tests__/app.test.ts`
    - Test app instance creation
    - Test swagger route registration
  - **Touched:** CREATE `/backend/src/__tests__/app.test.ts`

- [ ] **Step 6 — Install dependencies**
  - **Commands:**
    ```bash
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun install
    ```

- [ ] **Step 7 — Verify**
  - **Commands:**
    ```bash
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork && bun test backend/src --silent
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run tsc --noEmit
    ```

---

## Acceptance Criteria

- [ ] `/backend/package.json` exists with all dependencies
- [ ] `/backend/tsconfig.json` configured with decorators
- [ ] ElysiaJS app exports from `/backend/src/app.ts`
- [ ] Swagger UI accessible at `/swagger`
- [ ] Server starts on port 3000
- [ ] Graceful shutdown handlers registered
- [ ] Unit test passes
