# Frontend Documentation

The VibeWork frontend is a modern React SPA built with Vite. This section covers frontend development.

## Quick Navigation

- **[Frontend Setup](./setup.md)** - Installation and configuration
- **[Components](./components.md)** - UI components and patterns
- **[State Management](./state-management.md)** - TanStack Query setup
- **[Internationalization](./internationalization.md)** - i18n configuration
- **[Testing](./testing.md)** - Component and E2E testing

## Overview

The frontend provides:

- User authentication interface
- Responsive web application
- Type-safe API calls
- Multi-language support
- Real-time updates via TanStack Query

## Architecture

```
frontend/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root component
│   ├── features/             # Feature modules
│   │   └── auth/             # Authentication
│   │       ├── LoginForm.tsx
│   │       ├── SignupForm.tsx
│   │       ├── hooks.ts
│   │       └── index.ts
│   ├── lib/                  # Utilities
│   │   ├── api.ts            # Eden RPC client
│   │   ├── query.ts          # TanStack Query config
│   │   └── AntdProvider.tsx  # Theme provider
│   ├── i18n/                 # Internationalization
│   │   ├── index.ts
│   │   └── locales/          # Translation files
│   └── __tests__/            # Tests
├── dist/                     # Build output
├── public/                   # Static assets
├── vite.config.ts            # Build config
├── playwright.config.ts      # E2E test config
└── CLAUDE.md                 # Original documentation
```

## Technology Stack

| Technology           | Purpose                 |
| -------------------- | ----------------------- |
| **React 18**         | UI framework            |
| **Vite**             | Build tool & dev server |
| **TypeScript**       | Type safety             |
| **Ant Design**       | UI components           |
| **TanStack Query 5** | Server state management |
| **Eden RPC**         | Type-safe API client    |
| **i18next**          | Internationalization    |
| **Vitest**           | Unit testing            |
| **Playwright**       | E2E testing             |

## Key Features

### 1. Type-Safe API Calls

- **Eden RPC**: Compile-time type validation
- **Contract Schemas**: Shared with backend
- **Auto-completion**: IDE support
- **Runtime Validation**: Schema checking

### 2. Server State Management

- **TanStack Query**: Automatic caching
- **Background Refetching**: Keep data fresh
- **Optimistic Updates**: Instant UI feedback
- **Pagination**: Efficient data loading

### 3. Authentication

- **Session-based**: HTTP-only cookies
- **Protected Routes**: Auth gating
- **Login/Signup Forms**: Built-in validation
- **User Context**: Global auth state

### 4. Multi-Language Support

- **i18next**: Full i18n setup
- **Language Detection**: Auto-detect browser language
- **Locale Switching**: Dynamic language selection
- **Translation Files**: en, pt-BR

### 5. Responsive Design

- **Ant Design**: Mobile-first components
- **Tailwind CSS**: Utility styling (optional)
- **Breakpoints**: Mobile, tablet, desktop
- **Accessible**: WCAG compliant

## Common Tasks

### Setup Development Environment

```bash
cd frontend
bun install
bun run dev
```

Open http://localhost:5173

### Build for Production

```bash
bun run build
# Output: dist/
```

### Run Tests

```bash
bun run test           # Unit tests
bun run test:watch    # Watch mode
bun run test:coverage # Coverage report
```

### Run E2E Tests

```bash
bun run test:e2e      # Headless
bun run test:e2e:headed  # With browser
bun run test:e2e:debug   # Debug mode
```

### Code Quality

```bash
bun run lint          # Check for issues
bun run lint:fix      # Auto-fix
bun run typecheck     # Type checking
bun run format        # Code formatting
```

## Project Structure Explained

### `/src` - Source Code

**main.tsx**

- Vite entry point
- React DOM render
- QueryClientProvider setup

**App.tsx**

- Root component
- Route definitions
- Layout wrapper

**`features/`**

- Feature modules
- Login/signup forms
- Page components
- Hooks for mutations

**`lib/`**

- API client (Eden RPC)
- Query configuration
- Theme provider
- Utility functions

**`i18n/`**

- i18next configuration
- Translation files
- Language detection

### `/public` - Static Assets

```
public/
├── favicon.ico
├── images/
├── fonts/
└── logo.png
```

## Environment Configuration

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=10000
VITE_ENVIRONMENT=development
```

**Build time variables:**

- Must be prefixed with `VITE_`
- Available via `import.meta.env.VITE_*`
- Embedded in bundle during build

### Using Environment Variables

```typescript
const API_URL = import.meta.env.VITE_API_URL
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT

// Or access all env vars
const env = import.meta.env
```

## File Structure Conventions

### Component Files

**Naming:**

- Components: PascalCase (LoginForm.tsx)
- Utilities: camelCase (apiClient.ts)
- Hooks: camelCase starting with 'use' (useQuery.ts)
- Types: .d.ts or exported from same file

**Structure:**

```typescript
import { ReactNode } from 'react'

interface ComponentProps {
  children: ReactNode
  // Props
}

export const Component = ({ children }: ComponentProps) => {
  return <div>{children}</div>
}
```

### Feature Modules

**Pattern:**

```
features/auth/
├── LoginForm.tsx     # Component
├── SignupForm.tsx    # Component
├── hooks.ts          # Mutations
├── types.ts          # Type definitions
└── index.ts          # Barrel export
```

**Barrel Export:**

```typescript
// features/auth/index.ts
export { LoginForm } from './LoginForm'
export { SignupForm } from './SignupForm'
export * from './hooks'
```

**Usage:**

```typescript
import { LoginForm, useLogin } from '@/features/auth'
```

## API Integration

### Eden RPC Client

```typescript
// lib/api.ts
import { treaty } from '@elysiajs/eden'
import type { App } from '@vibework/backend'

export const client = treaty<App>(import.meta.env.VITE_API_URL || 'http://localhost:3000')
```

**Type-Safe Calls:**

```typescript
const response = await client.api.auth['sign-in'].email.post({
  email: 'user@example.com',
  password: 'password123',
})
// TypeScript knows response shape automatically
```

## State Management

### TanStack Query Usage

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => client.api.users[userId].get(),
})

// Mutate data
const { mutate, isPending } = useMutation({
  mutationFn: (data) => client.api.users.post(data),
  onSuccess: () => {
    // Refetch or invalidate
  },
})
```

## Authentication Flow

### Login Process

```
LoginForm
    ↓
useLogin hook
    ↓
client.api.auth.sign-in.email.post()
    ↓
Backend validates
    ↓
Returns user + session cookie
    ↓
TanStack Query caches
    ↓
Redirect to dashboard
```

## Styling

### Ant Design Theme

Customized in `lib/AntdProvider.tsx`:

```typescript
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
      fontSize: 14,
      borderRadius: 6
    }
  }}
>
  <App />
</ConfigProvider>
```

## Testing

### Unit Tests

```bash
bun run test
```

Test components and hooks with Vitest.

### E2E Tests

```bash
bun run test:e2e
```

Test user flows with Playwright from `/e2e` workspace.

## Build and Deployment

### Development Build

```bash
bun run dev
```

Auto-reload on code changes.

### Production Build

```bash
bun run build
```

Creates optimized bundle in `dist/`.

**Build Output:**

```
dist/
├── index.html
├── assets/
│   ├── *.js
│   └── *.css
└── favicon.ico
```

### Preview Production Build

```bash
bun run preview
```

Serve built files locally.

## Performance Optimization

### Code Splitting

- Automatic via Vite
- Route-based splitting for large apps
- Dynamic imports for heavy components

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./Dashboard'))

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Image Optimization

- Use WebP format with fallbacks
- Lazy load below-fold images
- Serve responsive images

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: Modern browsers (iOS 12+, Android 8+)

## Accessibility

### WCAG Compliance

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Semantic HTML + ARIA
- **Color Contrast**: WCAG AA minimum
- **Focus Management**: Visible focus states

### Ant Design Accessibility

Ant Design components include:

- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast compliance

## Browser DevTools

### React DevTools

```bash
# Install browser extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools

# Inspect components
# View component props, state, context
```

### Redux/Query DevTools

```typescript
// In development, TanStack Query includes DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Environment Setup

### Required Versions

- Node.js 18+
- Bun 1.0+
- React 18+

### Installation

```bash
# Install dependencies
bun install

# Verify setup
bun --version
node --version
```

## Documentation References

- **Original**: `frontend/CLAUDE.md`
- **Components**: See `frontend/src/`
- **Tests**: See `e2e/` workspace

## Getting Help

- [Frontend Setup](./setup.md) - Environment configuration
- [Components Guide](./components.md) - UI components
- [State Management](./state-management.md) - Data fetching
- [Internationalization](./internationalization.md) - Translations
- [Testing Guide](./testing.md) - Test strategies
- [Architecture Overview](../architecture.md) - System design

---

**Last Updated**: December 2024
