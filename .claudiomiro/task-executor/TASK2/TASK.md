@dependencies [TASK0]
@scope integration

# Task: Code Quality Gates (ESLint, Prettier, Husky, Commitlint)

## Summary
Set up comprehensive code quality tooling including ESLint, Prettier, Husky git hooks, lint-staged, and Commitlint for Conventional Commits. This ensures code quality from the first commit.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates `/.eslintrc.js` with TypeScript rules
- Creates `/.prettierrc` with formatting rules
- Creates `/.husky/` directory with pre-commit and pre-push hooks
- Creates `/.lintstagedrc.js` for staged file processing
- Creates `/commitlint.config.js` for Conventional Commits

## Complexity
Medium

## Dependencies
Depends on: [TASK0]
Blocks: [TASK15]
Parallel with: [TASK1, TASK3, TASK4]

## Detailed Steps
1. Install devDependencies in root package.json:
   - eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin
   - prettier, eslint-config-prettier
   - husky, lint-staged
   - @commitlint/cli, @commitlint/config-conventional

2. Create `.eslintrc.js`:
   - Extend TypeScript recommended rules
   - Configure for Bun environment
   - Add project-specific rules

3. Create `.prettierrc`:
   - Semi: false
   - Single quotes
   - Tab width: 2
   - Trailing comma: es5

4. Create `.lintstagedrc.js`:
   - `*.{ts,tsx}`: eslint --fix, prettier --write
   - `*.{json,md}`: prettier --write

5. Create Husky hooks:
   - `pre-commit`: run lint-staged
   - `pre-push`: run typecheck and fast unit tests

6. Create `commitlint.config.js`:
   - Extend @commitlint/config-conventional

7. Add prepare script to install husky

## Acceptance Criteria
- [ ] ESLint configured with TypeScript rules
- [ ] Prettier configured for consistent formatting
- [ ] Husky pre-commit runs lint-staged
- [ ] Husky pre-push runs typecheck and tests
- [ ] Commitlint enforces Conventional Commits
- [ ] Bad commit message is rejected
- [ ] Staged files are auto-formatted

## Code Review Checklist
- [ ] ESLint rules don't conflict with Prettier
- [ ] Husky hooks are executable
- [ ] lint-staged only processes changed files
- [ ] Commitlint config follows conventional-commits spec

## Reasoning Trace
Quality gates at git hook level prevent bad code from entering the repository. lint-staged ensures only changed files are processed for fast feedback. Conventional Commits enable automated changelog generation via Semantic Release.
