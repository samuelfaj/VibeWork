@dependencies [TASK3, TASK4]
@scope frontend

# Task: Vite + React Project Scaffold with Configuration

## Summary
Initialize the frontend package with Vite, React, TypeScript configuration, and workspace dependencies.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions

**Task-Specific Context:**
- Creates `/frontend/` directory structure
- Sets up Vite with React plugin
- Configures TypeScript with path aliases
- Adds workspace dependencies to contract and ui packages

## Complexity
Medium

## Dependencies
Depends on: [TASK3, TASK4]
Blocks: [TASK9.3, TASK9.4, TASK9.5]
Parallel with: [TASK9.2]

## Detailed Steps
1. Create `/frontend/package.json`:
   - Name: `@vibe/frontend`
   - Scripts: `dev`, `build`, `preview`, `typecheck`, `lint`
   - Dependencies: `react`, `react-dom`, `@elysiajs/eden`, `@tanstack/react-query`, `react-i18next`, `i18next`, `i18next-browser-languagedetector`
   - DevDependencies: `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`
   - Workspace: `@vibe/contract`, `@vibe/ui`

2. Create `/frontend/tsconfig.json`:
   - Strict mode enabled
   - JSX preserve for Vite
   - Path alias `@/*` → `./src/*`

3. Create `/frontend/vite.config.ts`:
   - React plugin
   - Path alias resolution
   - Dev server proxy `/api` → `http://localhost:3000`
   - Port 5173

4. Create `/frontend/index.html` with root div

5. Create `/frontend/src/vite-env.d.ts`

## Acceptance Criteria
- [ ] `/frontend/package.json` has correct dependencies and scripts
- [ ] `/frontend/tsconfig.json` has strict mode and path aliases
- [ ] `/frontend/vite.config.ts` has React plugin and proxy config
- [ ] `/frontend/index.html` exists with root mount point
- [ ] `bun install` succeeds in frontend directory

## Code Review Checklist
- [ ] Package versions are compatible
- [ ] Path aliases match between tsconfig and vite.config
- [ ] Workspace dependencies use workspace: protocol
