Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context (tech stack, architecture, conventions)
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK2/TASK.md` - Task-level context (what this task is about)
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK2/PROMPT.md` - Task-specific context (files to touch, patterns to follow)

**You MUST read these files before implementing to understand:**
- Tech stack and framework versions (Bun, TypeScript, ElysiaJS)
- Project structure (flat monorepo with backend/, frontend/, packages/*)
- Coding conventions and patterns
- Related code examples with file:line references
- Integration points and dependencies

**DO NOT duplicate this context below - it's already in the files above.**

## Implementation Plan

- [ ] **Item 1 — Install devDependencies + Create Configuration Files**
  - **What to do:**
    1. Ensure root `package.json` exists (dependency on TASK0)
    2. Install devDependencies using Bun:
       ```bash
       bun add -d eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
         prettier eslint-config-prettier \
         husky lint-staged \
         @commitlint/cli @commitlint/config-conventional
       ```
    3. Create `/.eslintrc.js` with TypeScript-aware configuration (see PROMPT.md:26-37)
    4. Create `/.prettierrc` with project formatting rules (see PROMPT.md:41-47)
    5. Create `/.lintstagedrc.js` for staged file processing
    6. Create `/commitlint.config.js` extending conventional commits

  - **Context (read-only):**
    - `PROMPT.md:26-37` — ESLint configuration example
    - `PROMPT.md:41-47` — Prettier configuration example
    - `AI_PROMPT.md:261-267` — Code quality gates acceptance criteria

  - **Touched (will modify/create):**
    - MODIFY: `/package.json` — Add devDependencies
    - CREATE: `/.eslintrc.js`
    - CREATE: `/.prettierrc`
    - CREATE: `/.lintstagedrc.js`
    - CREATE: `/commitlint.config.js`

  - **Interfaces / Contracts:**
    - ESLint exports `module.exports = { ... }` config object
    - Prettier exports JSON config
    - lint-staged exports `module.exports = { ... }` with glob patterns
    - Commitlint exports `module.exports = { extends: [...] }`

  - **Tests:**
    Type: Manual verification (config files don't need unit tests)
    - Happy path: `bunx eslint --print-config .` outputs merged config
    - Edge case: ESLint and Prettier rules don't conflict
    - Failure: Intentionally malformed code should fail lint

  - **Migrations / Data:**
    N/A - No data changes

  - **Observability:**
    N/A - No observability requirements

  - **Security & Permissions:**
    N/A - No security concerns

  - **Performance:**
    - lint-staged only processes staged files (not full repo)
    - ESLint caching enabled via `--cache` flag

  - **Commands:**
    ```bash
    # Install dependencies
    bun add -d eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier husky lint-staged @commitlint/cli @commitlint/config-conventional

    # Verify ESLint config
    bunx eslint --print-config . 2>/dev/null | head -20

    # Verify Prettier config
    bunx prettier --config .prettierrc --check . 2>/dev/null || true
    ```

  - **Risks & Mitigations:**
    - **Risk:** ESLint rules conflict with Prettier
      **Mitigation:** Use `eslint-config-prettier` which disables conflicting rules
    - **Risk:** TASK0 not complete (no root package.json)
      **Mitigation:** Verify package.json exists before proceeding

---

- [ ] **Item 2 — Set Up Husky Git Hooks**
  - **What to do:**
    1. Initialize Husky in the project:
       ```bash
       bunx husky init
       ```
    2. Create `/.husky/pre-commit` hook that runs lint-staged
    3. Create `/.husky/pre-push` hook that runs typecheck and tests
    4. Create `/.husky/commit-msg` hook that runs commitlint
    5. Make all hooks executable (`chmod +x`)
    6. Add `prepare` script to package.json for Husky installation on `bun install`

  - **Context (read-only):**
    - `PROMPT.md:50-52` — Husky hooks commands
    - `PROMPT.md:55-56` — External Husky documentation link
    - `TASK.md:50-55` — Husky hooks requirements

  - **Touched (will modify/create):**
    - CREATE: `/.husky/pre-commit`
    - CREATE: `/.husky/pre-push`
    - CREATE: `/.husky/commit-msg`
    - MODIFY: `/package.json` — Add `prepare` script

  - **Interfaces / Contracts:**
    - `pre-commit`: Runs `bunx lint-staged` on exit 0/non-zero
    - `pre-push`: Runs `bun run typecheck && bun run test` on exit 0/non-zero
    - `commit-msg`: Runs `bunx --no -- commitlint --edit $1` on exit 0/non-zero

  - **Tests:**
    Type: Manual integration verification
    - Happy path: Valid commit message passes commitlint
    - Happy path: Staged .ts file gets formatted on pre-commit
    - Failure: Invalid commit message "bad commit" is rejected
    - Failure: TypeScript error blocks push

  - **Migrations / Data:**
    N/A - No data changes

  - **Observability:**
    - Hooks output errors to stderr for developer feedback

  - **Security & Permissions:**
    - Hooks must be executable (chmod +x)
    - No secrets stored in hook files

  - **Performance:**
    - pre-commit: Fast (lint-staged only processes staged files)
    - pre-push: Slower (runs typecheck + tests) but prevents broken pushes

  - **Commands:**
    ```bash
    # Initialize Husky
    bunx husky init

    # Verify hooks are executable
    ls -la .husky/

    # Test commit-msg hook (should fail)
    echo "bad commit" | bunx --no -- commitlint || echo "Rejected as expected"

    # Test commit-msg hook (should pass)
    echo "feat: add feature" | bunx --no -- commitlint && echo "Passed as expected"
    ```

  - **Risks & Mitigations:**
    - **Risk:** Husky not installed on CI (no .git directory)
      **Mitigation:** `prepare` script uses `husky || true` to gracefully handle CI
    - **Risk:** Hooks not executable after clone
      **Mitigation:** `bunx husky init` sets permissions; document in README

---

- [ ] **Item 3 — Add npm Scripts + Verification**
  - **What to do:**
    1. Add scripts to root `package.json`:
       ```json
       {
         "scripts": {
           "prepare": "husky || true",
           "lint": "eslint . --ext .ts,.tsx --cache",
           "lint:fix": "eslint . --ext .ts,.tsx --fix --cache",
           "format": "prettier --write .",
           "format:check": "prettier --check ."
         }
       }
       ```
    2. Verify full workflow by:
       - Creating a test TypeScript file with intentional formatting issues
       - Running lint-staged to confirm auto-fix
       - Attempting a bad commit message to confirm rejection
       - Running typecheck to confirm it's wired up

  - **Context (read-only):**
    - `TASK.md:59-66` — Acceptance criteria for verification
    - `AI_PROMPT.md:416-429` — Self-verification checklist

  - **Touched (will modify/create):**
    - MODIFY: `/package.json` — Add scripts

  - **Interfaces / Contracts:**
    - `bun run lint` → exits 0 if no issues, non-zero otherwise
    - `bun run format:check` → exits 0 if formatted, non-zero otherwise

  - **Tests:**
    Type: Manual end-to-end verification
    - Happy path: `bun run lint` passes on clean code
    - Happy path: `bun run format:check` passes on formatted code
    - Edge case: Pre-commit auto-fixes formatting before commit
    - Failure: Bad commit message "update stuff" is rejected

  - **Migrations / Data:**
    N/A - No data changes

  - **Observability:**
    N/A - No observability requirements

  - **Security & Permissions:**
    N/A - No security concerns

  - **Performance:**
    - ESLint cache enabled via `--cache` flag
    - lint-staged only processes changed files

  - **Commands:**
    ```bash
    # Run lint check
    bun run lint 2>/dev/null || true

    # Run format check
    bun run format:check 2>/dev/null || true

    # Test bad commit (should fail)
    git add . && git commit -m "bad" 2>&1 | grep -q "subject" && echo "Commitlint working"

    # Test good commit format (dry-run)
    echo "feat: test feature" | bunx --no -- commitlint
    ```

  - **Risks & Mitigations:**
    - **Risk:** Scripts don't work with Turborepo
      **Mitigation:** Scripts are root-level; turbo.json already defines pipelines
    - **Risk:** ESLint cache stale after config changes
      **Mitigation:** Clear cache with `rm -rf .eslintcache` if needed

## Verification (global)
- [ ] Run targeted tests ONLY for changed code:
      ```bash
      # Verify ESLint config works
      bunx eslint --print-config . >/dev/null 2>&1 && echo "ESLint config OK"

      # Verify Prettier config works
      bunx prettier --config .prettierrc --check "*.json" 2>/dev/null || true

      # Verify Husky hooks exist and are executable
      test -x .husky/pre-commit && echo "pre-commit hook OK"
      test -x .husky/pre-push && echo "pre-push hook OK"
      test -x .husky/commit-msg && echo "commit-msg hook OK"

      # Verify commitlint rejects bad message
      echo "bad" | bunx --no -- commitlint 2>&1 | grep -q "subject" && echo "Commitlint rejection OK"

      # Verify commitlint accepts good message
      echo "feat: valid message" | bunx --no -- commitlint && echo "Commitlint acceptance OK"
      ```
      **CRITICAL:** Do not run full-project checks. Use quiet flags.
- [ ] All acceptance criteria met (see below)
- [ ] Code follows conventions from AI_PROMPT.md and PROMPT.md
- [ ] Integration points properly implemented (hooks call correct commands)

## Acceptance Criteria
- [ ] ESLint configured with TypeScript rules (`@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`)
- [ ] Prettier configured: `semi: false`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: "es5"`
- [ ] Husky pre-commit runs `bunx lint-staged`
- [ ] Husky pre-push runs `bun run typecheck && bun run test`
- [ ] Husky commit-msg runs commitlint
- [ ] Commitlint enforces Conventional Commits (extends `@commitlint/config-conventional`)
- [ ] Bad commit message (e.g., "update stuff") is rejected by commit-msg hook
- [ ] Staged .ts/.tsx files are auto-formatted via lint-staged

## Impact Analysis
- **Directly impacted:**
  - `/package.json` (modified - devDependencies + scripts)
  - `/.eslintrc.js` (new)
  - `/.prettierrc` (new)
  - `/.lintstagedrc.js` (new)
  - `/commitlint.config.js` (new)
  - `/.husky/pre-commit` (new)
  - `/.husky/pre-push` (new)
  - `/.husky/commit-msg` (new)

- **Indirectly impacted:**
  - All future commits will be validated by hooks
  - TASK15 (Semantic Release) depends on Conventional Commits from this task
  - CI pipelines may need to handle hook installation

## Diff Test Plan
| Changed Item | Test Type | Scenarios |
|--------------|-----------|-----------|
| `.eslintrc.js` | Manual | Config loads without error |
| `.prettierrc` | Manual | Config loads without error |
| `.lintstagedrc.js` | Manual | Processes staged files correctly |
| `commitlint.config.js` | Manual | Rejects bad commits, accepts valid ones |
| `.husky/pre-commit` | Manual | Runs lint-staged on commit |
| `.husky/pre-push` | Manual | Runs typecheck + test on push |
| `.husky/commit-msg` | Manual | Validates commit message format |

## Follow-ups
- None identified - task scope is well-defined in TASK.md and PROMPT.md
