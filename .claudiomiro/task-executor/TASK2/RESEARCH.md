# Research for TASK2

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK2/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK2/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

---

## Task Understanding Summary

Set up code quality gates (ESLint, Prettier, Husky, lint-staged, Commitlint) for a Bun + TypeScript monorepo. See TODO.md for full implementation plan with 3 items.

---

## Files Discovered to Read/Modify

### Existing Files (already exist - will modify)

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/package.json:1-23` - Root package.json exists with eslint/prettier already in devDeps but missing @typescript-eslint and other required packages
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/turbo.json:1-32` - Turborepo config exists with lint task defined but no typecheck caching

### Files to Create (confirmed do NOT exist)

- `/.eslintrc.js` - No ESLint config found in project root
- `/.prettierrc` - No Prettier config found in project root
- `/.lintstagedrc.js` - No lint-staged config found
- `/commitlint.config.js` - No commitlint config found
- `/.husky/pre-commit` - No Husky hooks directory exists
- `/.husky/pre-push` - No Husky hooks directory exists
- `/.husky/commit-msg` - No Husky hooks directory exists

---

## Code Patterns

### Package.json Pattern (from existing project)

- `package.json:1-23` - Uses ES modules (`"type": "module"`)
- Uses Bun workspaces: `["backend", "frontend", "packages/*", "e2e"]`
- Scripts use Turborepo (`turbo run xxx`)
- devDependencies at root level (eslint, prettier, vitest, typescript already present)

### TypeScript Configuration

- `tsconfig.json:1-14` - Target ES2022, ESNext modules, bundler moduleResolution, strict mode enabled

---

## Integration & Impact Analysis

### Functions/Classes/Components Being Modified:

- **`package.json` scripts section** - Adding: `prepare`, `lint:fix`, `format`, `format:check`
  - **Called by:** Turborepo (`turbo run lint`), Husky hooks, developers manually
  - **Parameter contract:** npm/bun script commands
  - **Impact:** New scripts integrate with existing `lint` turborepo task
  - **Breaking changes:** NO - additive only

### Pre-existing Dependencies Discovered:

| Package                  | Status        | Notes               |
| ------------------------ | ------------- | ------------------- |
| `eslint`                 | INSTALLED     | v latest in devDeps |
| `prettier`               | INSTALLED     | v latest in devDeps |
| `typescript`             | INSTALLED     | v latest in devDeps |
| `@typescript-eslint/*`   | NOT INSTALLED | Need to add         |
| `eslint-config-prettier` | NOT INSTALLED | Need to add         |
| `husky`                  | NOT INSTALLED | Need to add         |
| `lint-staged`            | NOT INSTALLED | Need to add         |
| `@commitlint/*`          | NOT INSTALLED | Need to add         |

---

## Similar Components Found (LEARN FROM THESE)

### None Found in Project Root

- No `.eslintrc.*` files in project (only in node_modules)
- No `.prettierrc*` files exist
- No Husky configuration exists
- This is greenfield for code quality tooling

### External Reference Patterns (from PROMPT.md)

- ESLint config template: `PROMPT.md:26-37`
- Prettier config template: `PROMPT.md:41-47`

---

## Reusable Components (USE THESE, DON'T RECREATE)

### Existing Infrastructure

1. **Turborepo lint task** - `turbo.json:12-14`
   - Already defined with `"outputs": []`
   - Can be invoked via `bun run lint`
   - Scripts should hook into this existing pipeline

2. **Root package.json workspaces** - `package.json:6`
   - Workspaces: `["backend", "frontend", "packages/*", "e2e"]`
   - ESLint ignore patterns should align with these workspaces

---

## Codebase Conventions Discovered

### File Organization

- Root level config files (package.json, turbo.json, tsconfig.json)
- Workspaces in subdirectories (backend/, frontend/, packages/\*, e2e/)

### Module System

- ES Modules (`"type": "module"` in package.json)
- Config files may need CommonJS for compatibility (eslint, commitlint use `module.exports`)

### Naming Conventions

- kebab-case for directories (e.g., `task-executor`)
- Config files: standard naming (`.eslintrc.js`, `.prettierrc`, etc.)

---

## Test Strategy Discovered

### Testing Framework

- **Framework:** Vitest (from package.json devDeps)
- **Test command:** `bun run test` → `turbo run test`
- **Config:** Not yet created (vitest.config.ts)

### Verification for This Task

- Manual verification (config files don't need unit tests)
- Test commands from TODO.md:74-83 and TODO.md:143-155
- Verify: ESLint config loads, Prettier config loads, Husky hooks executable, commitlint rejects bad messages

---

## Risks & Challenges Identified

### Technical Risks

1. **ESLint/Prettier Conflict**
   - Impact: Medium
   - Mitigation: Use `eslint-config-prettier` to disable conflicting rules (already planned)

2. **ES Module vs CommonJS for Config Files**
   - Impact: Low
   - Mitigation: Use `.js` extension with `module.exports` for eslint/commitlint configs (Node compatibility)

3. **Husky with Bun**
   - Impact: Low
   - Mitigation: Use `bunx husky init` and `bunx lint-staged` commands

4. **Prepare Script in CI**
   - Impact: Low
   - Mitigation: Use `husky || true` pattern to gracefully handle missing git directory

### Complexity Assessment

- Overall: **Low-Medium**
- Reasoning: Standard tooling setup with clear patterns from PROMPT.md; no custom logic needed

### Missing Information

- None identified - TASK.md and PROMPT.md provide complete specifications

---

## Execution Strategy Recommendation

**Based on research findings, execute in this order:**

1. **Install Missing devDependencies**
   - Read: `package.json:16-22` (existing devDeps)
   - Run: `bun add -d @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier husky lint-staged @commitlint/cli @commitlint/config-conventional`
   - Note: eslint and prettier already installed

2. **Create ESLint Configuration**
   - Create: `/.eslintrc.js`
   - Follow template: `PROMPT.md:26-37`
   - Add parserOptions for ES2022 to match `tsconfig.json:3`

3. **Create Prettier Configuration**
   - Create: `/.prettierrc`
   - Follow template: `PROMPT.md:41-47`

4. **Create lint-staged Configuration**
   - Create: `/.lintstagedrc.js`
   - Pattern: `*.{ts,tsx}` → eslint --fix, prettier --write
   - Pattern: `*.{json,md}` → prettier --write

5. **Create Commitlint Configuration**
   - Create: `/commitlint.config.js`
   - Extend: `@commitlint/config-conventional`

6. **Initialize Husky**
   - Run: `bunx husky init`
   - Create: `.husky/pre-commit` with `bunx lint-staged`
   - Create: `.husky/pre-push` with `bun run typecheck && bun run test`
   - Create: `.husky/commit-msg` with commitlint

7. **Add Scripts to package.json**
   - Add: `prepare`, `lint:fix`, `format`, `format:check`

8. **Verify**
   - Test ESLint config loads
   - Test Prettier config loads
   - Test commitlint rejects "bad" and accepts "feat: valid"
   - Verify hooks are executable

---

**Research completed:** 2025-12-02
**Total similar components found:** 0 (greenfield)
**Total reusable components identified:** 2 (turborepo lint task, package.json workspaces)
**Estimated complexity:** Low-Medium
