# Guia de Infraestrutura do Backend

Guia para serviços de infraestrutura backend: Redis, Pub/Sub, Email e configuração.

## Arquitetura de Infraestrutura

```
Application
    │
    ├─→ Redis (Cache Layer)
    ├─→ Google Pub/Sub (Event Bus)
    └─→ AWS SES (Email)
```

## Redis Caching

### Visão Geral

Redis é usado exclusivamente para **caching de aplicação**, não como message queue.

### Configuração

**Variáveis de Ambiente:**

```env
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=vibe:
REDIS_TTL_SECONDS=3600
REDIS_PASSWORD=  # Optional
```

**Setup:** `backend/src/infra/cache.ts`

### Conexão

```typescript
import { cache } from '@/infra'

// Get connection
const redis = cache.client

// Check connection
await redis.ping() // "PONG"
```

### Operações Básicas

```typescript
import { cache } from '@/infra'

// SET
await cache.set('user:123', JSON.stringify(user), 3600)

// GET
const cached = await cache.get('user:123')
const user = JSON.parse(cached)

// DELETE
await cache.delete('user:123')

// EXISTS
const exists = await cache.exists('user:123')

// EXPIRE
await cache.expire('user:123', 1800)
```

### Padrões de Uso

**Cache Frequently Accessed Data:**

```typescript
async function getUserWithCache(userId: string) {
  const cacheKey = `user:${userId}`

  // Tente cache primeiro
  const cached = await cache.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Busque do banco de dados
  const user = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1)

  // Armazene em cache
  await cache.set(cacheKey, JSON.stringify(user), 3600)

  return user
}
```

**Cache Invalidation:**

```typescript
async function updateUser(userId: string, data: UpdateUserData) {
  // Atualizar banco de dados
  const updated = await db.update(usersTable).set(data).where(eq(usersTable.id, userId))

  // Invalide cache
  await cache.delete(`user:${userId}`)

  return updated
}
```

**Batch Operations:**

```typescript
async function batchGetUsers(userIds: string[]) {
  const cacheKeys = userIds.map((id) => `user:${id}`)

  // Get do cache
  const cached = await cache.mget(cacheKeys)

  // Encontre missing
  const missing = userIds.filter((id, i) => !cached[i])

  // Busque missing do DB
  const fresh = await db.select().from(usersTable).where(inArray(usersTable.id, missing))

  // Cache fresh data
  for (const user of fresh) {
    await cache.set(`user:${user.id}`, JSON.stringify(user), 3600)
  }

  // Combine cached + fresh
  return [...cached.filter(Boolean), ...fresh]
}
```

### Dicas de Performance

1. **Mantenha TTL razoável** (1-24 horas baseado em volatilidade de dados)
2. **Use key prefixes** para organizar cache
3. **Invalide em updates** para evitar dados stale
4. **Cache expensive queries** (joins, aggregations)
5. **Não cache dados sensíveis** (passwords, tokens)
6. **Monitore hit rates de cache** em produção

## Google Cloud Pub/Sub

### Visão Geral

Pub/Sub fornece **event-driven messaging** para processamento async.

**Casos de uso:**

- Enviar emails assincronamente
- Dispare workflows
- Desacople componentes
- Escale processamento independentemente

### Configuração

**Variáveis de Ambiente:**

```env
# Desenvolvimento Local (Emulator)
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local

# Produção (GCP)
GOOGLE_CLOUD_PROJECT=seu-projeto-gcp
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

**Docker Compose:**

```yaml
pubsub:
  image: google/cloud-sdk:emulator
  command: gcloud beta emulators pubsub start --host-port=0.0.0.0:8085
  ports:
    - '8085:8085'
  networks:
    - vibe-network
```

**Setup:** `backend/src/infra/pubsub.ts`

### Topics

**notification-created**

- Published when: Nova notificação criada
- Subscribers: Email service
- Message: `{ notificationId, userId, type }`

**notification-sent**

- Published when: Email enviado com sucesso
- Subscribers: Analytics, logging
- Message: `{ notificationId, status, timestamp }`

### Publicando Eventos

```typescript
import { pubsub } from '@/infra'

// Publique evento
await pubsub.publish('notification-created', {
  notificationId: 'notif_123',
  userId: 'user_123',
  type: 'email',
})
```

### Subscrição a Eventos

```typescript
import { pubsub } from '@/infra'

// Subscribe ao topic
const subscription = pubsub.subscribe('notification-created', async (message) => {
  const { notificationId, userId, type } = message.data

  if (type === 'email') {
    await emailService.send({
      userId,
      notificationId,
    })
  }

  // Acknowledge message
  message.ack()
})
```

### Tratamento de Erro

```typescript
pubsub.subscribe('notification-created', async (message) => {
  try {
    await processNotification(message.data)
    message.ack()
  } catch (error) {
    console.error('Failed to process notification:', error)
    // Pub/Sub irá automaticamente retry
    // Após max retries, message vai para dead letter queue
  }
})
```

### Testando Pub/Sub

**Testes Unitários (com Mock):**

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('notification publisher', () => {
  it('should publish notification-created event', async () => {
    const mockPubsub = {
      publish: vi.fn().mockResolvedValue('message_123'),
    }

    await publishNotificationCreated(
      {
        notificationId: 'notif_123',
        userId: 'user_123',
      },
      mockPubsub
    )

    expect(mockPubsub.publish).toHaveBeenCalledWith(
      'notification-created',
      expect.objectContaining({
        notificationId: 'notif_123',
      })
    )
  })
})
```

## AWS SES Email

### Visão Geral

AWS SES (Simple Email Service) envia emails transacionais.

### Configuração

**Variáveis de Ambiente:**

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_SES_FROM_ADDRESS=noreply@example.com

# Ou use IAM role (recomendado para produção)
AWS_ROLE_ARN=arn:aws:iam::account:role/service-role
```

**Setup:** `backend/src/infra/email.ts` (via AWS SDK)

### Email Service

**Localização:** `backend/modules/notifications/services/email.service.ts`

```typescript
import { emailService } from '@/modules/notifications'

// Envie email
await emailService.sendNotificationEmail({
  userId: 'user_123',
  notificationId: 'notif_123',
})
```

### Email Templates

Templates para diferentes tipos de notificação:

```typescript
function getEmailTemplate(type: string, data: any): EmailTemplate {
  switch (type) {
    case 'welcome':
      return {
        subject: 'Welcome to VibeWork!',
        html: `<p>Welcome ${data.name}!</p>`,
      }
    case 'notification':
      return {
        subject: data.title,
        html: `<p>${data.message}</p>`,
      }
    default:
      return {
        subject: 'Notification',
        html: '<p>You have a new notification</p>',
      }
  }
}
```

### Tratamento de Erro & Retries

```typescript
async function sendEmailWithRetry(email: string, template: EmailTemplate, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await sesClient.send(
        new SendEmailCommand({
          Source: process.env.AWS_SES_FROM_ADDRESS,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: template.subject },
            Body: { Html: { Data: template.html } },
          },
        })
      )
      return response
    } catch (error) {
      if (attempt === maxRetries) throw error
      // Exponential backoff
      await sleep(Math.pow(2, attempt) * 1000)
    }
  }
}
```

### Requisitos de Produção

**Email Verification:**

- Todos os endereços "from" devem ser verificados em SES
- Verifique no AWS Console → SES → Verified identities

**Sending Limits:**

- Desenvolvimento: 200 emails/dia
- Produção: Solicite aumento de limite no AWS Console

**Melhores Práticas:**

1. Sempre verifique endereço de remetente
2. Use transactional templates
3. Trate bounces e complaints
4. Monitore sending quota
5. Implemente retry logic

### Testando Email

**Desenvolvimento Local:**

```typescript
// Mock SES para testes
const mockSES = {
  send: vi.fn().mockResolvedValue({
    MessageId: 'test_123',
  }),
}

// Ou use serviços como MailHog ou Ethereal para testes de email reais
```

## Conexões de Banco de Dados

### MySQL Connection Pool

**Configuração:**

```typescript
// backend/src/infra/database/mysql.ts
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.MYSQL_POOL_MAX_CONNECTIONS) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
})
```

**Connection Lifecycle:**

1. Pool adquire conexão
2. Query executa
3. Pool retorna conexão
4. Após idle timeout, conexão fechada

### MongoDB Connection

**Configuração:**

```typescript
// backend/src/infra/database/mongodb.ts
const mongoConnection = mongoose.createConnection(process.env.MONGODB_URL, {
  maxPoolSize: parseInt(process.env.MONGODB_CONNECTION_POOL_SIZE) || 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
```

## Health Checks

### Liveness Check

```http
GET /healthz
```

Retorna 200 se servidor está rodando.

```json
{ "status": "ok" }
```

### Readiness Check

```http
GET /readyz
```

Retorna 200 apenas se todas as dependências estão saudáveis.

```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "cache": "ok",
    "pubsub": "ok"
  }
}
```

Retorna 503 se qualquer dependência está down.

**Implementação:**

```typescript
async function readinessCheck() {
  const checks = {
    database: await checkMysql(),
    cache: await checkRedis(),
    pubsub: await checkPubsub(),
  }

  const allOk = Object.values(checks).every((s) => s === 'ok')

  return {
    status: allOk ? 'ready' : 'not_ready',
    checks,
  }
}
```

## Logging & Monitoring

### Structured Logging

Todos os logs incluem contexto:

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "backend",
  "module": "notifications",
  "message": "Email sent successfully",
  "metadata": {
    "userId": "user_123",
    "notificationId": "notif_123",
    "duration_ms": 1234
  }
}
```

### Métricas para Monitorar

- **Cache**: Hit/miss rate, latência
- **Database**: Connection pool usage, query latency
- **Pub/Sub**: Message count, latência, dead letter queue size
- **Email**: Sent count, failure rate, bounce rate
- **API**: Request rate, error rate, response time

## Configuração de Ambiente

### Development

```env
NODE_ENV=development
LOG_LEVEL=debug
DEBUG=vibe:*

REDIS_URL=redis://localhost:6379
PUBSUB_EMULATOR_HOST=localhost:8085
AWS_REGION=us-east-1
```

### Staging

```env
NODE_ENV=staging
LOG_LEVEL=info

REDIS_URL=redis://redis-staging.internal:6379
PUBSUB_EMULATOR_HOST=  # Use real GCP
GOOGLE_CLOUD_PROJECT=vibe-staging
```

### Production

```env
NODE_ENV=production
LOG_LEVEL=warn

REDIS_URL=redis://redis-prod.internal:6379
GOOGLE_CLOUD_PROJECT=vibe-prod
AWS_REGION=us-east-1

# Use IAM roles em vez de chaves
AWS_ROLE_ARN=arn:aws:iam::prod-account:role/service-role
```

## Troubleshooting

### Redis Connection Issues

```bash
# Verifique se Redis está rodando
docker-compose logs redis

# Teste conexão
redis-cli ping
# Esperado: PONG

# Verifique key prefix
redis-cli KEYS "vibe:*"
```

### Pub/Sub Issues

```bash
# Verifique se emulator está rodando
curl http://localhost:8085/v1/projects/vibe-local

# List topics
gcloud pubsub topics list --project=vibe-local

# Ver messages (emulator only)
gcloud pubsub subscriptions pull test-sub --project=vibe-local
```

### Email Issues

```typescript
// Verifique se sender está verificado em SES
// Ver verification status no AWS Console

// Monitore email sending
AWS Console → SES → Sending Statistics

// Verifique bounce/complaint rate
AWS Console → SES → Reputation Dashboard
```

## Próximos Passos

- **[Guia de Banco de Dados](./database.md)** - Setup de banco de dados e operações
- **[Guia de Testes](./testing.md)** - Testes com infraestrutura
- **[Guia de Deployment](../deployment.md)** - Infraestrutura de produção

---

**Última Atualização**: Dezembro 2024
