# Research for TASK5.1

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.1/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.1/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

---

## Task Understanding Summary

Create backend package structure with package.json, tsconfig.json, and core ElysiaJS app with Swagger. This is the foundation for all other backend infrastructure (blocks TASK5.2-5.5).

---

## Files Discovered to Read/Modify

### Existing Files to Reference (NOT in PROMPT.md)

- `/packages/contract/package.json` - Pattern for workspace package structure
- `/packages/contract/tsconfig.json` - Pattern for extending root tsconfig
- `/frontend/package.json` - Pattern for workspace package with scripts
- `/root/tsconfig.json` - Base config to extend

### Current Backend State

- `/backend/package.json` - **EXISTS but minimal** (only name, version, private)
- `/backend/Dockerfile` - **EXISTS** (multi-stage Bun build)
- No `tsconfig.json`, no `src/` directory yet

---

## Similar Components Found (LEARN FROM THESE)

### 1. Contract Package - `/packages/contract/package.json`

**Why similar:** Same workspace package pattern
**Patterns to reuse:**

- `"type": "module"` for ES modules
- Build script: `bun build ./src/index.ts --outdir ./dist --target bun`
- TypeScript emit: `tsc --emitDeclarationOnly`
- Scripts structure: build, typecheck, test
  **Key learnings:**
- Bun build targets Bun runtime
- Separate tsc for declaration files only

### 2. Contract tsconfig - `/packages/contract/tsconfig.json`

**Why similar:** Workspace package extending root

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Adaptation needed:** Backend needs:

- `experimentalDecorators: true` (Typegoose)
- `emitDecoratorMetadata: true` (Typegoose)
- Path aliases: `@/*` -> `./src/*`, `@infra/*` -> `./infra/*`

### 3. Frontend Vite Config - `/frontend/vite.config.ts:18-24`

**Why relevant:** Shows backend proxy at port 3000

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
},
```

**Learning:** Backend must start on port 3000

### 4. Contract Test Pattern - `/packages/contract/src/__tests__/user.test.ts`

**Why similar:** Vitest test structure

```typescript
import { describe, it, expect } from 'vitest'
import { Value } from '@sinclair/typebox/value'
// ... test implementation
```

**Learning:** Use `describe/it/expect` pattern with Vitest

---

## Reusable Components (USE THESE, DON'T RECREATE)

### 1. Root tsconfig.json - `/tsconfig.json`

**Purpose:** Base TypeScript configuration
**How to use:** Extend in backend tsconfig

```json
{
  "extends": "../tsconfig.json"
  // add backend-specific options
}
```

### 2. Elysia Types from Contract - `/packages/contract/src/index.ts`

**Purpose:** TypeBox schemas already defined
**How to use:**

```typescript
import { SignupSchema, LoginSchema } from '@vibe-code/contract'
```

**Integration:** Backend routes will use these schemas for validation

### 3. Vitest Configuration Pattern

**Purpose:** Testing framework already configured at root
**Usage:** Backend tests will use root vitest config or extend it

---

## Codebase Conventions Discovered

### Package Naming

- Workspace packages: `@vibe-code/backend`, `@vibe-code/contract`
- Or: `@vibe/frontend`, `@vibe/ui` (alternate pattern)
- **Use:** `@vibework/backend` per TODO.md

### Script Naming

- `dev` - Development server
- `build` - Production build
- `test` - Unit tests
- `typecheck` - TypeScript check (`tsc --noEmit`)
- `lint` - ESLint

### File Organization (from contract package)

```
package/
├── src/
│   ├── index.ts       # Main exports
│   └── __tests__/     # Test files
├── package.json
└── tsconfig.json
```

### Import/Export Style

- ES Modules (`"type": "module"`)
- Named exports preferred
- Barrel file at `src/index.ts`

### Error Handling Pattern (from PROMPT.md)

```typescript
.onError(({ error, code }) => {
  console.error(`[backend] Error: ${code}`, error)
  return { error: 'Internal Server Error' }
})
```

---

## Integration & Impact Analysis

### Upstream Dependencies

1. **Root workspace** - Backend must be registered in root `package.json` workspaces
   - Already registered: `"workspaces": ["backend", "frontend", "packages/*", "e2e"]`
   - **No changes needed**

2. **Root tsconfig.json** - Must be extendable
   - Current config is generic enough
   - **No changes needed**

### Downstream Consumers

1. **Frontend Eden Client** - `/frontend/package.json`
   - Will consume backend types via Eden
   - **Must match port 3000**
   - **Must export app type for Eden inference**

2. **Docker Compose** - `/docker-compose.yml`
   - Backend expected on port 3000
   - Environment variables expected

3. **TASK5.2-5.5** - All depend on this task
   - Must export `app` from `/backend/src/app.ts`
   - Must have proper module structure

### API Integration

- Swagger UI at `/swagger` path
- Frontend proxies `/api` to `localhost:3000`

---

## Test Strategy Discovered

### Testing Framework

- **Framework:** Vitest
- **Test command:** `bun test` or `vitest run`
- **Config:** Uses root vitest.config or workspace config

### Test Patterns Found

- **Test file location:** `src/__tests__/*.test.ts`
- **Test structure:** `describe/it/expect`
- **Example from:** `/packages/contract/src/__tests__/user.test.ts`

### Mocking Approach

- TypeBox `Value.Check()` for schema validation tests
- For backend: Will need to test Elysia app instance

### Backend Test Pattern (from PROMPT.md requirements)

```typescript
// Test app instance creation
// Test swagger route registration
```

---

## Risks & Challenges Identified

### Technical Risks

1. **Decorator Configuration**
   - Impact: High (Typegoose won't work without it)
   - Mitigation: Enable `experimentalDecorators` and `emitDecoratorMetadata` in tsconfig

2. **Bun + Elysia Compatibility**
   - Impact: Low (well-documented stack)
   - Mitigation: Use latest stable versions

### Complexity Assessment

- Overall: **Low-Medium**
- Reasoning: Standard package setup following existing patterns

### Missing Information

- [ ] Exact versions for dependencies (will use `latest` or match contract package)

---

## Execution Strategy Recommendation

**Based on research findings, execute in this order:**

1. **Step 1 - Create package.json**
   - Follow pattern from: `/packages/contract/package.json`
   - Add all dependencies from TODO.md
   - Scripts: dev, build, test, lint, typecheck
   - Name: `@vibework/backend`

2. **Step 2 - Create tsconfig.json**
   - Extend: `../tsconfig.json`
   - Add decorator options for Typegoose
   - Add path aliases: `@/*`, `@infra/*`
   - Follow pattern from: `/packages/contract/tsconfig.json`

3. **Step 3 - Create app.ts**
   - Follow pattern from: PROMPT.md (Elysia setup)
   - Configure Swagger at `/swagger`
   - Configure CORS
   - Add global error handler

4. **Step 4 - Create index.ts**
   - Follow pattern from: PROMPT.md (entry point)
   - Start on PORT env var (default 3000)
   - Register SIGTERM/SIGINT handlers

5. **Step 5 - Create unit test**
   - Follow pattern from: `/packages/contract/src/__tests__/user.test.ts`
   - Test app instance creation
   - Test swagger route registration

6. **Step 6 - Install dependencies**
   - Run: `cd backend && bun install`

7. **Step 7 - Verify**
   - Run: `bun test backend/src`
   - Run: `cd backend && bun run tsc --noEmit`

---

**Research completed:** 2025-12-02
**Total similar components found:** 4
**Total reusable components identified:** 3
**Estimated complexity:** Low-Medium
