# Frontend State Management Guide

Guide to managing server and client state with TanStack Query.

## State Management Strategy

```
┌─────────────────────────────────────────┐
│        Server State (TanStack Query)    │
│  ├── API responses (users, posts, etc.) │
│  ├── Automatic caching                  │
│  ├── Background refetching              │
│  └── Synchronization                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Client State (useState)         │
│  ├── Form inputs                        │
│  ├── UI state (modals, menus)          │
│  ├── Temporary local state              │
│  └── Session state                      │
└─────────────────────────────────────────┘
```

## TanStack Query Setup

### QueryClient Configuration

**Location:** `src/lib/query.ts`

```typescript
import { QueryClient, QueryClientProvider, DefaultOptions } from '@tanstack/react-query'

const queryConfig: DefaultOptions = {
  queries: {
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: 'stale',
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  },
  mutations: {
    retry: 1,
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})
```

**Configuration Explained:**

| Option                 | Purpose                           | Value      |
| ---------------------- | --------------------------------- | ---------- |
| `retry`                | Auto-retry failed requests        | 1 attempt  |
| `refetchOnWindowFocus` | Refetch when window regains focus | true       |
| `staleTime`            | How long data is fresh            | 5 minutes  |
| `gcTime`               | Garbage collection time           | 10 minutes |

### Provider Setup

**Location:** `src/main.tsx`

```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

## Querying Data

### useQuery Hook

Fetch data from server:

```typescript
import { useQuery } from '@tanstack/react-query'
import { client } from '@/lib/api'

export const useGetUser = (userId: string) => {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => client.api.users[userId].get(),
  })
}
```

**Usage in Component:**

```typescript
export const UserProfile = ({ userId }: Props) => {
  const { data: user, isLoading, error } = useGetUser(userId)

  if (isLoading) return <Spin />
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### Query Options

**Polling (auto-refetch):**

```typescript
useQuery({
  queryKey: ['notifications'],
  queryFn: () => client.api.notifications.get(),
  refetchInterval: 5000, // Refetch every 5 seconds
})
```

**Disable Auto-Refetch:**

```typescript
useQuery({
  queryKey: ['user', userId],
  queryFn: () => client.api.users[userId].get(),
  refetchOnWindowFocus: false,
  refetchOnMount: false,
})
```

**Custom Stale Time:**

```typescript
useQuery({
  queryKey: ['static-data'],
  queryFn: () => client.api.staticData.get(),
  staleTime: Infinity, // Never stale
})
```

## Mutating Data

### useMutation Hook

Modify data on server:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/api'

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => client.api.users.me.put(data),
    onSuccess: (updated) => {
      // Update cache
      queryClient.setQueryData(['user', 'me'], updated)
      // Or invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

**Usage in Component:**

```typescript
export const EditUserForm = () => {
  const { mutate: updateUser, isPending } = useUpdateUser()

  const onSubmit = (formData) => {
    updateUser(formData, {
      onSuccess: () => {
        message.success('Updated successfully')
      },
      onError: () => {
        message.error('Failed to update')
      }
    })
  }

  return (
    <form onSubmit={onSubmit}>
      {/* form fields */}
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### Mutation States

```typescript
const {
  mutate,
  isPending,        // Request in flight
  isError,          // Failed
  error,            // Error object
  data,             // Success response
  status,           // 'idle' | 'pending' | 'error' | 'success'
  reset             // Clear state
} = useMutation(...)
```

## Cache Management

### Invalidate Queries

Force refetch by invalidating cache:

```typescript
const queryClient = useQueryClient()

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['users', userId] })

// Invalidate all queries with prefix
queryClient.invalidateQueries({ queryKey: ['users'] })

// Invalidate all queries
queryClient.invalidateQueries()
```

### Update Cache Manually

Update cache without refetching:

```typescript
const queryClient = useQueryClient()

// Get cached data
const user = queryClient.getQueryData(['users', userId])

// Update cache
queryClient.setQueryData(['users', userId], {
  ...user,
  name: 'Updated Name',
})
```

### Query Keys

**Convention:** Hierarchical arrays

```typescript
// User queries
;['users'][('users', userId)][('users', userId, 'posts')][('users', userId, 'posts', postId)][ // All users // Specific user // User's posts // Specific post
  // Notifications
  'notifications'
][('notifications', userId)][('notifications', userId, 'unread')]
```

## Optimistic Updates

Update UI before server confirms:

```typescript
const { mutate: updateUser } = useMutation({
  mutationFn: (newData) => client.api.users.me.put(newData),
  onMutate: async (newData) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: ['user', 'me'] })

    // Get old data
    const oldData = queryClient.getQueryData(['user', 'me'])

    // Update cache immediately
    queryClient.setQueryData(['user', 'me'], {
      ...oldData,
      ...newData,
    })

    // Return context for rollback
    return { oldData }
  },
  onError: (_error, _newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['user', 'me'], context.oldData)
  },
  onSuccess: () => {
    // Re-validate cache on success
    queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
  },
})
```

## Pagination

### Query-Based Pagination

```typescript
const [page, setPage] = useState(1)

const { data: notifications } = useQuery({
  queryKey: ['notifications', page],
  queryFn: () => client.api.notifications.get({ page, limit: 20 })
})

return (
  <div>
    {notifications.data.map(notif => (
      <NotificationCard key={notif.id} {...notif} />
    ))}
    <Pagination
      current={page}
      total={notifications.pagination.total}
      onChange={setPage}
    />
  </div>
)
```

### Infinite Query (Load More)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'

const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['notifications'],
  queryFn: ({ pageParam = 1 }) =>
    client.api.notifications.get({ page: pageParam, limit: 20 }),
  getNextPageParam: (lastPage) =>
    lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined
})

return (
  <div>
    {data?.pages.map(page =>
      page.data.map(notif => (
        <NotificationCard key={notif.id} {...notif} />
      ))
    )}
    {hasNextPage && (
      <Button onClick={() => fetchNextPage()}>Load More</Button>
    )}
  </div>
)
```

## Error Handling

### Handle Errors in useQuery

```typescript
const { error } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => client.api.users[userId].get()
})

if (error) {
  return (
    <div className="error">
      <h2>Error Loading User</h2>
      <p>{error.message}</p>
    </div>
  )
}
```

### Handle Errors in useMutation

```typescript
const { mutate: updateUser, error } = useMutation({
  mutationFn: (data) => client.api.users.me.put(data),
})

const onSubmit = (formData) => {
  updateUser(formData, {
    onError: (error) => {
      if (error.status === 409) {
        message.error('Email already in use')
      } else if (error.status === 422) {
        message.error('Invalid data provided')
      } else {
        message.error('An error occurred')
      }
    },
  })
}
```

### Global Error Handling

```typescript
// lib/query.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry 4xx errors
        if (error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 1
      }
    }
  }
})

// In main.tsx
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

const { reset } = useQueryErrorResetBoundary()

<ErrorBoundary
  onReset={reset}
  fallback={<ErrorFallback />}
>
  <App />
</ErrorBoundary>
```

## React Query DevTools

### Installation

```bash
bun add -D @tanstack/react-query-devtools
```

### Setup

```typescript
// src/main.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Usage

- Click DevTools icon in bottom right
- Inspect cache state
- Refetch/reset queries
- View query history

## Client State

### useState for Client State

```typescript
// Form inputs
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')

// UI visibility
const [isModalOpen, setIsModalOpen] = useState(false)
const [activeTab, setActiveTab] = useState('tab1')

// Temporary local data
const [filters, setFilters] = useState({ status: 'all' })
```

### useCallback for Stability

```typescript
const handleFilterChange = useCallback(
  (newFilters) => {
    setFilters(newFilters)
    // Refetch data with new filters
    queryClient.invalidateQueries({
      queryKey: ['notifications'],
    })
  },
  [queryClient]
)
```

## Performance Optimization

### Memoization

```typescript
import { memo } from 'react'

export const NotificationCard = memo(({ notification }) => {
  return (
    <div>
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>
    </div>
  )
})
```

### Query Optimization

```typescript
// Good: Specific query key
useQuery({
  queryKey: ['users', userId, 'posts', { status: 'published' }],
  queryFn: () => client.api.users[userId].posts.get({ status: 'published' })
})

// Avoid: Changing objects cause cache misses
useQuery({
  queryKey: ['posts', { status: 'published' }], // Creates new object each render
  queryFn: () => {...}
})

// Better: Stable object reference
const filters = useMemo(
  () => ({ status: 'published' }),
  []
)
const { data } = useQuery({
  queryKey: ['posts', filters],
  queryFn: () => client.api.posts.get(filters)
})
```

## Best Practices

### Do's ✅

- Use TanStack Query for server state
- Keep query keys organized hierarchically
- Use mutations for create/update/delete
- Implement optimistic updates
- Handle loading and error states
- Cache data appropriately
- Invalidate caches after mutations
- Use DevTools for debugging

### Don'ts ❌

- Don't use useState for server data
- Don't create new objects in query keys
- Don't ignore error handling
- Don't hardcode API URLs
- Don't forget to cancel queries on unmount
- Don't cache sensitive data
- Don't mix server and client state
- Don't bypass TanStack Query

## Example: Complete User Management

```typescript
// hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/api'

export const useGetUser = (userId: string) =>
  useQuery({
    queryKey: ['users', userId],
    queryFn: () => client.api.users[userId].get()
  })

export const useUpdateUser = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => client.api.users.me.put(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
    }
  })
}

// UserProfile.tsx
import { useGetUser, useUpdateUser } from '@/hooks/useUser'

export const UserProfile = ({ userId }) => {
  const { data: user, isLoading } = useGetUser(userId)
  const { mutate: updateUser, isPending } = useUpdateUser()

  if (isLoading) return <Spin />

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      updateUser(Object.fromEntries(formData))
    }}>
      <input defaultValue={user?.name} name="name" />
      <button disabled={isPending}>Save</button>
    </form>
  )
}
```

## Next Steps

- [Internationalization Guide](./internationalization.md) - Multi-language setup
- [Testing Guide](./testing.md) - Testing queries and mutations
- [API Reference](../backend/api-reference.md) - Available endpoints
- [TanStack Query Docs](https://tanstack.com/query/latest) - Official documentation

---

**Last Updated**: December 2024
