# Guia de Testes do Frontend

Guia para testes de componentes React e testes E2E.

## Estratégia de Testes

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

## Testes de Componentes

### Setup

**Utilitários de teste:** `@testing-library/react`, `@testing-library/user-event`

```bash
bun run test
```

### Estrutura de Teste

**Localização de arquivo:** `src/features/auth/__tests__/LoginForm.test.tsx`

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

### Testando Hooks

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

## Testando Queries (TanStack Query)

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

## Testes E2E

### Setup do Playwright

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

### Exemplo de Teste E2E

**Arquivo:** `e2e/tests/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should sign up new user', async ({ page }) => {
    // Navegue para signup
    await page.goto('/')
    await page.click('text=Sign Up')

    // Preencha formulário
    await page.fill('input[name=email]', `user${Date.now()}@example.com`)
    await page.fill('input[name=password]', 'SecurePassword123!')

    // Submit
    await page.click('button[type=submit]')

    // Verifique sucesso
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('should login existing user', async ({ page }) => {
    await page.goto('/')

    // Clique em login link
    await page.click('text=Log In')

    // Preencha credenciais
    await page.fill('input[name=email]', 'test@example.com')
    await page.fill('input[name=password]', 'password123')

    // Submit
    await page.click('button[type=submit]')

    // Verifique dashboard visível
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

### Executando Testes E2E

```bash
# Execute todos os testes
bun run test:e2e

# Execute teste específico
bun run test:e2e tests/auth.spec.ts

# Execute em headed mode (veja navegador)
bun run test:e2e:headed

# Modo debug
bun run test:e2e:debug

# Gere relatório
bun run test:e2e:report
```

## Mocking

### Mock de Chamadas de API

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

  // Código de teste
})
```

### Mock de Componentes

```typescript
vi.mock('@/components/Loading', () => ({
  Loading: () => <div>Mock Loading</div>
}))
```

## Snapshot Testing

Para componentes de UI, use snapshots com cuidado:

```typescript
it('should match snapshot', () => {
  const { container } = render(<LoginForm />)
  expect(container).toMatchSnapshot()
})
```

**Use snapshots para:**

- Componentes estáticos
- Estrutura de componente

**Não use para:**

- Conteúdo dinâmico
- UI que muda frequentemente
- Listas com dados

## Visual Regression Testing

Com Playwright:

```typescript
test('should match visual snapshot', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot()
})
```

Execute: `bun run test:e2e -- --update-snapshots`

## Coverage

### Gerar Relatório

```bash
bun run test:coverage
```

Abre `coverage/index.html`

### Thresholds de Coverage

- **Lines**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Statements**: 80%+

### Ignorar Coverage

```typescript
// Apenas em arquivos de teste
/* c8 ignore next 3 */
if (someCondition) {
  // Cenário difícil de testar
}
```

## Melhores Práticas

### Do's ✅

- Teste comportamento do usuário, não implementação
- Use `user-event` não `fireEvent`
- Query por role, label, placeholder
- Aguarde operações async
- Limpe após testes
- Teste acessibilidade
- Mock dependências externas
- Mantenha testes focados (uma coisa por teste)

### Don'ts ❌

- Teste detalhes de implementação
- Use `fireEvent` para interações do usuário
- Query por classe CSS ou ID
- Use `setTimeout` em testes
- Deixe testes em estado pending
- Teste bibliotecas de terceiros
- Teste comportamento de framework

## Exemplo: Suite de Teste Completa

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

## Integração CI/CD

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

**Última Atualização**: Dezembro 2024
