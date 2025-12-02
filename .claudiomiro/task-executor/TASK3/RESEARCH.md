# RESEARCH.md (Adapted from TASK0)

> This research was adapted from TASK0 (70% similar). Matching topics: api, database, testing, config, component, validation, logging.

# Research for TASK0

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK0/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK0/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

---

## Task Understanding Summary

Initialize root monorepo foundation with Bun workspaces and Turborepo. Create 3 configuration files (`package.json`, `turbo.json`, `tsconfig.json`) that serve as the base for all downstream tasks (TASK1-15).

---

## Current Codebase State

### Files at Root Level

- **NONE** - Repository is empty except for `.git/` and `.claudiomiro/`

### Files to Create

| File             | Status                                  |
| ---------------- | --------------------------------------- |
| `/package.json`  | CREATE - Root workspace configuration   |
| `/turbo.json`    | CREATE - Turborepo pipeline definitions |
| `/tsconfig.json` | CREATE - Base TypeScript configuration  |

### No Existing Patterns to Follow

This is a greenfield project. All patterns must be established from documentation and best practices.

---

## Documentation Findings

### Bun Workspaces (from https://bun.sh/docs/install/workspaces)

**Key Configuration:**

```json
{
  "workspaces": ["packages/*", "backend", "frontend", "e2e"]
}
```

**Best Practices:**

- Use `workspace:*` protocol for local package references
- Glob patterns supported including negation (`!packages/**/test/**`)
- Workspaces array accepts directory names and glob patterns

### Turborepo (from https://turborepo.com/repo/docs/reference/configuration)

**turbo.json Structure:**

```json
{
  "globalDependencies": [".env*", "tsconfig.json"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"],
      "cache": true
    },
    "test": {
      "cache": false
    }
  }
}
```

**Key Task Options:**

- `dependsOn`: Array of task dependencies
  - `"^build"` - wait for dependency packages' build
  - `"lint"` - same-package task dependency
- `outputs`: Glob patterns of files to cache
- `cache`: Boolean (default `true`)
- `persistent`: For long-running tasks like dev servers
- `env`: Environment variables affecting task hash

**Global Options:**

- `globalDependencies`: Files that invalidate all caches when changed
- `globalEnv`: Env vars affecting all task hashes
- `cacheDir`: Default `.turbo/cache`
- `envMode`: `"strict"` (default) or `"loose"`

---

## Integration & Impact Analysis

### Downstream Dependencies (What depends on this task)

All 15 subsequent tasks depend on TASK0:

| Task     | Dependency on TASK0                              |
| -------- | ------------------------------------------------ |
| TASK1-15 | Requires workspace structure and turbo pipelines |

### Contracts Established by This Task

**package.json Contracts:**

- Workspace paths: `["backend", "frontend", "packages/*", "e2e"]`
- Scripts that downstream tasks expect:
  - `bun run dev` - start dev mode
  - `bun run build` - build all packages
  - `bun run test` - run unit tests
  - `bun run lint` - run ESLint
  - `bun run typecheck` - run tsc --noEmit
  - `bun run test:integration` - Testcontainers tests
  - `bun run test:e2e` - Playwright tests

**turbo.json Contracts:**

- Pipeline names that downstream tasks will use:
  - `build` - compile (cached)
  - `test` - vitest (no cache)
  - `lint` - ESLint
  - `typecheck` - tsc --noEmit
  - `test:integration` - Testcontainers
  - `test:e2e` - Playwright
  - `dev` - persistent dev servers

**tsconfig.json Contracts:**

- All workspace packages will extend via `{ "extends": "../../tsconfig.json" }`
- ES2022 target for Bun compatibility
- Strict mode enabled
- Bundler module resolution

---

## Risks & Challenges Identified

### Technical Risks

1. **Workspace paths don't exist yet**
   - Impact: Low
   - Mitigation: Bun tolerates missing workspace directories with warnings
   - Verification: `bun install` should succeed with warnings

2. **No packages to build**
   - Impact: Low
   - Mitigation: `turbo run build --dry-run` validates configuration without needing packages
   - Verification: Dry-run should show pipeline structure

### Complexity Assessment

- Overall: **Low**
- Reasoning: Creating 3 JSON configuration files with well-documented formats

### Missing Information

- None identified - requirements are clear from TASK.md and PROMPT.md

---

## Execution Strategy Recommendation

**Based on research findings, execute in this order:**

### Step 1: Create `/package.json`

- Use Bun workspaces format from documentation
- Include all required scripts for downstream tasks
- Add shared devDependencies: `typescript`, `vitest`, `eslint`, `prettier`, `turbo`
- Use `latest` for all versions (per TASK.md constraint)

### Step 2: Create `/turbo.json`

- Define all 7 pipelines required by downstream tasks
- Configure `globalDependencies` for `.env*` and `tsconfig.json`
- Set `cache: false` for test pipelines
- Set `persistent: true` for dev pipeline

### Step 3: Create `/tsconfig.json`

- ES2022 target for Bun
- ESNext module with bundler resolution
- Strict mode enabled
- Declaration and source maps enabled

### Step 4: Verify Setup

- Run `bun install` - expect success with warnings about missing workspaces
- Run `bunx turbo run build --dry-run` - expect pipeline structure output
- Validate JSON files are parseable

---

**Research completed:** 2025-12-02
**Total similar components found:** 0 (greenfield)
**Total reusable components identified:** 0 (greenfield)
**Estimated complexity:** Low

---

## Task-Specific Additions

Review the content above and adapt as needed for this specific task.
