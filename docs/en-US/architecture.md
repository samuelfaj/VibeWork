# Architecture Overview

This document describes the system architecture of VibeWork, including the overall design, data flows, and key design decisions.

## System Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                    Client Layer (Web Browser)                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            React SPA (React 18 + Vite)                       │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ Features                                               │  │  │
│  │  │ ├── Auth (Login, Signup, Logout)                      │  │  │
│  │  │ ├── Dashboard                                          │  │  │
│  │  │ └── User Profile                                       │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ State Management                                       │  │  │
│  │  │ ├── TanStack Query (server state)                      │  │  │
│  │  │ ├── i18next (localization)                            │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │ API Client                                             │  │  │
│  │  │ └── Eden RPC (type-safe API calls)                    │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ HTTP/REST
                               │ (Port 3000)
                               ▼
┌────────────────────────────────────────────────────────────────────┐
│                   API Server (ElysiaJS + Bun)                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ API Routes & Middleware                                      │  │
│  │ ├── /api/auth/*          (Better-Auth endpoints)            │  │
│  │ ├── /users/*             (User profile endpoints)           │  │
│  │ ├── /notifications/*     (Notification endpoints)           │  │
│  │ ├── /healthz, /readyz    (Health checks)                    │  │
│  │ └── /swagger             (API documentation)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                               │                                     │
│  ┌────────────────────┐    ┌──────────────────┐                   │
│  │  Users Module      │    │ Notifications    │                   │
│  │  ┌──────────────┐  │    │ Module           │                   │
│  │  │ Routes       │  │    │ ┌──────────────┐ │                   │
│  │  │ Services     │  │    │ │ Routes       │ │                   │
│  │  │ Schemas      │  │    │ │ Services     │ │                   │
│  │  │ Middleware   │  │    │ │ Models       │ │                   │
│  │  └──────────────┘  │    │ └──────────────┘ │                   │
│  └─────────┬──────────┘    └────────┬─────────┘                   │
│            │                        │                              │
│            ▼                        ▼                              │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │          Infrastructure Layer (src/infra/)                 │  │
│  │  ├── Database Connections                                  │  │
│  │  │   ├── MySQL (Drizzle ORM)                              │  │
│  │  │   └── MongoDB (Mongoose)                               │  │
│  │  ├── Cache                                                │  │
│  │  │   └── Redis (ioredis)                                  │  │
│  │  ├── Event Bus                                            │  │
│  │  │   └── Google Cloud Pub/Sub                             │  │
│  │  ├── Email Service                                        │  │
│  │  │   └── AWS SES                                          │  │
│  │  └── Authentication                                       │  │
│  │      └── Better-Auth (session management)                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   ┌──────────┐          ┌──────────────┐       ┌─────────┐
   │  MySQL   │          │  MongoDB     │       │ Redis   │
   │          │          │              │       │         │
   │ Users    │          │ Notifications│       │ Cache   │
   │ Sessions │          │              │       │         │
   └──────────┘          └──────────────┘       └─────────┘
        │
        │ (Events)
        ▼
   ┌─────────────────────────────────────┐
   │  Google Cloud Pub/Sub                │
   │  ├── notification-created topic      │
   │  ├── notification-sent topic         │
   │  └── Async subscribers               │
   └─────────────────────────────────────┘
        │
        ▼
   ┌─────────────────────┐
   │  AWS SES            │
   │  (Email Service)    │
   └─────────────────────┘
```

## Detailed Component Layers

### 1. Client Layer (Frontend)

The React SPA is the user interface for the application.

**Key Components:**

- **React**: UI framework
- **Vite**: Fast build tool with hot module replacement
- **TanStack Query**: Server state management
- **Eden RPC**: Type-safe API client
- **i18next**: Internationalization

**Responsibilities:**

- Render UI components
- Handle user interactions
- Manage form state
- Call backend APIs
- Display notifications

### 2. API Server Layer (ElysiaJS)

The REST API server that handles all client requests.

**Structure:**

```
backend/src/
├── app.ts            # Elysia configuration
├── routes/           # HTTP route handlers
│   ├── health.ts     # Liveness/readiness checks
│   └── __tests__/
├── infra/            # Infrastructure setup
│   ├── cache.ts      # Redis
│   ├── pubsub.ts     # Pub/Sub
│   └── database/     # MySQL, MongoDB
└── i18n/             # Translations
```

**Key Features:**

- Type-safe route definitions with Elysia
- Swagger/OpenAPI documentation auto-generated
- CORS middleware for cross-origin requests
- Error handling middleware
- i18n support for internationalized responses
- Health check endpoints

### 3. Module Layer (Feature Modules)

Modular monolith organization with domain-driven modules.

#### Users Module

```
modules/users/
├── routes/
│   ├── auth.routes.ts      # Better-Auth integration
│   ├── user.routes.ts      # User profile endpoints
│   └── __tests__/
├── schema/
│   └── user.schema.ts      # Drizzle MySQL schema
├── services/
│   └── user.service.ts     # User operations
└── index.ts                # Module exports
```

**Responsibilities:**

- User registration and authentication
- Session management
- User profile operations
- Password hashing and verification

#### Notifications Module

```
modules/notifications/
├── routes/
│   └── notification.routes.ts  # REST endpoints
├── models/
│   └── notification.model.ts   # Typegoose MongoDB schema
├── services/
│   ├── notification.service.ts
│   ├── email.service.ts        # AWS SES integration
│   └── publisher.service.ts    # Pub/Sub publishing
└── index.ts                    # Module exports
```

**Responsibilities:**

- Create and retrieve notifications
- Publish events to Pub/Sub
- Subscribe to events (async)
- Send emails via AWS SES
- Track notification status

### 4. Infrastructure Layer

Manages all external service connections.

**Components:**

#### Database Connection (MySQL)

- **ORM**: Drizzle
- **Pool**: Connection pooling via `mysql2`
- **Schema**: Type-safe table definitions
- **Migrations**: SQL migrations support

#### Document Store (MongoDB)

- **ODM**: Mongoose + Typegoose
- **Connection**: Connection pooling
- **Models**: TypeScript-first schemas

#### Cache (Redis)

- **Client**: ioredis
- **Purpose**: Application caching only
- **Not used for**: Message queue (use Pub/Sub)

#### Event Bus (Google Cloud Pub/Sub)

- **Emulator**: Local development via `PUBSUB_EMULATOR_HOST`
- **Topics**: `notification-created`, `notification-sent`
- **Subscribers**: Async event handlers

#### Email Service (AWS SES)

- **Integration**: AWS SDK v3
- **Purpose**: Transactional email delivery
- **Use case**: Notification delivery

## Data Flow Patterns

### 1. Authentication Flow

```
User Input (SignupForm)
    │
    ├─→ Frontend validates input
    │
    ├─→ POST /api/auth/sign-up/email
    │       {email, password}
    │
    ├─→ Backend receives request
    │
    ├─→ Validates with SignupSchema
    │
    ├─→ Hash password (Argon2id)
    │
    ├─→ Insert user into MySQL
    │
    ├─→ Create session in database
    │
    ├─→ Set session cookie (HTTP-only)
    │
    ├─→ Return user data to frontend
    │
    └─→ Frontend stores cookie (automatic)
        & redirects to dashboard
```

### 2. Notification Creation Flow

```
API Request (Create Notification)
    │
    ├─→ POST /notifications
    │       {title, message, type, userId}
    │
    ├─→ Validate with schema
    │
    ├─→ Insert into MongoDB
    │
    ├─→ Publish to Pub/Sub
    │       Topic: "notification-created"
    │       Message: {notificationId, userId, type}
    │
    ├─→ Return to client (immediate)
    │
    └─→ Async Subscriber receives event
            │
            ├─→ If type === "email"
            │       ├─→ Fetch user email from MySQL
            │       │
            │       ├─→ Render email template
            │       │
            │       └─→ Send via AWS SES
            │
            └─→ Update status in MongoDB
```

### 3. User Request to Response

```
Frontend
    │
    ├─→ Generate request (Eden RPC)
    │   ├─→ Type-safe endpoint
    │   ├─→ Compiled-time validation
    │   └─→ Automatic serialization
    │
    ├─→ Send HTTP request with session cookie
    │
    └─→ Backend receives
            │
            ├─→ Extract session from cookie
            │
            ├─→ Verify session in MySQL
            │
            ├─→ Middleware attach user to context
            │
            ├─→ Route handler processes request
            │   ├─→ Validate input schema
            │   ├─→ Execute business logic
            │   ├─→ Query databases
            │   └─→ Return response
            │
            └─→ Send response to frontend
                    │
                    ├─→ Type validation (Eden)
                    │
                    └─→ Update TanStack Query cache
```

## Key Design Decisions

### 1. Modular Monolith

**Decision**: Organize backend as modules that can be independently extracted.

**Benefits:**

- Clear separation of concerns
- Easier to understand and maintain
- Potential for microservice migration
- Shared infrastructure during monolith phase

### 2. Redis for Cache Only

**Decision**: Use Redis for caching, not as message queue.

**Benefits:**

- Clear single responsibility
- Better performance for cache hits
- Pub/Sub for event messaging (managed service)
- Reduced Redis maintenance complexity

### 3. Type-Safe RPC

**Decision**: Use TypeBox schemas + Eden RPC for end-to-end type safety.

**Benefits:**

- Compile-time validation of API contracts
- Auto-generated API documentation
- Reduced runtime errors
- Better frontend developer experience

### 4. Multiple Databases

**Decision**: MySQL for relational data, MongoDB for documents.

**Benefits:**

- Right tool for each data pattern
- MySQL: transactions, ACID, foreign keys
- MongoDB: flexible schema, no migrations
- Query language match: SQL vs document queries

### 5. Pub/Sub for Events

**Decision**: Use Google Cloud Pub/Sub for async messaging.

**Benefits:**

- Managed service (no operational burden)
- Decoupled components
- Retry mechanisms built-in
- Local emulator for development

### 6. Better-Auth for Authentication

**Decision**: Use Better-Auth for session management.

**Benefits:**

- HTTP-only secure cookies
- Automatic session validation
- Password hashing (Argon2id)
- Type-safe API

## Security Architecture

### Authentication

- **Method**: Session-based with HTTP-only cookies
- **Hashing**: Argon2id (OWASP recommended)
- **Validation**: Per-request in middleware
- **Logout**: Session deletion from database

### Data Protection

- **Transport**: HTTPS/TLS in production
- **Storage**: Passwords hashed, never stored plain-text
- **Sensitive Data**: Marked in code (email, passwords)

### API Security

- **CORS**: Configured for frontend origin
- **Input Validation**: Schema validation on all endpoints
- **Rate Limiting**: Can be added at reverse proxy layer
- **Health Checks**: Liveness/readiness endpoints

## Scaling Considerations

### Horizontal Scaling

1. **Frontend**: CDN + multiple regions (static assets)
2. **Backend**: Multiple instances behind load balancer
3. **Databases**: Connection pooling, read replicas possible
4. **Cache**: Shared Redis cluster
5. **Pub/Sub**: Google Cloud Pub/Sub scales automatically

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries with indexes
- Implement caching for expensive operations

### Database Extraction

The modular structure allows extracting modules to services:

1. Extract notifications to separate service
2. Create service-to-service communication
3. Maintain separate databases
4. Use Pub/Sub for inter-service events

## Deployment Architecture

### Development

```
Docker Compose
├── MySQL container
├── MongoDB container
├── Redis container
├── Pub/Sub Emulator
└── Application (local)
```

### Production (GCP)

```
Cloud Run
├── Containerized app
├── Cloud SQL (MySQL)
├── Cloud Firestore/External MongoDB Atlas
├── Cloud Memorystore (Redis)
└── Cloud Pub/Sub
```

## Next Steps

- [Backend Setup](./backend/setup.md) - Detailed backend configuration
- [Backend API Reference](./backend/api-reference.md) - All endpoints
- [Frontend Setup](./frontend/setup.md) - Frontend configuration
- [Infrastructure Guide](./infrastructure.md) - Services and deployment

---

**Last Updated**: December 2024
