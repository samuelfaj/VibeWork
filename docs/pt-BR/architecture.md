# Visão Geral da Arquitetura

Este documento descreve a arquitetura do sistema VibeWork, incluindo design geral, fluxos de dados e decisões arquiteturais principais.

## Arquitetura do Sistema

```
┌────────────────────────────────────────────────────────────┐
│                  Cliente (Navegador Web)                   │
│                    React SPA + Vite                        │
│              TanStack Query + Eden RPC                     │
└──────────────────────────┬─────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌────────────────────────────────────────────────────────────┐
│                 API Server (ElysiaJS + Bun)               │
│  ├── Rotas da API & Middleware                             │
│  ├── Módulo Usuários (Autenticação)                       │
│  └── Módulo Notificações                                  │
└──────────────────────────┬─────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌──────────┐    ┌──────────────┐    ┌─────────┐
   │  MySQL   │    │  MongoDB     │    │ Redis   │
   │          │    │              │    │         │
   │ Usuários │    │ Notificações │    │ Cache   │
   │ Sessões  │    │              │    │         │
   └──────────┘    └──────────────┘    └─────────┘
        │
        │ (Eventos)
        ▼
   ┌──────────────────────┐
   │ Google Cloud Pub/Sub  │
   │ (Fila de Eventos)    │
   └──────────┬───────────┘
              │
              ▼
        ┌──────────────┐
        │  AWS SES     │
        │ (Email)      │
        └──────────────┘
```

## Camadas de Componentes

### 1. Camada Cliente (Frontend)

A SPA React é a interface do usuário da aplicação.

**Componentes Principais:**

- **React**: Framework de UI
- **Vite**: Ferramenta de build rápido
- **TanStack Query**: Gerenciamento de estado do servidor
- **Eden RPC**: Cliente de API type-safe
- **i18next**: Internacionalização

**Responsabilidades:**

- Renderizar componentes de UI
- Processar interações do usuário
- Gerenciar estado de formulários
- Chamar APIs de backend
- Exibir notificações

### 2. Camada do Servidor API (ElysiaJS)

O servidor REST que processa todas as requisições do cliente.

**Estrutura:**

```
backend/src/
├── app.ts            # Configuração da aplicação
├── routes/           # Handlers de rotas HTTP
├── infra/            # Setup de infraestrutura
│   ├── cache.ts      # Redis
│   ├── pubsub.ts     # Pub/Sub
│   └── database/     # MySQL, MongoDB
└── i18n/             # Traduções
```

**Recursos Principais:**

- Rotas type-safe com ElysiaJS e TypeBox
- Documentação Swagger auto-gerada
- CORS middleware para requisições cross-origin
- Middleware de tratamento de erros
- Suporte i18n para respostas internacionalizadas
- Endpoints de health check

### 3. Camada de Módulos (Recursos)

Organização de monolito modular com módulos de domínio.

#### Módulo Usuários

```
modules/users/
├── routes/          # Endpoints de autenticação/usuários
├── services/        # Lógica de operações
├── schema/          # Schema MySQL (Drizzle)
└── index.ts         # Exports do módulo
```

**Responsabilidades:**

- Registro e autenticação de usuários
- Gerenciamento de sessões
- Operações de perfil de usuário
- Hash e verificação de senhas

#### Módulo Notificações

```
modules/notifications/
├── routes/          # Endpoints REST
├── models/          # Schema MongoDB
├── services/        # Lógica de negócio
└── index.ts         # Exports do módulo
```

**Responsabilidades:**

- Criar e recuperar notificações
- Publicar eventos em Pub/Sub
- Processar eventos (async)
- Enviar emails via AWS SES

### 4. Camada de Infraestrutura

Gerencia todas as conexões com serviços externos.

**Componentes:**

#### Conexão com Banco de Dados (MySQL)

- **ORM**: Drizzle
- **Pool**: Pool de conexões
- **Schema**: Definições de tabela type-safe
- **Migrations**: Migrações SQL

#### Armazenamento de Documentos (MongoDB)

- **ODM**: Mongoose + Typegoose
- **Conexão**: Pool de conexões
- **Models**: Schemas com TypeScript

#### Cache (Redis)

- **Cliente**: ioredis
- **Propósito**: Cache de aplicação apenas
- **Não usado para**: Fila de mensagens

#### Fila de Eventos (Google Cloud Pub/Sub)

- **Emulador**: Desenvolvimento local via `PUBSUB_EMULATOR_HOST`
- **Tópicos**: `notification-created`, `notification-sent`
- **Subscribers**: Handlers de eventos assíncronos

#### Serviço de Email (AWS SES)

- **Integração**: AWS SDK v3
- **Propósito**: Entrega de email transacional
- **Caso de uso**: Envio de notificações

## Fluxos de Dados

### 1. Fluxo de Autenticação

```
Entrada do Usuário (SignupForm)
    │
    ├─→ Frontend valida entrada
    │
    ├─→ POST /api/auth/sign-up/email
    │       {email, password}
    │
    ├─→ Backend recebe requisição
    │
    ├─→ Valida com SignupSchema
    │
    ├─→ Hash de senha (Argon2id)
    │
    ├─→ Insere usuário em MySQL
    │
    ├─→ Cria sessão no banco
    │
    ├─→ Define cookie de sessão (HTTP-only)
    │
    ├─→ Retorna dados do usuário
    │
    └─→ Frontend recebe resposta
        & salva cookie
```

### 2. Fluxo de Criação de Notificação

```
Requisição da API (Criar Notificação)
    │
    ├─→ POST /notifications
    │       {title, message, type, userId}
    │
    ├─→ Valida com schema
    │
    ├─→ Insere em MongoDB
    │
    ├─→ Publica em Pub/Sub
    │       Topic: "notification-created"
    │       Message: {notificationId, userId, type}
    │
    ├─→ Retorna para cliente (imediato)
    │
    └─→ Subscriber assíncrono recebe evento
            │
            ├─→ Se type === "email"
            │       ├─→ Busca email do usuário em MySQL
            │       │
            │       ├─→ Renderiza template de email
            │       │
            │       └─→ Envia via AWS SES
            │
            └─→ Atualiza status em MongoDB
```

## Decisões Arquiteturais Principais

### 1. Monolito Modular

**Decisão**: Organizar backend como módulos que podem ser independentemente extraídos.

**Benefícios:**

- Separação clara de responsabilidades
- Fácil de entender e manter
- Potencial para migração para microsserviços
- Infraestrutura compartilhada durante fase monolítica

### 2. Redis Somente para Cache

**Decisão**: Usar Redis para cache, não como fila de mensagens.

**Benefícios:**

- Responsabilidade única clara
- Melhor performance para cache hits
- Pub/Sub para mensagens (serviço gerenciado)
- Reduz complexidade de manutenção do Redis

### 3. RPC Type-Safe

**Decisão**: Usar TypeBox + Eden RPC para type safety end-to-end.

**Benefícios:**

- Validação em tempo de compilação
- Documentação de API auto-gerada
- Menos erros em runtime
- Melhor experiência do desenvolvedor frontend

### 4. Múltiplos Bancos de Dados

**Decisão**: MySQL para dados relacionais, MongoDB para documentos.

**Benefícios:**

- Ferramenta correta para cada padrão de dados
- MySQL: transações, ACID, chaves estrangeiras
- MongoDB: schema flexível, sem migrações
- Linguagem de query compatível com o modelo

### 5. Pub/Sub para Eventos

**Decisão**: Usar Google Cloud Pub/Sub para mensagens assíncronas.

**Benefícios:**

- Serviço gerenciado (sem operações)
- Componentes desacoplados
- Mecanismos de retry integrados
- Emulador local para desenvolvimento

### 6. Better-Auth para Autenticação

**Decisão**: Usar Better-Auth para gerenciamento de sessão.

**Benefícios:**

- Cookies seguros HTTP-only
- Validação automática de sessão
- Hash de senha (Argon2id)
- API type-safe

## Arquitetura de Segurança

### Autenticação

- **Método**: Session-based com cookies HTTP-only
- **Hash**: Argon2id (recomendado OWASP)
- **Validação**: Por-request em middleware
- **Logout**: Deletar sessão do banco

### Proteção de Dados

- **Transporte**: HTTPS/TLS em produção
- **Armazenamento**: Senhas hasheadas, nunca em texto plano
- **Dados Sensíveis**: Marcados no código (email, senhas)

### Segurança da API

- **CORS**: Configurado para origem frontend
- **Validação de Entrada**: Schema validation em todos endpoints
- **Rate Limiting**: Pode ser adicionado em reverse proxy
- **Health Checks**: Endpoints liveness/readiness

## Considerações de Escalabilidade

### Escalabilidade Horizontal

1. **Frontend**: CDN + múltiplas regiões (assets estáticos)
2. **Backend**: Múltiplas instâncias atrás de load balancer
3. **Bancos**: Pool de conexões, read replicas possível
4. **Cache**: Cluster Redis compartilhado
5. **Pub/Sub**: Google Cloud Pub/Sub auto-escalável

### Extração de Banco de Dados

A estrutura modular permite extrair módulos para serviços:

1. Extrair notificações para serviço separado
2. Criar comunicação service-to-service
3. Bancos de dados separados
4. Usar Pub/Sub para inter-service events

## Próximos Passos

- [Backend Setup](./backend/setup.md) - Configuração detalhada
- [API Reference](./backend/api-reference.md) - Todos endpoints
- [Frontend Setup](./frontend/setup.md) - Configuração frontend
- [Infrastructure Guide](./infrastructure.md) - Serviços e deploy

---

**Última Atualização**: Dezembro 2024
