# Guia de Módulos do Backend

Guia para a arquitetura de monolito modular e módulos individuais.

## Visão Geral

O backend é organizado como um monolito modular com módulos de feature que podem ser desenvolvidos, testados e potencialmente extraídos para microserviços independentemente.

### Estrutura de Módulo

```
backend/modules/
├── users/                    # Gerenciamento de usuários & autenticação
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── __tests__/
│   ├── services/
│   │   └── user.service.ts
│   ├── schema/
│   │   └── user.schema.ts
│   ├── index.ts
│   └── CLAUDE.md
└── notifications/            # Sistema de notificação
    ├── routes/
    │   └── notification.routes.ts
    ├── models/
    │   └── notification.model.ts
    ├── services/
    │   ├── notification.service.ts
    │   ├── email.service.ts
    │   └── publisher.service.ts
    ├── index.ts
    └── CLAUDE.md
```

## Módulo de Usuários

O módulo de Usuários manipula autenticação e gerenciamento de perfil de usuário.

### Features

- **Sign Up**: Criar nova conta de usuário
- **Sign In**: Login com email/senha
- **Sessions**: Gerenciar sessões ativas
- **Profiles**: Obter/atualizar informações do usuário
- **Password Hashing**: Algoritmo Argon2id
- **Session Storage**: Banco de dados MySQL

### Arquitetura

```
Request → auth.routes.ts → Better-Auth Handler
            ↓
        Service Layer (optional)
            ↓
        MySQL (Drizzle ORM)
            ↓
        Response
```

### Arquivos

**Routes** (`routes/`)

- `auth.routes.ts` - Endpoints de integração Better-Auth
- `user.routes.ts` - Endpoints de perfil do usuário

**Services** (`services/`)

- `user.service.ts` - Operações de usuário (criar, ler, atualizar)

**Schema** (`schema/`)

- `user.schema.ts` - Definições de tabela Drizzle

### Endpoints Principais

| Endpoint                  | Método | Descrição         |
| ------------------------- | ------ | ----------------- |
| `/api/auth/sign-up/email` | POST   | Criar conta       |
| `/api/auth/sign-in/email` | POST   | Login             |
| `/api/auth/sign-out`      | POST   | Logout            |
| `/api/auth/session`       | GET    | Obter sessão      |
| `/api/users/me`           | GET    | Usuário atual     |
| `/api/users/me`           | PUT    | Atualizar perfil  |
| `/api/users/:id`          | GET    | Perfil do usuário |

Veja [Referência de API](./api-reference.md) para detalhes.

### Schema de Banco de Dados

**Tabela users:**

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Tabela sessions:**

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Exemplo de Uso

```typescript
// Em um handler de route
import { userService } from '@/modules/users'

export const getUserProfile = async (userId: string) => {
  const user = await userService.findById(userId)
  return user
}

// Em um teste
import { userService } from '@/modules/users'

it('should create user', async () => {
  const user = await userService.create({
    email: 'test@example.com',
    password: 'securepassword123',
  })

  expect(user.email).toBe('test@example.com')
})
```

### Configuração

**Variáveis de Ambiente:**

```env
AUTH_SECRET=<random_secure_key>
AUTH_CALLBACK_URL=http://localhost:3000/api/auth/callback/[provider]
AUTH_TRUST_HOST=true
```

**Setup Better-Auth:**
Localizado em `src/infra/auth.ts`

- Session adapter: MySQL via Drizzle
- Password hashing: Argon2id
- Cookie settings: HttpOnly, SameSite=Lax

### Testes

**Testes Unitários:**

```bash
cd backend
bun run test modules/users
```

**Testes de Integração:**

```bash
bun run test:integration modules/users
```

Arquivos de teste localizados em `modules/users/**/__tests__/`

### Documentação Detalhada

Veja `backend/modules/users/CLAUDE.md` para:

- Definições de schema completas
- Interfaces de serviço
- Fluxo de autenticação
- Considerações de segurança
- Operações de banco de dados

## Módulo de Notificações

O módulo de Notificações manipula criação, recuperação e entrega de notificações.

### Features

- **Create Notifications**: Adicionar novas notificações
- **List Notifications**: Obter notificações do usuário com filtros
- **Update Status**: Marcar como lido/entregue
- **Email Delivery**: Enviar via AWS SES
- **Event Publishing**: Integração com Google Cloud Pub/Sub
- **Async Processing**: Subscribers de eventos para trabalhos em background

### Arquitetura

```
Request → notification.routes.ts
    ↓
notification.service.ts
    ↓
    ├─→ MongoDB (Typegoose)
    │
    └─→ publisher.service.ts
            ↓
        Pub/Sub Topic: "notification-created"
            ↓
        Async Subscriber
            ↓
        email.service.ts
            ↓
        AWS SES
```

### Arquivos

**Routes** (`routes/`)

- `notification.routes.ts` - Endpoints REST (CRUD)

**Services** (`services/`)

- `notification.service.ts` - Operações principais de notificação
- `publisher.service.ts` - Publicação de eventos Pub/Sub
- `email.service.ts` - Integração com AWS SES

**Models** (`models/`)

- `notification.model.ts` - Schema de Typegoose

### Endpoints Principais

| Endpoint                      | Método | Descrição             |
| ----------------------------- | ------ | --------------------- |
| `/api/notifications`          | POST   | Criar notificação     |
| `/api/notifications`          | GET    | Listar notificações   |
| `/api/notifications/:id`      | GET    | Obter notificação     |
| `/api/notifications/:id`      | PATCH  | Atualizar notificação |
| `/api/notifications/:id/read` | PATCH  | Marcar como lido      |
| `/api/notifications/:id`      | DELETE | Deletar notificação   |

Veja [Referência de API](./api-reference.md) para detalhes.

### Schema de Banco de Dados

**Coleção Notifications (MongoDB):**

```typescript
interface Notification {
  _id: ObjectId
  title: string
  message: string
  type: 'email' | 'push' | 'in-app'
  userId: string
  read: boolean
  readAt?: Date
  sentAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### Event Flow

**Criando uma Notificação:**

```typescript
// Passo 1: Usuário cria notificação
POST /api/notifications
{
  "title": "Welcome",
  "message": "Welcome to VibeWork",
  "type": "email",
  "userId": "user_123"
}

// Passo 2: Service salva em MongoDB
// Passo 3: Service publica em Pub/Sub
// Passo 4: Retorna imediatamente ao cliente

// Passo 5: Async subscriber recebe evento
// Passo 6: Se type=email, enviar via SES
// Passo 7: Atualizar status da notificação
```

### Configuração de Email

**Variáveis de Ambiente:**

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_SES_FROM_ADDRESS=noreply@example.com
```

**Email Service:**
Localizado em `services/email.service.ts`

- Templates para diferentes tipos de notificação
- Lógica de retry para envios falhados
- Rastreamento de status de entrega

### Integração Pub/Sub

**Topics:**

- `notification-created` - Nova notificação criada
- `notification-sent` - Email enviado com sucesso
- `notification-failed` - Envio de email falhou

**Subscribers:**
Localizado em `services/publisher.service.ts`

- Ouve `notification-created`
- Dispara envio de email
- Atualiza status da notificação

**Desenvolvimento Local:**

```env
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local
```

### Exemplo de Uso

```typescript
// Criar notificação
const notification = await notificationService.create({
  title: 'Welcome',
  message: 'Welcome to VibeWork',
  type: 'email',
  userId: 'user_123',
})

// Listar notificações do usuário
const notifications = await notificationService.findByUserId('user_123', {
  page: 1,
  limit: 20,
  read: false,
})

// Marcar como lido
await notificationService.markAsRead('notif_123')

// O email será enviado assincronamente via Pub/Sub
```

### Testes

**Testes Unitários:**

```bash
cd backend
bun run test modules/notifications
```

**Testes de Integração (com Docker):**

```bash
bun run test:integration modules/notifications
```

Arquivos de teste em `modules/notifications/**/__tests__/`

### Documentação Detalhada

Veja `backend/modules/notifications/CLAUDE.md` para:

- Definições de modelo Typegoose completas
- Detalhes de integração Pub/Sub
- Sistema de templates de email
- Manipulação de eventos
- Schemas de contrato de API

## Desenvolvimento de Módulo

### Criar um Novo Módulo

1. **Criar Diretório de Módulo**

   ```bash
   mkdir -p backend/modules/my-feature/{routes,services,schema}
   ```

2. **Criar Index de Módulo**

   ```typescript
   // modules/my-feature/index.ts
   export * from './routes'
   export * from './services'
   ```

3. **Criar Routes**

   ```typescript
   // modules/my-feature/routes/index.ts
   import { Elysia } from 'elysia'
   import { myFeatureService } from '../services'

   export const myFeatureRoutes = new Elysia().get('/my-feature', () => myFeatureService.getAll())
   ```

4. **Registrar na App**

   ```typescript
   // src/app.ts
   import { myFeatureRoutes } from '@/modules/my-feature'

   app.use(myFeatureRoutes)
   ```

5. **Adicionar Testes**
   ```bash
   mkdir -p modules/my-feature/__tests__
   touch modules/my-feature/__tests__/service.test.ts
   ```

### Princípios de Módulo

1. **Isolamento**: Módulo deve ser auto-contido
2. **Exports**: Use barrel exports (index.ts)
3. **Testing**: 80% de cobertura mínimo
4. **Documentation**: CLAUDE.md na raiz do módulo
5. **Independence**: Pode ser extraído para microserviço
6. **Interface Stability**: APIs internas estáveis

### Comunicação Entre Módulos

Para módulos que precisam interagir:

```typescript
// Importar de exports do módulo
import { userService } from '@/modules/users'
import { notificationService } from '@/modules/notifications'

// Injeção de dependência explícita
notificationService.create({
  userId: user.id,
  message: `Welcome ${user.name}`,
})
```

### Infraestrutura Compartilhada

Módulos podem usar infraestrutura compartilhada:

```typescript
import { db, cache, pubsub } from '@/infra'

// Banco de dados
const users = await db.query.users.findMany()

// Cache
const cached = await cache.get('key')

// Pub/Sub
await pubsub.publish('topic', message)
```

## Dependências de Módulo

**Dependências Atuais:**

```
users → MySQL/Drizzle
notifications → MongoDB/Typegoose
              → Pub/Sub
              → AWS SES
              → users (opcional, para dados de usuário)
```

## Migrar para Microserviços

A estrutura modular permite extrair módulos para serviços separados:

1. **Copiar módulo** para novo serviço
2. **Criar banco de dados separado** para o módulo
3. **Usar Pub/Sub** para comunicação entre serviços
4. **Atualizar imports de módulo** no backend principal
5. **Fazer deploy separado** em Cloud Run

Exemplo: Extraindo notificações para microserviço

```
# Antes: single backend com users + notifications

# Depois:
backend/          # Serviço de usuários apenas
notifications-svc/  # Microserviço de notificações
shared-libs/      # Definições de contrato
```

Comunicação via Pub/Sub:

- notifications-svc subscreve eventos user-created
- users-svc publica eventos via Pub/Sub

## Próximos Passos

- **[Detalhes do Módulo de Usuários](../backend/README.md#users-module)** - Leia CLAUDE.md do módulo
- **[Detalhes do Módulo de Notificações](../backend/README.md#notifications-module)** - Leia CLAUDE.md do módulo
- **[Referência de API](./api-reference.md)** - Explore endpoints
- **[Guia de Banco de Dados](./database.md)** - Entenda schemas
- **[Guia de Testes](./testing.md)** - Aprenda padrões de teste

---

**Última Atualização**: Dezembro 2024
