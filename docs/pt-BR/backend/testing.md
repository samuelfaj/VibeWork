# Guia de Testes do Backend

Guia abrangente para testes de código backend.

## Estratégia de Testes

VibeWork usa uma abordagem de testes em três níveis:

```
┌─────────────────────────────────────────┐
│         E2E Tests (Playwright)          │  Poucos, alto-nível
│      Full app from user perspective     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│    Integration Tests (Vitest + Docker)  │  Alguns, dependências reais
│     API routes with real databases      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────┴──────────────────────┐
│      Unit Tests (Vitest + Mocks)        │  Muitos, isolados
│         Functions & services            │
└─────────────────────────────────────────┘

Meta de Cobertura: 80%+
```

## Testes Unitários

### Setup

**Test Runner:** Vitest
**Config:** `backend/vitest.config.ts`
**Localização:** `**/__tests__/` directories

### Executar Testes Unitários

```bash
cd backend

# Execute todos os testes unitários
bun run test

# Modo watch (re-execute automático em mudanças)
bun run test:watch

# Execute arquivo específico
bun run test users/__tests__/service.test.ts

# Gere relatório de cobertura
bun run test:coverage

# Verifique threshold de cobertura (80%)
bun run test:coverage:check
```

### Estrutura de Teste

**Padrão de Arquivo:** `*.test.ts` or `*.spec.ts`

```typescript
// modules/users/__tests__/service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userService } from '@/modules/users'

describe('userService', () => {
  describe('create', () => {
    it('should create a user with valid input', async () => {
      const user = await userService.create({
        email: 'test@example.com',
        password: 'securepassword123',
      })

      expect(user.id).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.passwordHash).toBeDefined()
      expect(user.passwordHash).not.toBe('securepassword123')
    })

    it('should throw error for duplicate email', async () => {
      await userService.create({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(async () => {
        await userService.create({
          email: 'test@example.com',
          password: 'password456',
        })
      }).rejects.toThrow('Email already exists')
    })

    it('should validate password strength', async () => {
      expect(async () => {
        await userService.create({
          email: 'test@example.com',
          password: '123',
        })
      }).rejects.toThrow('Password too weak')
    })
  })

  describe('findById', () => {
    it('should return user by id', async () => {
      const created = await userService.create({
        email: 'test@example.com',
        password: 'password123',
      })

      const found = await userService.findById(created.id)

      expect(found.id).toBe(created.id)
      expect(found.email).toBe('test@example.com')
    })

    it('should return null for non-existent user', async () => {
      const user = await userService.findById('non_existent')

      expect(user).toBeNull()
    })
  })
})
```

### Mocking

**Mock Functions:**

```typescript
import { vi } from 'vitest'

const mockDb = {
  insert: vi.fn(),
  query: vi.fn(),
  update: vi.fn(),
}

// Set return value
mockDb.insert.mockResolvedValue({ id: '123' })

// Verify was called
expect(mockDb.insert).toHaveBeenCalledWith({
  email: 'test@example.com',
})

// Check call count
expect(mockDb.insert).toHaveBeenCalledTimes(1)
```

**Mock Modules:**

```typescript
import { vi } from 'vitest'

vi.mock('@/infra/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}))
```

### Fixtures

**Setup & Teardown:**

```typescript
import { beforeEach, afterEach } from 'vitest'

describe('userService', () => {
  let testUser: any

  beforeEach(async () => {
    // Setup antes de cada teste
    testUser = await userService.create({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  afterEach(async () => {
    // Cleanup após cada teste
    await userService.delete(testUser.id)
  })

  it('should update user', async () => {
    await userService.update(testUser.id, {
      name: 'Updated Name',
    })

    const updated = await userService.findById(testUser.id)
    expect(updated.name).toBe('Updated Name')
  })
})
```

## Testes de Integração

### Setup

**Test Runner:** Vitest
**Config:** `backend/vitest.integration.config.ts`
**Containers:** Testcontainers para MySQL, MongoDB

### Executar Testes de Integração

```bash
cd backend

# Execute testes de integração
bun run test:integration

# Modo watch
bun run test:integration:watch

# Arquivo específico
bun run test:integration modules/users/__tests__/integration.test.ts

# Relatório de cobertura
bun run test:integration:coverage
```

### Estrutura de Teste

**Padrão de Arquivo:** `*.integration.test.ts`

```typescript
// modules/users/__tests__/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { MySQLContainer } from '@testcontainers/mysql'
import { startServices } from '@/tests/setup'
import { userService } from '@/modules/users'

describe('userService integration', () => {
  let container: MySQLContainer
  let services: any

  beforeAll(async () => {
    // Inicie MySQL container
    container = await new MySQLContainer({
      environment: {
        MYSQL_ROOT_PASSWORD: 'password',
        MYSQL_DATABASE: 'test_db',
      },
    }).start()

    // Initialize serviços com banco de dados de teste
    services = await startServices({
      mysqlUrl: container.getConnectionUri(),
    })

    // Execute migrações
    await services.db.migrate()
  })

  afterAll(async () => {
    // Cleanup
    await container.stop()
  })

  it('should create and persist user', async () => {
    const user = await userService.create({
      email: 'test@example.com',
      password: 'password123',
    })

    // Busque banco de dados diretamente
    const [found] = await services.db.query('SELECT * FROM users WHERE id = ?', [user.id])

    expect(found).toBeDefined()
    expect(found.email).toBe('test@example.com')
    expect(found.password_hash).not.toBe('password123') // Hashed
  })

  it('should handle concurrent user creation', async () => {
    const promises = Array(5)
      .fill(null)
      .map((_, i) =>
        userService.create({
          email: `user${i}@example.com`,
          password: 'password123',
        })
      )

    const results = await Promise.all(promises)

    expect(results).toHaveLength(5)
    expect(results.every((r) => r.id)).toBe(true)
  })
})
```

### Testes de Banco de Dados

**MySQL com Testcontainers:**

```typescript
import { MySQLContainer } from '@testcontainers/mysql'

const container = await new MySQLContainer({
  environment: {
    MYSQL_ROOT_PASSWORD: 'root',
    MYSQL_DATABASE: 'test_db',
  },
}).start()

const connection = await mysql.createConnection({
  host: container.getHost(),
  port: container.getPort(),
  user: 'root',
  password: 'root',
  database: 'test_db',
})
```

**MongoDB com Testcontainers:**

```typescript
import { MongoDBContainer } from '@testcontainers/mongodb'

const container = await new MongoDBContainer().start()

const connection = await mongoose.connect(container.getConnectionString())
```

## Testes E2E

### Setup

**Test Runner:** Playwright
**Localização:** `/e2e` workspace
**Config:** `playwright.config.ts`

### Executar Testes E2E

```bash
# Execute todos os testes E2E (headless)
bun run test:e2e

# Execute teste específico
bun run test:e2e tests/auth.spec.ts

# Execute em headed mode (veja browser)
bun run test:e2e:headed

# Modo debug (step through)
bun run test:e2e:debug

# Gere relatório de teste
bun run test:e2e:report
```

### Exemplos de Teste

**Auth Flow Test:**

```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('should sign up new user', async ({ page }) => {
    // Click signup link
    await page.click('text=Sign Up')

    // Fill form
    await page.fill('input[name=email]', 'newuser@example.com')
    await page.fill('input[name=password]', 'SecurePassword123!')

    // Submit
    await page.click('button[type=submit]')

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('should login existing user', async ({ page }) => {
    // Click login
    await page.click('text=Log In')

    // Fill credentials
    await page.fill('input[name=email]', 'user@example.com')
    await page.fill('input[name=password]', 'Password123!')

    // Submit
    await page.click('button[type=submit]')

    // Verify logged in
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should logout user', async ({ page }) => {
    // Login first
    await loginUser(page, 'user@example.com', 'Password123!')

    // Click logout
    await page.click('text=Logout')

    // Verify redirected
    await expect(page).toHaveURL(/\/login/)
  })
})

async function loginUser(page, email, password) {
  await page.click('text=Log In')
  await page.fill('input[name=email]', email)
  await page.fill('input[name=password]', password)
  await page.click('button[type=submit]')
  await page.waitForNavigation()
}
```

## Metas de Cobertura

### Target Coverage

- **Lines**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Statements**: 80%+

### Gere Relatório de Cobertura

```bash
bun run test:coverage

# Relatório HTML
open coverage/index.html
```

### Caminhos Críticos para Cobrir

**Devem ter testes:**

- Fluxos de autenticação (signup, login, logout)
- Verificações de autorização
- Tratamento de erro
- Operações de banco de dados
- Endpoints de API
- Lógica de negócios

**Devem ter testes:**

- Edge cases
- Validação de entrada
- Operações de cache
- Mensagens de Pub/Sub
- Envio de email

## Integração Contínua

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: test_db
          MYSQL_ROOT_PASSWORD: root

    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bun run test

      - name: Run integration tests
        run: bun run test:integration

      - name: Upload coverage
        run: bun run test:coverage

      - name: Run E2E tests
        run: bun run test:e2e
```

## Melhores Práticas de Testes

### Do's ✅

- **Teste comportamento, não implementação** - Foque no o quê, não no como
- **Mantenha testes isolados** - Sem interdependências entre testes
- **Use nomes descritivos** - Claro o que está sendo testado
- **Padrão Arrange-Act-Assert** - Estrutura de teste clara
- **Mock dependências externas** - Foque na unidade sob teste
- **Teste casos de erro** - Não apenas happy paths
- **Use fixtures para setup comum** - Princípio DRY
- **Mantenha testes rápidos** - Devem executar em segundos

### Don'ts ❌

- **Não teste frameworks** - Confie em Elysia, Drizzle, etc.
- **Não teste bibliotecas de terceiros** - A menos que esteja envolvendo-as
- **Não use serviços reais em testes** - Mock ou containerize
- **Não escreva testes que dependem da ordem** - Cada teste standalone
- **Não ignore falhas de teste** - Corrija imediatamente
- **Não teste detalhes de implementação** - Teste API pública
- **Não copie código de teste** - Crie utilitários de teste compartilhados

## Padrões Comuns de Testes

### Testando Routes

```typescript
import { app } from '@/app'

it('should create notification', async () => {
  const response = await app.handle(
    new Request('http://localhost:3000/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'session=test_session_123',
      },
      body: JSON.stringify({
        title: 'Test',
        message: 'Test notification',
        type: 'email',
        userId: 'user_123',
      }),
    })
  )

  expect(response.status).toBe(201)
  const data = await response.json()
  expect(data.id).toBeDefined()
})
```

### Testando Services

```typescript
it('should call cache before database', async () => {
  const cache = { get: vi.fn().mockResolvedValue(null) }
  const db = { query: vi.fn().mockResolvedValue(user) }

  const user = await userService.findById('user_123', {
    cache,
    db,
  })

  expect(cache.get).toHaveBeenCalledWith('user:user_123')
  expect(db.query).toHaveBeenCalled()
})
```

## Debugging de Testes

### Ver Saída de Testes

```bash
# Saída verbose
bun run test -- --reporter=verbose

# Mostre apenas falhas
bun run test -- --reporter=verbose --reporter.mode=only-failed

# Debug teste específico
bun run test -- --inspect-brk modules/users/__tests__/service.test.ts
```

### Debug em IDE

**VS Code:**
Crie `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "bun",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal",
  "cwd": "${workspaceFolder}/backend"
}
```

## Próximos Passos

- **[Backend Setup](./setup.md)** - Configure ambiente
- **[Referência de API](./api-reference.md)** - Teste as APIs
- **[Guia de Banco de Dados](./database.md)** - Entenda modelos de dados
- **[Guia CI/CD](../deployment.md)** - Testes automatizados

---

**Última Atualização**: Dezembro 2024
