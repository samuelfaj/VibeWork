# Research for TASK9.1

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.1/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.1/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

## Task Understanding Summary

Create Vite + React scaffold for `/frontend/` with package.json, tsconfig.json, vite.config.ts, index.html, and vite-env.d.ts. A minimal placeholder package.json already exists.

## Files Discovered to Read/Modify

### Existing Files (MODIFY)

- `/frontend/package.json:1-5` - Placeholder exists with wrong name `@vibe-code/frontend` (should be `@vibe/frontend`), needs full content

### Files to Create

- `/frontend/tsconfig.json` - New file
- `/frontend/vite.config.ts` - New file
- `/frontend/index.html` - New file
- `/frontend/src/vite-env.d.ts` - New file (requires creating `/frontend/src/` directory)

## Code Patterns

### Workspace Naming Convention

- Contract: `@vibe-code/contract` in `/packages/contract/package.json:2`
- UI: `@vibe/ui` in `/packages/ui/package.json:2`
- Backend: `@vibe-code/backend` in `/backend/package.json:2`
- **Inconsistency found:** PROMPT.md specifies `@vibe/frontend` but other packages use `@vibe-code/` prefix. Using `@vibe/frontend` as per PROMPT.md.

### Workspace Dependencies

- Contract uses: `workspace:*` protocol is standard per PROMPT.md
- UI package: Uses `peerDependencies` for React (`^18.0.0`) at `/packages/ui/package.json:6-9`

### TypeScript Config Pattern

- Root extends pattern: `"extends": "../../tsconfig.json"` at `/packages/contract/tsconfig.json:2`
- Root base config at `/tsconfig.json:1-14`:
  - Target: ES2022, Module: ESNext, moduleResolution: bundler
  - strict: true, skipLibCheck: true
- UI tsconfig already has JSX: `/packages/ui/tsconfig.json:4` uses `"jsx": "react-jsx"`

### Scripts Convention

- Contract package: `"typecheck": "tsc --noEmit"`, `"test": "vitest run"` at `/packages/contract/package.json:15-17`
- Root turbo tasks: build, test, lint, typecheck, dev at `/turbo.json:4-30`

## Integration & Impact Analysis

### Workspace Dependencies Being Used:

- `@vibe/contract`: Defined at `/packages/contract/package.json` - exports TypeBox schemas
- `@vibe/ui`: Defined at `/packages/ui/package.json` - shared React components

### Workspace Configuration:

- Root `/package.json:6-11` defines workspaces: `["backend", "frontend", "packages/*", "e2e"]`
- `frontend` is already a valid workspace location

### Breaking Changes: NO

- This is a new scaffold - no existing code to break
- Only modifying placeholder package.json

## Test Strategy Discovered

- Testing framework: Vitest (from root `/package.json:39`)
- Contract example: `"test": "vitest run"` at `/packages/contract/package.json:17`
- No frontend tests in this task - just scaffold setup

## Risks & Challenges Identified

1. **Package Name Inconsistency**
   - PROMPT.md says `@vibe/frontend`
   - Other packages use `@vibe-code/` prefix
   - Decision: Follow PROMPT.md (`@vibe/frontend`)

2. **React/React-DOM Version Alignment**
   - PROMPT.md: `^18.2.0`
   - UI peerDeps: `^18.0.0`
   - Both compatible, using `^18.2.0` as specified

3. **Missing src directory**
   - `/frontend/src/` does not exist
   - Need to create before adding `vite-env.d.ts`

4. **Bun Install Verification**
   - Constraint: Must verify with `bun install` in frontend directory
   - After creating all files, run install to validate

## Execution Strategy

1. **Step 1:** Overwrite `/frontend/package.json` with full content
   - Name: `@vibe/frontend`, private, type: module
   - All dependencies from PROMPT.md
   - Scripts: dev, build, preview, typecheck, lint

2. **Step 2:** Create `/frontend/tsconfig.json`
   - Extend root config
   - Add jsx: preserve for Vite
   - Add path alias `@/*` → `./src/*`

3. **Step 3:** Create `/frontend/vite.config.ts`
   - React plugin, path alias, proxy config
   - Port 5173, proxy /api → localhost:3000

4. **Step 4:** Create `/frontend/index.html`
   - Standard Vite HTML entry
   - Script src: /src/main.tsx

5. **Step 5:** Create `/frontend/src/vite-env.d.ts`
   - Vite types reference

6. **Step 6:** Verify with `bun install` in frontend directory
