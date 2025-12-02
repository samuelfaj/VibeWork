## PROMPT
Initialize the root monorepo foundation with Bun workspaces and Turborepo. Create root package.json, turbo.json, and base tsconfig.json that will serve as the foundation for all packages. This is Layer 0 - must be completed before any other tasks.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/package.json` - Root package.json with Bun workspaces
- `/turbo.json` - Turborepo pipeline configuration
- `/tsconfig.json` - Base TypeScript configuration

### Configuration Requirements

**package.json workspaces:**
```json
{
  "workspaces": ["backend", "frontend", "packages/*", "e2e"]
}
```

**turbo.json pipelines:**
- build: outputs `["dist/**"]`, dependsOn `["^build"]`
- test: cache false (runs tests fresh)
- lint: no outputs
- typecheck: dependsOn `["^build"]`

**tsconfig.json base:**
- `"target": "ES2022"` for Bun compatibility
- `"strict": true`
- `"moduleResolution": "bundler"`

## EXTRA DOCUMENTATION
- Turborepo: https://turbo.build/repo/docs
- Bun workspaces: https://bun.sh/docs/install/workspaces

## LAYER
0

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Use `bun` as package manager (not npm/yarn/pnpm)
- All versions should use latest stable
- No placeholder packages yet - just the root configuration
- Verify with `bun install` and `bunx turbo run build --dry-run`
