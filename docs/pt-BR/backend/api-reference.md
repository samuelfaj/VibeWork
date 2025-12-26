# Referência de API do Backend

Referência completa para todos os endpoints da API backend.

## URL Base

```
http://localhost:3000  (desenvolvimento)
https://api.example.com (produção)
```

## Endpoints de Autenticação

Todos os endpoints que requerem autenticação usam session cookies HTTP-only.

### Sign Up

Criar uma nova conta de usuário.

```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Resposta (201 Created):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": null,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-02-15T10:30:00Z"
  }
}
```

**Respostas de Erro:**

- `400 Bad Request` - Entrada inválida (campos faltando, email inválido)
- `409 Conflict` - Email já existe
- `422 Unprocessable Entity` - Senha muito fraca

### Sign In

Login com email e senha.

```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Resposta (200 OK):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": null
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-02-15T10:30:00Z"
  }
}
```

**Respostas de Erro:**

- `401 Unauthorized` - Credenciais inválidas
- `400 Bad Request` - Campos faltando
- `404 Not Found` - Usuário não encontrado

### Get Session

Obter sessão do usuário autenticado atual.

```http
GET /api/auth/session
```

**Resposta (200 OK):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-02-15T10:30:00Z"
  }
}
```

**Resposta (401 Unauthorized):**

```json
{
  "user": null,
  "session": null
}
```

### Sign Out

Logout do usuário atual e invalide sessão.

```http
POST /api/auth/sign-out
```

**Resposta (200 OK):**

```json
{
  "success": true
}
```

**Nota:** Usa session cookie para autenticação.

## Endpoints de Usuário

### Obter Usuário Atual

Obter perfil do usuário autenticado.

```http
GET /api/users/me
```

**Resposta (200 OK):**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "image": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Respostas de Erro:**

- `401 Unauthorized` - Não autenticado

### Atualizar Usuário Atual

Atualizar perfil do usuário autenticado.

```http
PUT /api/users/me
Content-Type: application/json

{
  "name": "John Smith",
  "image": null
}
```

**Resposta (200 OK):**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Smith",
  "image": null,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Respostas de Erro:**

- `401 Unauthorized` - Não autenticado
- `400 Bad Request` - Entrada inválida

### Obter Perfil do Usuário

Obter perfil público do usuário por ID.

```http
GET /api/users/:id
```

**Resposta (200 OK):**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "image": null,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Respostas de Erro:**

- `404 Not Found` - Usuário não existe

## Endpoints de Notificação

### Criar Notificação

Criar uma nova notificação.

```http
POST /api/notifications
Content-Type: application/json

{
  "title": "Welcome!",
  "message": "Welcome to VibeWork",
  "type": "email",
  "userId": "user_123"
}
```

**Corpo da Requisição:**
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| title | string | Sim | Título da notificação |
| message | string | Sim | Mensagem da notificação |
| type | enum | Sim | `email`, `push`, `in-app` |
| userId | string | Sim | ID do usuário alvo |
| metadata | object | Não | Dados adicionais |

**Resposta (201 Created):**

```json
{
  "id": "notif_123",
  "title": "Welcome!",
  "message": "Welcome to VibeWork",
  "type": "email",
  "userId": "user_123",
  "read": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "sentAt": null
}
```

**Respostas de Erro:**

- `400 Bad Request` - Entrada inválida
- `401 Unauthorized` - Não autenticado
- `404 Not Found` - Usuário não encontrado

### Listar Notificações

Obter notificações do usuário autenticado.

```http
GET /api/notifications?page=1&limit=20&read=false
```

**Parâmetros de Query:**
| Parâmetro | Tipo | Padrão | Descrição |
|-----------|------|--------|-----------|
| page | number | 1 | Número da página (1-indexed) |
| limit | number | 20 | Itens por página (máx 100) |
| read | boolean | (all) | Filtrar por status de leitura |
| type | string | (all) | Filtrar por tipo de notificação |

**Resposta (200 OK):**

```json
{
  "data": [
    {
      "id": "notif_123",
      "title": "Welcome!",
      "message": "Welcome to VibeWork",
      "type": "email",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "sentAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "hasMore": false
  }
}
```

**Respostas de Erro:**

- `401 Unauthorized` - Não autenticado

### Obter Notificação

Obter uma notificação específica por ID.

```http
GET /api/notifications/:id
```

**Resposta (200 OK):**

```json
{
  "id": "notif_123",
  "title": "Welcome!",
  "message": "Welcome to VibeWork",
  "type": "email",
  "userId": "user_123",
  "read": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "sentAt": null
}
```

**Respostas de Erro:**

- `404 Not Found` - Notificação não encontrada
- `401 Unauthorized` - Não autenticado

### Atualizar Notificação

Atualizar detalhes da notificação (título, mensagem).

```http
PATCH /api/notifications/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "message": "Updated message"
}
```

**Resposta (200 OK):**

```json
{
  "id": "notif_123",
  "title": "Updated Title",
  "message": "Updated message",
  "type": "email",
  "read": false,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Respostas de Erro:**

- `404 Not Found` - Notificação não encontrada
- `401 Unauthorized` - Não autenticado

### Marcar como Lido

Marcar notificação como lida.

```http
PATCH /api/notifications/:id/read
Content-Type: application/json

{
  "read": true
}
```

**Resposta (200 OK):**

```json
{
  "id": "notif_123",
  "title": "Welcome!",
  "message": "Welcome to VibeWork",
  "read": true,
  "readAt": "2024-01-15T11:00:00Z"
}
```

**Respostas de Erro:**

- `404 Not Found` - Notificação não encontrada
- `401 Unauthorized` - Não autenticado

### Deletar Notificação

Deletar uma notificação.

```http
DELETE /api/notifications/:id
```

**Resposta (204 No Content)**

**Respostas de Erro:**

- `404 Not Found` - Notificação não encontrada
- `401 Unauthorized` - Não autenticado

## Endpoints de Health Check

### Verificação de Liveness

Verificar se o servidor está rodando.

```http
GET /healthz
```

**Resposta (200 OK):**

```json
{
  "status": "ok"
}
```

Usado por sistemas de orquestração de container para detectar se pod deve ser reiniciado.

### Verificação de Readiness

Verificar se o servidor está pronto para lidar com tráfego.

```http
GET /readyz
```

**Resposta (200 OK):**

```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "cache": "ok"
  }
}
```

**Resposta (503 Service Unavailable):**

```json
{
  "status": "not_ready",
  "checks": {
    "database": "error",
    "cache": "ok"
  }
}
```

Verifica dependências críticas antes de marcar como pronto.

## Documentação de API

### Swagger UI

Documentação interativa de API disponível em:

```
GET /swagger
```

Abra no navegador: http://localhost:3000/swagger

### OpenAPI Schema

Especificação OpenAPI bruta:

```
GET /swagger.json
```

## Headers Comuns

### Request Headers

```http
Content-Type: application/json
Accept: application/json
Accept-Language: en,pt-BR;q=0.9
Cookie: session=<session_id>
```

### Response Headers

```http
Content-Type: application/json; charset=utf-8
Set-Cookie: session=<session_id>; HttpOnly; SameSite=Lax; Path=/
X-Request-ID: req_abc123
```

## Respostas de Erro

Todas as respostas de erro seguem este formato:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email is required",
    "details": {
      "field": "email",
      "reason": "required"
    }
  }
}
```

### Códigos de Erro Comuns

| Código           | Status | Descrição                   |
| ---------------- | ------ | --------------------------- |
| `INVALID_INPUT`  | 400    | Validação de entrada falhou |
| `UNAUTHORIZED`   | 401    | Não autenticado             |
| `FORBIDDEN`      | 403    | Não autorizado para recurso |
| `NOT_FOUND`      | 404    | Recurso não existe          |
| `CONFLICT`       | 409    | Recurso já existe           |
| `RATE_LIMITED`   | 429    | Muitas requisições          |
| `INTERNAL_ERROR` | 500    | Erro do servidor            |

## Paginação

Endpoints de lista suportam paginação via parâmetros de query:

```http
GET /api/notifications?page=2&limit=50
```

**Parâmetros:**

- `page` (number, padrão: 1) - Número da página (1-indexed)
- `limit` (number, padrão: 20, máx: 100) - Itens por página

**Formato de Resposta:**

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "hasMore": true
  }
}
```

## Internacionalização

### Detecção de Locale

Backend detecta automaticamente locale de:

1. Header `Accept-Language`
2. Preferência do usuário (se autenticado)
3. Padrão: `en`

**Exemplo:**

```http
GET /api/notifications
Accept-Language: pt-BR,pt;q=0.9
```

Mensagens de erro serão retornadas em português.

## Rate Limiting

Não implementado em desenvolvimento. Deployments em produção devem implementar rate limiting na camada de reverse proxy (nginx, Cloudflare, etc.).

**Limites recomendados:**

- Auth endpoints: 10 requisições/minuto por IP
- API endpoints: 100 requisições/minuto por usuário
- Health checks: ilimitado

## Política CORS

Configurada para permitir requisições da origem do frontend.

**Padrão (desenvolvimento):**

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## Exemplos de Cliente de API

### Usando Eden RPC (Frontend)

```typescript
import { client } from '@/lib/api'

// Chamadas de API type-safe
const { user, session } = await client.api.auth['sign-in'].email.post({
  email: 'user@example.com',
  password: 'password123',
})
```

### Usando curl

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword123"}'

# Get session (com cookie)
curl -H "Cookie: session=<session_id>" \
  http://localhost:3000/api/auth/session

# Create notification
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<session_id>" \
  -d '{
    "title": "Test",
    "message": "Test notification",
    "type": "email",
    "userId": "user_123"
  }'
```

### Usando Postman

1. Abra Postman
2. Importe OpenAPI: http://localhost:3000/swagger.json
3. Configure cookies para requisições autenticadas
4. Crie requisições a partir de endpoints importados

## WebSocket (Futuro)

Suporte WebSocket planejado para:

- Notificações em tempo real
- Atualizações ao vivo
- Funcionalidade de chat

## Versionamento de API

Versão atual: **v1** (implícito)

Versões futuras serão:

- `/api/v2/...` para mudanças quebradas
- `/api/...` continua suportando v1

## Changelog

### Mudanças Recentes

- 2024-01: Design inicial de API
- 2024-01: Endpoints de autenticação
- 2024-01: Endpoints CRUD de notificações

---

**Última Atualização**: Dezembro 2024
**Versão de API**: v1
