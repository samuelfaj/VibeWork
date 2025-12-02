## PROMPT
Set up code quality gates: ESLint with TypeScript rules, Prettier, Husky git hooks (pre-commit, pre-push), lint-staged, and Commitlint for Conventional Commits enforcement. Ensure bad commits are blocked.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/.eslintrc.js` - ESLint configuration
- `/.prettierrc` - Prettier configuration
- `/.husky/pre-commit` - Pre-commit hook
- `/.husky/pre-push` - Pre-push hook
- `/.lintstagedrc.js` - lint-staged configuration
- `/commitlint.config.js` - Commitlint configuration

### Configuration Details

**ESLint (.eslintrc.js):**
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  env: { node: true, es2022: true }
}
```

**Prettier (.prettierrc):**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Husky hooks:**
- pre-commit: `bunx lint-staged`
- pre-push: `bun run typecheck && bun run test`

## EXTRA DOCUMENTATION
- Husky: https://typicode.github.io/husky/
- Commitlint: https://commitlint.js.org/

## LAYER
0

## PARALLELIZATION
Parallel with: [TASK1, TASK3, TASK4]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Use Bun for running scripts
- ESLint must not conflict with Prettier
- Hooks must be executable (`chmod +x`)
- Test with a bad commit message to verify rejection
