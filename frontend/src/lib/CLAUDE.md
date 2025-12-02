# Lib - Frontend Utilities & Configuration

Core utility libraries and configuration for the frontend application. Contains setup for API communication, state management, and UI theming.

## Purpose

Provides foundational utilities used throughout the frontend:

- **API Client**: Type-safe RPC communication with backend
- **Query Configuration**: Server state management setup
- **UI Theming**: Application theme and design system

## Files

### `api.ts` - Eden RPC Client

Type-safe API client for communicating with the backend.

**Purpose:**

- Creates a typed RPC client from backend routes
- Provides autocomplete and type checking for all API calls
- Handles request/response serialization

**How It Works:**

The backend exports ElysiaJS routes which are automatically typed. Eden generates a TypeScript client that matches those types exactly.

**Basic Usage:**

```typescript
import { api } from '@/lib/api'

// Fetch current user (type-safe, autocomplete enabled)
const user = await api.users.me.get()

// Create notification (type-safe request/response)
const notification = await api.notifications.post({
  title: 'Hello',
  message: 'World',
})

// Update notification
await api.notifications({ id: '123' }).patch({
  read: true,
})

// List notifications with query params
const { data } = await api.notifications.get({
  query: { limit: 10, offset: 0 },
})
```

**Type Safety:**

Eden provides full type inference:

```typescript
// ✅ Compiler catches errors
const user = await api.users.me.get()
console.log(user.email) // ✅ Knows user has email

await api.notifications.post({
  title: 'Hello',
  // invalidField: true  // ❌ TypeScript error
})
```

**Configuration:**

```typescript
// api.ts
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = treaty<App>(baseUrl, {
  headers: {
    'X-User-Id': userId, // Custom headers
  },
  credentials: 'include', // Include cookies for auth
})
```

**Environment Variable:**

Set in `.env.local`:

```
VITE_API_URL=http://localhost:3000
```

**Error Handling:**

```typescript
try {
  const user = await api.users.me.get()
} catch (error) {
  if (error.status === 401) {
    // Unauthorized, redirect to login
  } else if (error.status === 500) {
    // Server error
  }
}
```

### `query.ts` - TanStack Query Setup

Initializes and configures TanStack Query for server state management.

**Purpose:**

- Configure QueryClient with sensible defaults
- Set cache options, retry logic, and stale time
- Provide consistent query behavior across app

**Configuration:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: true, // Refetch when window regains focus
    },
    mutations: {
      retry: 1, // Retry failed mutations
    },
  },
})
```

**Key Options:**

- **staleTime**: How long data is considered fresh (not re-fetched)
- **gcTime**: How long unused data persists in cache
- **retry**: Number of times to retry failed requests
- **refetchOnWindowFocus**: Re-fetch data when user switches tabs

**Usage with Provider:**

```typescript
// main.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

**Common Queries:**

```typescript
import { queryClient } from '@/lib/query'
import { useQuery } from '@tanstack/react-query'

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['user'],
  queryFn: () => api.users.me.get(),
})

// Invalidate cache (force refresh)
queryClient.invalidateQueries({ queryKey: ['user'] })

// Set cache data manually
queryClient.setQueryData(['user'], userData)

// Prefetch data
queryClient.prefetchQuery({
  queryKey: ['user'],
  queryFn: () => api.users.me.get(),
})
```

### `AntdProvider.tsx` - Ant Design Theme

Configures Ant Design component library theming and global styles.

**Purpose:**

- Initialize Ant Design with custom theme
- Apply consistent styling across app
- Support light/dark mode switching (future)

**Current Configuration:**

```typescript
export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={{ /* custom theme */ }}>
      {children}
    </ConfigProvider>
  )
}
```

**Customization:**

Modify theme variables in `theme` object:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',      // Primary color
      colorSuccess: '#52c41a',      // Success color
      fontSize: 14,                  // Base font size
      borderRadius: 6,               // Border radius
    },
  }}
>
  {children}
</ConfigProvider>
```

**Using in App:**

```typescript
// main.tsx
import { AntdProvider } from '@/lib/AntdProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AntdProvider>
    <App />
  </AntdProvider>
)
```

## Integration Example

Complete setup in `main.tsx`:

```typescript
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { AntdProvider } from '@/lib/AntdProvider'
import { queryClient } from '@/lib/query'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <AntdProvider>
      <App />
    </AntdProvider>
  </QueryClientProvider>
)
```

## Common Patterns

### Fetching Data in Components

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function UserProfile() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.users.me.get(),
  })

  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />

  return <div>{user?.email}</div>
}
```

### Updating Data with Mutations

```typescript
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/query'

export function UpdateUserForm() {
  const mutation = useMutation({
    mutationFn: (data: UserInput) => api.users.update(data),
    onSuccess: () => {
      // Refresh user data after successful update
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutation.mutate(data)
    }}>
      {/* form content */}
    </form>
  )
}
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: (post: Post) => api.posts.update(post),
  onMutate: (newPost) => {
    // Immediately update UI with new data
    queryClient.setQueryData(['posts', newPost.id], newPost)
  },
  onError: () => {
    // Revert on error
    queryClient.invalidateQueries({ queryKey: ['posts'] })
  },
})
```

## Environment Variables

Supported variables in `.env.local`:

| Variable       | Description     | Default                 |
| -------------- | --------------- | ----------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

Create `.env.local` file:

```
VITE_API_URL=http://localhost:3000
```

## Related Documentation

- [Eden RPC Documentation](https://eden.elysiajs.com/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Ant Design Documentation](https://ant.design/)
