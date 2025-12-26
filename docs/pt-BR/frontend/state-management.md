# Guia de Gerenciamento de Estado do Frontend

Guia para gerenciar estado de servidor e cliente com TanStack Query.

## Estratégia de Gerenciamento de Estado

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

## Setup TanStack Query

### Configuração do QueryClient

**Localização:** `src/lib/query.ts`

```typescript
import { QueryClient, QueryClientProvider, DefaultOptions } from '@tanstack/react-query'

const queryConfig: DefaultOptions = {
  queries: {
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: 'stale',
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  },
  mutations: {
    retry: 1,
  },
}

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
})
```

**Configuração Explicada:**

| Opção                  | Propósito                           | Valor       |
| ---------------------- | ----------------------------------- | ----------- |
| `retry`                | Auto-retry de requests falhadas     | 1 tentativa |
| `refetchOnWindowFocus` | Refetch quando janela reganha foco  | true        |
| `staleTime`            | Quanto tempo os dados estão frescos | 5 minutos   |
| `gcTime`               | Garbage collection time             | 10 minutos  |

### Setup do Provider

**Localização:** `src/main.tsx`

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

### Hook useQuery

Buscar dados do servidor:

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

**Uso em Componente:**

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

### Opções de Query

**Polling (auto-refetch):**

```typescript
useQuery({
  queryKey: ['notifications'],
  queryFn: () => client.api.notifications.get(),
  refetchInterval: 5000, // Refetch a cada 5 segundos
})
```

**Desabilitar Auto-Refetch:**

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
  staleTime: Infinity, // Nunca fica stale
})
```

## Mutando Data

### Hook useMutation

Modificar dados no servidor:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { client } from '@/lib/api'

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => client.api.users.me.put(data),
    onSuccess: (updated) => {
      // Atualizar cache
      queryClient.setQueryData(['user', 'me'], updated)
      // Ou invalide para refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

**Uso em Componente:**

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
      {/* campos do formulário */}
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### Estados de Mutation

```typescript
const {
  mutate,
  isPending,        // Request em voo
  isError,          // Falhou
  error,            // Objeto de erro
  data,             // Resposta de sucesso
  status,           // 'idle' | 'pending' | 'error' | 'success'
  reset             // Limpar estado
} = useMutation(...)
```

## Gerenciamento de Cache

### Invalidar Queries

Force refetch invalidando cache:

```typescript
const queryClient = useQueryClient()

// Invalidar query específica
queryClient.invalidateQueries({ queryKey: ['users', userId] })

// Invalidar todas as queries com prefixo
queryClient.invalidateQueries({ queryKey: ['users'] })

// Invalidar todas as queries
queryClient.invalidateQueries()
```

### Atualizar Cache Manualmente

Atualizar cache sem refetch:

```typescript
const queryClient = useQueryClient()

// Obtenha dados em cache
const user = queryClient.getQueryData(['users', userId])

// Atualizar cache
queryClient.setQueryData(['users', userId], {
  ...user,
  name: 'Updated Name',
})
```

### Query Keys

**Convenção:** Arrays hierárquicos

```typescript
// User queries
;['users'][('users', userId)][('users', userId, 'posts')][('users', userId, 'posts', postId)][ // Todos os usuários // Usuário específico // Posts do usuário // Post específico
  // Notifications
  'notifications'
][('notifications', userId)][('notifications', userId, 'unread')] // Todas as notificações // Notificações do usuário // Não lidas
```

## Optimistic Updates

Atualize UI antes do servidor confirmar:

```typescript
const { mutate: updateUser } = useMutation({
  mutationFn: (newData) => client.api.users.me.put(newData),
  onMutate: async (newData) => {
    // Cancele queries em andamento
    await queryClient.cancelQueries({ queryKey: ['user', 'me'] })

    // Obtenha dados antigos
    const oldData = queryClient.getQueryData(['user', 'me'])

    // Atualizar cache imediatamente
    queryClient.setQueryData(['user', 'me'], {
      ...oldData,
      ...newData,
    })

    // Retorne contexto para rollback
    return { oldData }
  },
  onError: (_error, _newData, context) => {
    // Rollback em erro
    queryClient.setQueryData(['user', 'me'], context.oldData)
  },
  onSuccess: () => {
    // Re-validate cache em sucesso
    queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
  },
})
```

## Paginação

### Paginação Baseada em Query

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

### Infinite Query (Carregar Mais)

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

## Tratamento de Erro

### Tratar Erros em useQuery

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

### Tratar Erros em useMutation

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

### Tratamento Global de Erro

```typescript
// lib/query.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Não retry erros 4xx
        if (error.status >= 400 && error.status < 500) {
          return false
        }
        return failureCount < 1
      }
    }
  }
})

// Em main.tsx
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

### Instalação

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

### Uso

- Clique no ícone de DevTools no canto inferior direito
- Inspecione estado de cache
- Refetch/reset queries
- Veja histórico de queries

## Client State

### useState para Client State

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

### useCallback para Estabilidade

```typescript
const handleFilterChange = useCallback(
  (newFilters) => {
    setFilters(newFilters)
    // Refetch data com novos filtros
    queryClient.invalidateQueries({
      queryKey: ['notifications'],
    })
  },
  [queryClient]
)
```

## Otimização de Performance

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

### Otimização de Query

```typescript
// Bom: Query key específica
useQuery({
  queryKey: ['users', userId, 'posts', { status: 'published' }],
  queryFn: () => client.api.users[userId].posts.get({ status: 'published' })
})

// Evite: Objetos mudando causam cache misses
useQuery({
  queryKey: ['posts', { status: 'published' }], // Cria novo objeto cada render
  queryFn: () => {...}
})

// Melhor: Referência de objeto estável
const filters = useMemo(
  () => ({ status: 'published' }),
  []
)
const { data } = useQuery({
  queryKey: ['posts', filters],
  queryFn: () => client.api.posts.get(filters)
})
```

## Melhores Práticas

### Do's ✅

- Use TanStack Query para server state
- Mantenha query keys organizadas hierarquicamente
- Use mutations para create/update/delete
- Implemente optimistic updates
- Trate estados de carregamento e erro
- Cache dados apropriadamente
- Invalide caches após mutations
- Use DevTools para debugging

### Don'ts ❌

- Não use useState para dados de servidor
- Não crie novos objetos em query keys
- Não ignore tratamento de erro
- Não hardcode URLs de API
- Não esqueça de cancelar queries em unmount
- Não cache dados sensíveis
- Não misture server e client state
- Não pule TanStack Query

## Exemplo: Gerenciamento Completo de Usuário

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

## Próximos Passos

- [Guia de Internacionalização](./internationalization.md) - Setup multi-idioma
- [Guia de Testes](./testing.md) - Testes de queries e mutations
- [Referência de API](../backend/api-reference.md) - Endpoints disponíveis
- [Docs TanStack Query](https://tanstack.com/query/latest) - Documentação oficial

---

**Última Atualização**: Dezembro 2024
