# Documentação do Pacote Contract

Guia para shared TypeBox schemas para type safety end-to-end.

## Visão Geral

O pacote `@vibe-code/contract` contém schemas TypeBox para contratos de API. Estes garantem type safety entre frontend e backend.

## Localização

```
shared/contract/
├── src/
│   ├── index.ts          # Barrel export
│   ├── user.ts           # Schemas de usuário
│   ├── notification.ts   # Schemas de notificação
│   └── __tests__/
├── dist/                 # Tipos construídos
└── package.json
```

## TypeBox

TypeBox é uma biblioteca de validação de schema TypeScript-first.

### Tipo Básico

```typescript
import { Type, Static } from '@sinclair/typebox'

// Define schema
export const User = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.String({ minLength: 1 }),
  createdAt: Type.String({ format: 'date-time' }),
})

// Get tipo TypeScript
type User = Static<typeof User>
// Equivalente a:
// type User = {
//   id: string
//   email: string
//   name: string
//   createdAt: string
// }
```

## Schemas de Usuário

**Arquivo:** `src/user.ts`

```typescript
import { Type, Static } from '@sinclair/typebox'

// Requisição de signup
export const SignupRequest = Type.Object({
  email: Type.String({
    format: 'email',
    description: 'Endereço de email do usuário',
  }),
  password: Type.String({
    minLength: 8,
    maxLength: 128,
    description: 'Senha do usuário (mín 8 chars)',
  }),
})

export type SignupRequest = Static<typeof SignupRequest>

// Resposta de usuário
export const UserResponse = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.Optional(Type.String()),
  image: Type.Optional(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
})

export type UserResponse = Static<typeof UserResponse>

// Requisição de login
export const LoginRequest = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 1 }),
})

export type LoginRequest = Static<typeof LoginRequest>

// Session
export const Session = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  expiresAt: Type.String({ format: 'date-time' }),
})

export type Session = Static<typeof Session>

// Resposta de auth
export const AuthResponse = Type.Object({
  user: UserResponse,
  session: Session,
})

export type AuthResponse = Static<typeof AuthResponse>
```

## Schemas de Notificação

**Arquivo:** `src/notification.ts`

```typescript
import { Type, Static } from '@sinclair/typebox'

// Requisição de criar notificação
export const CreateNotificationRequest = Type.Object({
  title: Type.String({ minLength: 1 }),
  message: Type.String({ minLength: 1 }),
  type: Type.Enum({
    email: 'email',
    push: 'push',
    in_app: 'in-app',
  }),
  userId: Type.String(),
  metadata: Type.Optional(Type.Object({})),
})

export type CreateNotificationRequest = Static<typeof CreateNotificationRequest>

// Resposta de notificação
export const NotificationResponse = Type.Object({
  id: Type.String(),
  title: Type.String(),
  message: Type.String(),
  type: Type.String(),
  userId: Type.String(),
  read: Type.Boolean({ default: false }),
  readAt: Type.Optional(Type.String({ format: 'date-time' })),
  sentAt: Type.Optional(Type.String({ format: 'date-time' })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
})

export type NotificationResponse = Static<typeof NotificationResponse>

// Resposta de lista com paginação
export const PaginatedNotifications = Type.Object({
  data: Type.Array(NotificationResponse),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    hasMore: Type.Boolean(),
  }),
})

export type PaginatedNotifications = Static<typeof PaginatedNotifications>
```

## Usando Schemas no Backend

### Rotas Elysia

```typescript
import { Elysia } from 'elysia'
import { SignupRequest, AuthResponse } from '@vibe-code/contract'

export const authRoutes = new Elysia().post(
  '/sign-up',
  async ({ body }) => {
    // body é tipado como SignupRequest
    const response = await signupUser(body)
    // Deve retornar AuthResponse
    return response
  },
  {
    body: SignupRequest,
    response: AuthResponse,
  }
)
```

### Type Safety

- ElysiaJS valida contra schema
- Request é tipado
- Response é tipado
- Documentação Swagger auto-gerada

## Usando Schemas no Frontend

### Cliente Eden RPC

Eden automaticamente tipa baseado em rotas do backend:

```typescript
import { client } from '@/lib/api'
import type { AuthResponse } from '@vibe-code/contract'

// Chamada type-safe
const response = await client.api.auth['sign-up'].post({
  email: 'test@example.com',
  password: 'SecurePassword123!',
})

// response é tipado como AuthResponse
console.log(response.user.id)
```

### Validação

Valide dados antes de enviar:

```typescript
import { Value } from '@sinclair/typebox/value'
import { SignupRequest } from '@vibe-code/contract'

const data = {
  email: 'test@example.com',
  password: 'password',
}

if (Value.Check(SignupRequest, data)) {
  // Válido - envie para backend
  await client.api.auth['sign-up'].post(data)
} else {
  // Inválido - mostre erros
  const errors = [...Value.Errors(SignupRequest, data)]
  console.error(errors)
}
```

## Composição de Schema

### Estender Schemas

```typescript
import { Type, Static } from '@sinclair/typebox'

const BaseUser = Type.Object({
  id: Type.String(),
  email: Type.String(),
})

// Estenda com propriedades adicionais
const FullUser = Type.Composite([
  BaseUser,
  Type.Object({
    name: Type.String(),
    createdAt: Type.String(),
  }),
])

// Ou use spread
const FullUser2 = Type.Object({
  ...BaseUser.properties,
  name: Type.String(),
  createdAt: Type.String(),
})
```

### Campos Opcionais

```typescript
// Propriedade opcional
export const User = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.Optional(Type.String()),
})

// Ou com padrão
export const UserWithDefaults = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.String({ default: '' }),
})
```

### Campos Condicionais

```typescript
// Tipo Union
export const NotificationPayload = Type.Union([
  Type.Object({
    type: Type.Literal('email'),
    recipientEmail: Type.String({ format: 'email' }),
  }),
  Type.Object({
    type: Type.Literal('push'),
    deviceToken: Type.String(),
  }),
  Type.Object({
    type: Type.Literal('in-app'),
    userId: Type.String(),
  }),
])
```

## Validação de Schema

### Validação em Runtime

```typescript
import { Value } from '@sinclair/typebox/value'
import { UserResponse } from '@vibe-code/contract'

const data = JSON.parse(apiResponse)

if (!Value.Check(UserResponse, data)) {
  const errors = [...Value.Errors(UserResponse, data)]
  console.error('Invalid response:', errors)
}
```

### Validadores Customizados

```typescript
import { Type, Custom } from '@sinclair/typebox'

// Formato customizado
export const StrongPassword = Type.String({
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
})

// Ou com validador customizado
const StrongPassword2 = Custom<string>((schema, value) => {
  // Lógica de validação
  return typeof value === 'string' && value.length >= 8
})
```

## Testando Schemas

```typescript
import { describe, it, expect } from 'vitest'
import { Value } from '@sinclair/typebox/value'
import { SignupRequest } from '@vibe-code/contract'

describe('SignupRequest schema', () => {
  it('should accept valid signup data', () => {
    const data = {
      email: 'test@example.com',
      password: 'SecurePassword123',
    }

    expect(Value.Check(SignupRequest, data)).toBe(true)
  })

  it('should reject invalid email', () => {
    const data = {
      email: 'invalid-email',
      password: 'SecurePassword123',
    }

    expect(Value.Check(SignupRequest, data)).toBe(false)
  })

  it('should reject short password', () => {
    const data = {
      email: 'test@example.com',
      password: 'short',
    }

    expect(Value.Check(SignupRequest, data)).toBe(false)
  })
})
```

## Melhores Práticas

### Do's ✅

- Defina todos os contratos de API no pacote contract
- Use nomes descritivos
- Inclua regras de validação (minLength, format, etc.)
- Documente schemas com descrições
- Use composição de Type
- Mantenha schemas em sync entre backend e frontend
- Teste validação de schema

### Don'ts ❌

- Não defina schemas em múltiplos lugares
- Não pule validação
- Não hardcode strings
- Não misture validação de frontend e backend
- Não sobre-complique schemas
- Não esqueça de exportar tipos

## Atualizando Schemas

### Adicionando um Campo

1. Adicione campo ao schema TypeBox
2. Atualize tipo (automático)
3. Atualize implementação do backend
4. Atualize código do frontend
5. Rode testes
6. Commit junto

### Removendo um Campo

Para backward compatibility:

1. Marque campo como deprecated (se API externa)
2. Adicione wrapper Optional
3. Atualize consumers
4. Remova na próxima versão major

### Breaking Changes

```typescript
// v1
export const User = Type.Object({
  id: Type.String(),
  email: Type.String(),
  fullName: Type.String(), // Mudou de name
})

// Mantenha v1 para compatibilidade
export const UserV1 = Type.Object({
  id: Type.String(),
  email: Type.String(),
  name: Type.String(),
})

export const UserV2 = Type.Object({
  id: Type.String(),
  email: Type.String(),
  fullName: Type.String(),
})
```

## Documentação

- [TypeBox Official Docs](https://sinclairzx81.github.io/typebox/)
- [TypeBox GitHub](https://github.com/sinclairzx81/typebox)
- [JSON Schema Guide](https://json-schema.org/)

---

**Última Atualização**: Dezembro 2024
