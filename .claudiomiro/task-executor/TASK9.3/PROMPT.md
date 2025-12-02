## PROMPT
Configure Eden client for type-safe API calls, TanStack Query v5, and create React application entry points.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack, architecture

**You MUST read AI_PROMPT.md before executing this task.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/frontend/src/lib/api.ts`
- `/frontend/src/lib/query.ts`
- `/frontend/src/main.tsx`
- `/frontend/src/App.tsx`

### Patterns to Follow

**Eden client (api.ts):**
```typescript
import { treaty } from '@elysiajs/eden'
import type { App } from '@vibe/contract'

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const api = treaty<App>(baseUrl)
```

**TanStack Query setup (query.ts):**
```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
})
```

**main.tsx:**
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/query'
import App from './App'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

### Integration Points
- Uses types from `@vibe/contract` (TASK3)
- Connects to backend endpoints (TASK5/TASK6)
- i18n import from TASK9.2

## LAYER
4

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push
- Eden must provide full type inference from App type
- API base URL from environment variable
- Verify with `bun run typecheck`
