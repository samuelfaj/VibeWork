# Features - Frontend Feature Modules

Feature-based architecture for organizing frontend functionality. Each feature is a self-contained module with its own components, hooks, and state management.

## Purpose

Organize frontend code by business feature rather than by type. This approach:

- **Improves scalability**: Each feature can be independently developed and tested
- **Reduces coupling**: Features are isolated and don't depend on each other
- **Simplifies navigation**: Easy to find all code related to a specific feature
- **Enables code sharing**: Reusable hooks and components within a feature

## Structure

```
features/
└── auth/                      # Authentication feature module
    ├── LoginForm.tsx          # Login UI component
    ├── SignupForm.tsx         # Signup UI component
    ├── hooks.ts               # TanStack Query hooks
    ├── index.ts               # Barrel export
    └── (types.ts)             # Optional: TypeScript types
```

## Current Features

### `auth` - Authentication

**Purpose:** User login and signup functionality.

**Files:**

- `LoginForm.tsx` - Email/password login form with validation
- `SignupForm.tsx` - User registration form
- `hooks.ts` - TanStack Query mutations:
  - `useLogin()` - Authenticate user
  - `useSignup()` - Register new user
  - `useCurrentUser()` - Fetch current logged-in user

**Key Features:**

- Form validation with error messages
- i18n support (English, Portuguese, Spanish)
- Loading states during authentication
- Error handling and display
- Type-safe API calls via Eden RPC

**Usage Example:**

```typescript
import { useLogin } from '@/features/auth'

export function MyComponent() {
  const mutation = useLogin()

  const handleLogin = (email: string, password: string) => {
    mutation.mutate({ email, password })
  }

  return <form onSubmit={handleLogin}>...</form>
}
```

## Adding New Features

Follow this structure when creating a new feature:

### 1. Create Feature Folder

```bash
mkdir -p src/features/myfeature
```

### 2. Create Component Files

```typescript
// src/features/myfeature/MyComponent.tsx
import { useMyFeature } from './hooks'

export function MyComponent() {
  const data = useMyFeature()
  return <div>{data.name}</div>
}
```

### 3. Create Query Hooks

```typescript
// src/features/myfeature/hooks.ts
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export const useMyFeature = () =>
  useQuery({
    queryKey: ['myfeature'],
    queryFn: () => api.myfeature.get(),
  })

export const useCreateItem = () =>
  useMutation({
    mutationFn: (data: CreateItemInput) => api.myfeature.post(data),
  })
```

### 4. Create Barrel Export

```typescript
// src/features/myfeature/index.ts
export { MyComponent } from './MyComponent'
export * from './hooks'
```

### 5. Use in App

```typescript
// src/App.tsx or any component
import { MyComponent, useMyFeature } from '@/features/myfeature'
```

## Best Practices

### Organization

- **One feature per folder**: Keep features isolated
- **Barrel exports**: Use `index.ts` to control public API
- **Consistent naming**: Use PascalCase for components, camelCase for functions
- **Group related code**: All feature code in one directory

### Hooks (TanStack Query)

```typescript
// ✅ Good: Descriptive query key
useQuery({
  queryKey: ['users', userId, 'posts'],
  queryFn: () => api.users.getById(userId).posts(),
})

// ❌ Bad: Generic query key
useQuery({
  queryKey: ['data'],
  queryFn: () => api.getData(),
})
```

### Components

```typescript
// ✅ Good: Focused, reusable component
export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const mutation = useLogin()
  // ...
}

// ❌ Bad: Component mixing multiple concerns
export function Page() {
  // Authentication, form, error handling, API calls, UI all mixed
}
```

### State Management

- **Server state**: Use TanStack Query (useQuery, useMutation)
- **UI state**: Use React useState (form inputs, modals)
- **Global state**: Avoid until necessary (prefer local state)

```typescript
// ✅ Good: Server state with Query
const { data: user, isLoading } = useQuery({
  queryKey: ['currentUser'],
  queryFn: () => api.users.getCurrentUser(),
})

// ✅ Good: UI state with useState
const [isModalOpen, setIsModalOpen] = useState(false)

// ❌ Avoid: Global state when local is sufficient
const [name, setName] = useGlobalState('name') // Unless shared across many components
```

## Feature Dependency Rules

- **Features should not depend on other features**
  - ❌ `auth/hooks.ts` importing from `dashboard/`
  - ✅ Shared code in `/lib` or `/components`

- **Features can depend on:**
  - `/lib` - Shared utilities and API client
  - `/components` - Shared UI components (if needed)
  - External packages

## Common Patterns

### Query with Refetch

```typescript
export const useUserPosts = (userId: string) => {
  const query = useQuery({
    queryKey: ['users', userId, 'posts'],
    queryFn: () => api.users.getById(userId).posts(),
  })

  return {
    ...query,
    refetch: query.refetch,
  }
}
```

### Mutation with Optimistic Update

```typescript
export const useUpdatePost = () =>
  useMutation({
    mutationFn: (post: Post) => api.posts.update(post),
    onMutate: (newPost) => {
      // Optimistically update cache
      queryClient.setQueryData(['posts'], (old: Post[]) =>
        old.map((p) => (p.id === newPost.id ? newPost : p))
      )
    },
    onError: () => {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
```

### Error Handling

```typescript
export function MyComponent() {
  const mutation = useCreateItem()

  if (mutation.isError) {
    return (
      <div className="error">
        {mutation.error?.message || 'An error occurred'}
      </div>
    )
  }

  return (
    <div>
      {mutation.isPending && <Spinner />}
      <form onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate(data)
      }}>
        {/* Form content */}
      </form>
    </div>
  )
}
```

### Loading States

```typescript
export function MyComponent() {
  const { data, isPending, error } = useMyFeature()

  if (isPending) return <Spinner />
  if (error) return <Error message={error.message} />

  return <div>{data?.name}</div>
}
```

## Testing

Each feature should include tests for:

```typescript
// features/myfeature/__tests__/hooks.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useMyFeature } from '../hooks'

describe('useMyFeature', () => {
  it('fetches data successfully', async () => {
    const { result } = renderHook(() => useMyFeature())

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(result.current.data).toBeDefined()
  })
})
```

## E2E Testing Requirements (CRITICAL)

**CRITICAL**: Every new feature MUST include Stagehand E2E tests before being considered complete.

### E2E Test Checklist

When adding a new feature:

- [ ] Create test file: `e2e-stagehand/tests/{feature}/{feature}.test.ts`
- [ ] Test happy path (user completes main flow successfully)
- [ ] Test error states (invalid inputs, API errors)
- [ ] Test edge cases (empty states, long inputs)
- [ ] Run tests: `bun run test:e2e:stagehand`

### E2E Test Template

```typescript
// e2e-stagehand/tests/myfeature/myfeature.test.ts
import 'dotenv/config'
import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import { Stagehand } from '@browserbasehq/stagehand'
import { z } from 'zod'
import { APP_URL, createStagehand, delay } from '../../helpers/stagehand'

describe('MyFeature E2E Tests', () => {
  let stagehand: Stagehand

  beforeAll(async () => {
    stagehand = await createStagehand()
  })

  afterAll(async () => {
    await stagehand.close()
  })

  test('should complete main user flow', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(`${APP_URL}/myfeature`)
    await delay(1500)

    // Use natural language for actions
    await stagehand.act('Click the "Create New" button')
    await stagehand.act('Type "My Item" in the name field')
    await stagehand.act('Click the submit button')
    await delay(2000)

    // Validate with Zod schema
    const result = await stagehand.extract(
      'Check if the item was created successfully',
      z.object({
        success: z.boolean(),
        itemName: z.string().optional(),
      })
    )

    expect(result.success).toBe(true)
  })

  test('should show error for invalid input', async () => {
    const page = stagehand.context.pages()[0]
    await page.goto(`${APP_URL}/myfeature`)
    await delay(1500)

    await stagehand.act('Click the submit button without filling the form')
    await delay(1000)

    const result = await stagehand.extract(
      'Check if there is a validation error',
      z.object({
        hasError: z.boolean(),
        errorMessage: z.string().optional(),
      })
    )

    expect(result.hasError).toBe(true)
  })
})
```

### Running E2E Tests

```bash
# Run all Stagehand E2E tests
bun run test:e2e:stagehand

# Run with visible browser (for debugging)
cd e2e-stagehand && HEADLESS=false bun run test:headed

# Run in watch mode
cd e2e-stagehand && bun run test:watch
```

### Best Practices for E2E Tests

1. **Use natural language**: Write instructions as you would tell a human
2. **Be specific**: "Click the blue Submit button" is better than "Click submit"
3. **Add delays**: AI needs time to process and act
4. **Use Zod schemas**: Validate extracted data structure
5. **Test error states**: Don't just test happy paths
6. **Keep tests independent**: Each test should start fresh

See [`e2e-stagehand/CLAUDE.md`](../../../e2e-stagehand/CLAUDE.md) for detailed Stagehand documentation.

## Future Features

Potential features to add:

- [ ] **dashboard** - User dashboard and analytics
- [ ] **profile** - User profile management
- [ ] **notifications** - Notification center
- [ ] **settings** - Application settings
- [ ] **search** - Global search functionality
