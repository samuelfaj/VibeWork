# Packages - Shared Workspace

Shared packages workspace containing reusable code, schemas, and components used across frontend and backend.

## Purpose

Provides a single source of truth for:

- **Type-safe schemas** shared between frontend and backend
- **Reusable UI components** for the frontend
- **Common utilities** and domain models

## Structure

```
packages/
├── contract/              # Shared TypeBox schemas
│   ├── package.json
│   ├── tsconfig.json
│   ├── CLAUDE.md
│   └── src/
│       ├── index.ts       # Barrel export
│       ├── user.ts        # User/auth schemas
│       ├── user.test.ts   # User tests (co-located)
│       ├── notification.ts # Notification schemas
│       └── notification.test.ts # Notification tests (co-located)
└── ui/                    # Shared React components
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts       # Barrel export
    │   └── Button.tsx     # Reusable button component
    └── dist/
```

## Packages

### `@vibe-code/contract`

**Purpose:** Shared TypeBox schema definitions for end-to-end type safety.

**Key Files:**

- `src/user.ts` - User model, signup/login request/response schemas
- `src/notification.ts` - Notification model and message schemas

**Usage:**

- Backend: Route validation with Elysia
- Frontend: Type inference for Eden RPC client
- Both: Ensures compile-time type safety between frontend and backend

**Reference:** See [`packages/contract/CLAUDE.md`](contract/CLAUDE.md)

### `@vibe/ui`

**Purpose:** Shared React UI component library.

**Current Components:**

- `Button.tsx` - Reusable button component

**Adding Components:**

1. Create component file in `src/` (e.g., `src/Card.tsx`)
2. Export from `src/index.ts`:
   ```typescript
   export { Button } from './Button'
   export { Card } from './Card'
   ```
3. Use in frontend:
   ```typescript
   import { Button, Card } from '@vibe/ui'
   ```

**Best Practices:**

- Keep components small and focused
- Support TypeScript props typing
- Document component props with JSDoc
- Add unit tests for complex logic
- Ensure components work with Ant Design theme

## Building

```bash
# Install all dependencies
bun install

# Build all packages
bun run build

# Build specific package
bun run build --filter @vibe/ui

# Type check
bun run typecheck

# Run tests
bun run test
```

## Publishing

Currently packages are used internally via workspace references (`workspace:*` in package.json). To publish to npm:

1. Update version in package.json
2. Create git tag: `git tag @package/version`
3. Run: `npm publish` from package directory

## Cross-package Dependencies

Use workspace protocol (`workspace:*`) in package.json to reference other packages:

```json
{
  "dependencies": {
    "@vibe-code/contract": "workspace:*",
    "@vibe/ui": "workspace:*"
  }
}
```

Bun automatically resolves these to local packages during development.

## Key Dependencies

### contract

- `@sinclair/typebox` ^0.32.0 - Schema validation
- `typescript` ^5.3.0 - Type checking

### ui

- `react` ^18.2.0 - UI library
- `antd` ^5.13.0 - Component library (optional styling)
