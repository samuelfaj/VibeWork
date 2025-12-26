# Shared Workspace

Shared code containing reusable schemas used across frontend and backend.

## Purpose

Provides a single source of truth for:

- **Type-safe schemas** shared between frontend and backend

## Structure

```
shared/
└── contract/              # Shared TypeBox schemas
    ├── package.json
    ├── tsconfig.json
    ├── CLAUDE.md
    └── src/
        ├── index.ts       # Barrel export
        ├── user.ts        # User/auth schemas
        ├── user.test.ts   # User tests (co-located)
        ├── notification.ts # Notification schemas
        └── notification.test.ts # Notification tests (co-located)
```

## Package: `@vibe-code/contract`

**Purpose:** Shared TypeBox schema definitions for end-to-end type safety.

**Key Files:**

- `src/user.ts` - User model, signup/login request/response schemas
- `src/notification.ts` - Notification model and message schemas

**Usage:**

- Backend: Route validation with Elysia
- Frontend: Type inference for Eden RPC client
- Both: Ensures compile-time type safety between frontend and backend

**Reference:** See [`shared/contract/CLAUDE.md`](contract/CLAUDE.md)

## Building

```bash
# Install all dependencies
bun install

# Build all packages
bun run build

# Build specific package
bun run build --filter @vibe-code/contract

# Type check
bun run typecheck

# Run tests
bun run test
```

## Cross-package Dependencies

Use workspace protocol (`workspace:*`) in package.json to reference shared packages:

```json
{
  "dependencies": {
    "@vibe-code/contract": "workspace:*"
  }
}
```

Bun automatically resolves these to local packages during development.

## Key Dependencies

### contract

- `@sinclair/typebox` ^0.32.0 - Schema validation
- `typescript` ^5.3.0 - Type checking
