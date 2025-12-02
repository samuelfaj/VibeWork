@dependencies []
@scope backend

# Task: Initialize Root Monorepo Foundation

## Summary
Set up the foundational monorepo structure with Bun workspaces and Turborepo configuration. This is the prerequisite for all other tasks as it establishes the workspace configuration that all packages depend on.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates root `/package.json` with Bun workspaces configuration
- Creates `/turbo.json` with pipeline definitions for build, test, lint, typecheck
- Establishes the workspace structure: `backend/*`, `frontend/*`, `packages/*`

## Complexity
Medium

## Dependencies
Depends on: []
Blocks: [TASK1, TASK2, TASK3, TASK4, TASK5, TASK6, TASK7, TASK8, TASK9, TASK10, TASK11, TASK12, TASK13, TASK14, TASK15]
Parallel with: []

## Detailed Steps
1. Create root `package.json` with:
   - Name: `vibe-code-monorepo`
   - Workspaces: `["backend", "frontend", "packages/*", "e2e"]`
   - Scripts: dev, build, test, lint, typecheck, test:integration, test:e2e
   - Shared devDependencies: typescript, vitest, eslint, prettier

2. Create `turbo.json` with pipelines:
   - `build`: outputs `["dist/**"]`, dependsOn `["^build"]`
   - `test`: no outputs
   - `lint`: no outputs
   - `typecheck`: no outputs, dependsOn `["^build"]`
   - `test:integration`: no outputs
   - `test:e2e`: no outputs

3. Create root `tsconfig.json` with base configuration:
   - Strict mode enabled
   - ES2022 target for Bun compatibility
   - Module resolution: bundler

## Acceptance Criteria
- [ ] Root `package.json` exists with Bun workspaces configured
- [ ] `turbo.json` defines build, test, lint, typecheck pipelines
- [ ] Root `tsconfig.json` provides base configuration
- [ ] `bun install` succeeds (even with no packages yet)
- [ ] `bunx turbo run build --dry-run` shows pipeline structure

## Code Review Checklist
- [ ] Workspace paths match project structure
- [ ] Pipeline dependencies are correctly ordered
- [ ] TypeScript config uses ES2022 for Bun
- [ ] No hardcoded versions (use latest stable)

## Reasoning Trace
Starting with root configuration ensures all subsequent packages can be added incrementally without restructuring. Turborepo pipelines define the build graph upfront, enabling efficient caching and parallel execution later. Base tsconfig avoids duplication across packages.
