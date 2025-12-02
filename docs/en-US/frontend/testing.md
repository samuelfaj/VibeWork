# Frontend Testing Guide

Guide to testing React components and E2E testing.

## Testing Strategy

```
┌────────────────────────┐
│   E2E Tests            │  Playwright
│   (User workflows)     │  ~10 tests
└────────────────────────┘

┌────────────────────────┐
│   Component Tests      │  Vitest + RTL
│   (Component behavior) │  ~30 tests
└────────────────────────┘

┌────────────────────────┐
│   Unit Tests           │  Vitest
│   (Functions/hooks)    │  ~50 tests
└────────────────────────┘
```

## Component Testing

### Setup

**Test utilities:** `@testing-library/react`, `@testing-library/user-event`

```bash
bun run test
```

### Test Structure

**File location:** `src/features/auth/__tests__/LoginForm.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

describe('LoginForm', () => {
  it('should render form fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = vi.fn()

    render(<LoginForm onSuccess={mockOnSuccess} />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /login/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should show error message on failure', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /login/i })
    await user.click(submitButton)

    expect(await screen.findByText(/error/i)).toBeInTheDocument()
  })
})
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useLogin } from '../hooks'

describe('useLogin hook', () => {
  it('should set loading state during mutation', async () => {
    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.mutate({ email: 'test@example.com', password: 'pass' })
    })

    expect(result.current.isPending).toBe(true)

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })
  })
})
```

## Testing Queries (TanStack Query)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'

const mockQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
})

const renderWithQuery = (component: ReactNode) =>
  render(
    <QueryClientProvider client={mockQueryClient}>
      {component}
    </QueryClientProvider>
  )

it('should fetch and display user data', async () => {
  const mockUser = { id: '1', name: 'John', email: 'john@example.com' }

  vi.mocked(client.api.users.me.get).mockResolvedValueOnce(mockUser)

  renderWithQuery(<UserProfile />)

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument()
  })
})
```

## E2E Testing

### Playwright Setup

**Config:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
})
```

### E2E Test Example

**File:** `e2e/tests/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should sign up new user', async ({ page }) => {
    // Navigate to signup
    await page.goto('/')
    await page.click('text=Sign Up')

    // Fill form
    await page.fill('input[name=email]', `user${Date.now()}@example.com`)
    await page.fill('input[name=password]', 'SecurePassword123!')

    // Submit
    await page.click('button[type=submit]')

    // Verify success
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('should login existing user', async ({ page }) => {
    await page.goto('/')

    // Click login link
    await page.click('text=Log In')

    // Fill credentials
    await page.fill('input[name=email]', 'test@example.com')
    await page.fill('input[name=password]', 'password123')

    // Submit
    await page.click('button[type=submit]')

    // Verify dashboard visible
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Log In')

    await page.fill('input[name=email]', 'invalid@example.com')
    await page.fill('input[name=password]', 'wrongpassword')
    await page.click('button[type=submit]')

    // Expect error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
  })
})
```

### Running E2E Tests

```bash
# Run all tests
bun run test:e2e

# Run specific test
bun run test:e2e tests/auth.spec.ts

# Run in headed mode (see browser)
bun run test:e2e:headed

# Debug mode
bun run test:e2e:debug

# Generate report
bun run test:e2e:report
```

## Mocking

### Mock API Calls

```typescript
import { vi } from 'vitest'
import { client } from '@/lib/api'

vi.mock('@/lib/api', () => ({
  client: {
    api: {
      auth: {
        'sign-in': {
          email: {
            post: vi.fn(),
          },
        },
      },
    },
  },
}))

it('should handle login', async () => {
  vi.mocked(client.api.auth['sign-in'].email.post).mockResolvedValueOnce({
    user: { id: '1', email: 'test@example.com' },
    session: { id: 'session_123' },
  })

  // Test code
})
```

### Mock Components

```typescript
vi.mock('@/components/Loading', () => ({
  Loading: () => <div>Mock Loading</div>
}))
```

## Snapshot Testing

For UI components, use snapshots carefully:

```typescript
it('should match snapshot', () => {
  const { container } = render(<LoginForm />)
  expect(container).toMatchSnapshot()
})
```

**Use snapshots for:**

- Static components
- Component structure

**Don't use for:**

- Dynamic content
- Frequently changing UI
- Lists with data

## Visual Regression Testing

With Playwright:

```typescript
test('should match visual snapshot', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot()
})
```

Run: `bun run test:e2e -- --update-snapshots`

## Coverage

### Generate Report

```bash
bun run test:coverage
```

Opens `coverage/index.html`

### Coverage Thresholds

- **Lines**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Statements**: 80%+

### Ignore Coverage

```typescript
// Only in test files
/* c8 ignore next 3 */
if (someCondition) {
  // Hard to test scenario
}
```

## Best Practices

### Do's ✅

- Test user behavior, not implementation
- Use `user-event` not `fireEvent`
- Query by role, label, placeholder
- Wait for async operations
- Clean up after tests
- Test accessibility
- Mock external dependencies
- Keep tests focused (one thing per test)

### Don'ts ❌

- Test implementation details
- Use `fireEvent` for user interactions
- Query by CSS class or ID
- Use `setTimeout` in tests
- Leave tests in pending state
- Test third-party libraries
- Test framework behavior

## Example: Complete Test Suite

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { LoginForm } from './LoginForm'
import * as api from '@/lib/api'

vi.mock('@/lib/api')

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form with email and password fields', () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should submit form and call onSuccess', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    vi.mocked(api.client.api.auth['sign-in'].email.post).mockResolvedValueOnce({
      user: { id: '1' },
      session: { id: 'session_123' }
    })

    render(<LoginForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should show error on failed login', async () => {
    const user = userEvent.setup()

    vi.mocked(api.client.api.auth['sign-in'].email.post).mockRejectedValueOnce(
      new Error('Invalid credentials')
    )

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /login/i }))

    expect(await screen.findByText(/error/i)).toBeInTheDocument()
  })
})
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run tests
  run: bun run test

- name: Run E2E tests
  run: bun run test:e2e

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/coverage-final.json
```

---

**Last Updated**: December 2024
