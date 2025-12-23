# Modules Architecture

## Folder Rules

Each module can have **only these folders**:

| Folder         | Purpose                              | File Suffix                 | Example                 |
| -------------- | ------------------------------------ | --------------------------- | ----------------------- |
| `controllers/` | HTTP request/response handling       | `.controller.ts`            | `lead.controller.ts`    |
| `handlers/`    | Pub/Sub message handling             | `.handler.ts`               | `lead.handler.ts`       |
| `services/`    | Business logic (decoupled from HTTP) | `.service.ts`               | `lead.service.ts`       |
| `routes/`      | HTTP endpoints (Elysia instances)    | `.routes.ts`                | `lead.routes.ts`        |
| `models/`      | MongoDB schemas (Typegoose)          | `.model.ts`                 | `lead.model.ts`         |
| `schema/`      | MySQL schemas (Drizzle)              | `.schema.ts`                | `user.schema.ts`        |
| `core/`        | Constants, types, config             | `.constants.ts` `.types.ts` | `followup.constants.ts` |
| `shared/`      | Shared code within module            | varies                      | `lead.types.ts`         |
| `test/`        | Test factories and helpers           | `.factory.ts`               | `lead.factory.ts`       |
| `submodules/`  | Nested features (same structure)     | -                           | `follow-up/`            |

## Architecture Overview

This architecture uses two parallel patterns for different entry points:

```
HTTP:    Request → Routes → Controller → Service → Model → Database
Pub/Sub: Message → pubsub-receiver → Handler → Service → Model → Database
```

Both **Controllers** (HTTP) and **Handlers** (Pub/Sub) orchestrate services but are decoupled from business logic.

## Architecture: Controller → Service → Model (HTTP)

Following **Elysia best practices**, each layer has a specific responsibility:

```
HTTP Request → Routes → Controller → Service → Model/Repository → Database
```

| Layer          | Responsibility                                             | Example                  |
| -------------- | ---------------------------------------------------------- | ------------------------ |
| **Routes**     | HTTP routing, request validation schemas (Elysia instance) | `leadRoutes`             |
| **Controller** | Request/response handling, error formatting, HTTP concerns | `LeadController.list()`  |
| **Service**    | Business logic, decoupled from HTTP (reusable)             | `LeadService.findById()` |
| **Model**      | Data structure and database operations                     | `LeadModel`              |

### Why This Separation?

1. **Testability**: Services can be tested without HTTP context
2. **Reusability**: Services can be used from CLI, workers, Pub/Sub handlers
3. **Type Safety**: Controllers handle Elysia Context with proper typing
4. **Maintainability**: Clear boundaries between HTTP and business logic

### Controller Pattern

Controllers receive Elysia Context directly and handle destructuring internally:

```typescript
// Controller receives typed Context
static async getById({ params, set, request }: Context<{ params: { id: string } }>) {
  const lang = getLanguageFromHeader(request.headers.get('accept-language'))
  const lead = await LeadService.findById(params.id)

  if (!lead) {
    set.status = 404
    return { error: { code: 'NOT_FOUND', message: getTranslation('errors.notFound', lang) } }
  }

  return lead
}

// Routes are clean and simple
.get('/:id', LeadController.getById, { params: t.Object({ id: t.String() }) })
```

## Architecture: Handler → Service → Model (Pub/Sub)

For asynchronous messaging via Google Cloud Pub/Sub:

```
Pub/Sub Message → pubsub-receiver → Handler → Service → Model/Repository → Database
```

| Layer               | Responsibility                                          | Example                          |
| ------------------- | ------------------------------------------------------- | -------------------------------- |
| **pubsub-receiver** | Decodes messages, routes to handlers (centralized)      | `POST /pubsub/push`              |
| **Handler**         | Message handling, orchestration, logging (domain-local) | `LeadHandler.initiateFollowUp()` |
| **Service**         | Business logic, decoupled from messaging (reusable)     | `LeadService.create()`           |
| **Model**           | Data structure and database operations                  | `LeadModel`                      |

### Why Handlers?

1. **Separation of concerns**: Handlers own messaging orchestration, services own business logic
2. **Parallel to Controllers**: Same pattern as HTTP - Controllers for HTTP, Handlers for Pub/Sub
3. **Testability**: Handlers can be tested without Pub/Sub infrastructure
4. **Domain locality**: Handlers live in domain modules, not in pubsub-receiver

### Handler Pattern

Handlers receive decoded payload and metadata, orchestrate services:

```typescript
// submodules/follow-up/handlers/followup.handler.ts
export class FollowUpHandler {
  /**
   * Action: initiate-lead-follow-up
   * Creates lead and sends initial follow-up message
   */
  static async initiateFollowUp(body: unknown, _metadata: HandlerMetadata): Promise<HandlerResult> {
    const payload = body as InitiateFollowUpPayload

    // Check if lead already exists
    const existingLead = await LeadService.findByCountryPhone(payload.countryPhone)
    if (existingLead) {
      return { success: true, message: 'Lead already exists' }
    }

    // Create new lead using service
    const lead = await LeadService.create({
      countryPhone: payload.countryPhone,
      phone: payload.phone,
      // ...
    })

    // Orchestrate follow-up services (within same submodule)
    const generated = await MessageGenerator.generate(lead, 'initial')
    await WhatsAppPublisher.send(lead.countryPhone, generated.content, lead._id!, 'initial')

    return { success: true, message: `Lead ${lead._id} created` }
  }
}
```

### Handler Placement: Root vs Submodule

**Principle:** Handlers should live where their domain logic lives.

| Handler Location      | When to use                                      |
| --------------------- | ------------------------------------------------ |
| `module/handlers/`    | Handler uses only root-level services            |
| `submodule/handlers/` | Handler orchestrates submodule-specific services |

**Why?** Encapsulation - parent modules should not import submodule internals.

```
❌ WRONG: Root handler importing submodule internals
leads/handlers/lead.handler.ts
  → imports submodules/follow-up/services/message-generator.service.ts
  → imports submodules/follow-up/services/whatsapp-publisher.service.ts

✅ CORRECT: Handler lives in the submodule it orchestrates
leads/submodules/follow-up/handlers/followup.handler.ts
  → imports ../services/message-generator.service.ts (relative, same submodule)
  → imports ../services/whatsapp-publisher.service.ts (relative, same submodule)
```

### Handler Registration

Handlers are registered in `pubsub-receiver/core/handlers.constants.ts`:

```typescript
// Import from module index (not direct path to submodule)
import { FollowUpHandler } from '../../leads'

export const pubsubHandlers: HandlerEntry[] = [
  {
    action: PUBSUB_ACTIONS.INITIATE_LEAD_FOLLOW_UP,
    handler: FollowUpHandler.initiateFollowUp,
    description: 'Creates lead and sends initial follow-up message',
  },
  // ... more handlers
]
```

## File Naming

```
✅ CORRECT:
controllers/lead.controller.ts
handlers/lead.handler.ts
services/lead.service.ts
services/payload-decoder.service.ts
routes/lead.routes.ts
models/lead.model.ts
core/followup.constants.ts

❌ WRONG:
services/lead.ts           # Missing .service suffix
services/leadService.ts    # Wrong naming
core/decoder.ts            # Should be in services/ with .service.ts
controllers/leadController.ts  # Should be lead.controller.ts
handlers/leadHandler.ts    # Should be lead.handler.ts
```

## Class Naming Convention

Classes follow the pattern: `<Entity><Type>` where:

- `<Entity>`: Domain entity name (PascalCase)
- `<Type>`: Class type based on file location

### Naming by File Type

| File Type         | Export Name Pattern                                       | Examples                                                   |
| ----------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| `*.controller.ts` | `<Entity>Controller` (class, PascalCase)                  | `LeadController`, `UserController`, `OrderController`      |
| `*.handler.ts`    | `<Entity>Handler` (class, PascalCase)                     | `LeadHandler`, `OrderHandler`, `PaymentHandler`            |
| `*.service.ts`    | `<Entity>Service` (class, PascalCase)                     | `LeadService`, `PaymentService`, `MessageGeneratorService` |
| `*.model.ts`      | `<Entity>Model` (class, PascalCase)                       | `LeadModel`, `UserModel`, `OrderModel`                     |
| `*.schema.ts`     | `<Entity>Schema` or `<Entity>Table` (class, PascalCase)   | `UserSchema`, `OrderTable`                                 |
| `*.routes.ts`     | `<entity>Routes` (const, camelCase)                       | `leadRoutes`, `userRoutes`                                 |
| `*.repository.ts` | `<Entity>Repository` (class, PascalCase)                  | `LeadRepository`, `OrderRepository`                        |
| `*.factory.ts`    | `Create<Entity>` or `Mock<Entity>` (function, PascalCase) | `CreateMockLead`, `MockUserFactory`                        |
| `*.constants.ts`  | `<ENTITY>_<TYPE>` (const, UPPER_SNAKE_CASE)               | `FOLLOW_UP_TIMING`, `PUBSUB_ACTIONS`                       |
| `*.types.ts`      | Types/interfaces (no class)                               | `Lead`, `UserCreateInput`, `OrderStatus`                   |

### Complete Example

```typescript
// lead.controller.ts (HTTP request/response handling)
export class LeadController {
  static async list({ query }: Context<{ query: ListQuery }>) {
    const page = parseInt(query.page || '1', 10)
    const limit = Math.min(parseInt(query.limit || '20', 10), 100)
    return LeadService.findWithPagination({ page, limit })
  }

  static async getById({ params, set, request }: Context<{ params: { id: string } }>) {
    const lang = getLanguageFromHeader(request.headers.get('accept-language'))
    const lead = await LeadService.findById(params.id)
    if (!lead) {
      set.status = 404
      return { error: { code: 'NOT_FOUND', message: getTranslation('errors.leads.notFound', lang) } }
    }
    return lead
  }
}

// lead.service.ts (Business logic - decoupled from HTTP)
export class LeadService {
  static async create(data: CreateLead): Promise<Lead> { ... }
  static async findById(id: string): Promise<Lead | null> { ... }
}

// lead.model.ts (MongoDB with Typegoose)
export class LeadModel {
  @prop() countryPhone: string
  @prop() status: 'active' | 'paused'
}

// lead.routes.ts (Elysia instance - delegates to controller)
export const leadRoutes = new Elysia({ prefix: '/leads' })
  .get('/', LeadController.list, {
    query: t.Object({ page: t.Optional(t.String()), limit: t.Optional(t.String()) }),
  })
  .get('/:id', LeadController.getById, {
    params: t.Object({ id: t.String() }),
  })

// lead.factory.ts
export const createMockLead = (): Lead => ({ ... })

// submodules/follow-up/handlers/followup.handler.ts (Pub/Sub message handling in submodule)
export class FollowUpHandler {
  static async initiateFollowUp(body: unknown, metadata: HandlerMetadata): Promise<HandlerResult> { ... }
  static async handleResponse(body: unknown, metadata: HandlerMetadata): Promise<HandlerResult> { ... }
}

// followup-scheduler.service.ts (Multi-word entity)
export class FollowUpScheduler {
  static scheduleNext(step: string) { ... }
}

// followup.constants.ts (Constants use UPPER_SNAKE_CASE)
export const FOLLOWUP_TIMING = {
  initial: 0,
  followup_1: 1200000,
  followup_2: 5400000,
} as const

export const FOLLOWUP_ACTIONS = {
  INITIATE: 'initiate-lead-follow-up',
  RESPOND: 'lead-responded',
} as const

// lead.types.ts (Types and interfaces, no classes)
export type Lead = {
  _id?: string
  countryPhone: string
  status: LeadStatus
  followUpState: FollowUpState
}

export interface CreateLeadInput {
  countryPhone: string
  phone: string
  language: 'en' | 'pt-BR' | 'es'
}

export type LeadStatus = 'active' | 'paused' | 'responded' | 'cancelled'
```

### Routes Naming (Special Case)

Routes are **not classes**, they're **Elysia instances**. Use camelCase for the constant:

```typescript
// ✅ CORRECT
export const leadRoutes = new Elysia()
export const userRoutes = new Elysia()
export const notificationRoutes = new Elysia()

// ❌ WRONG
export const LeadRoutes = new Elysia()  // Should be camelCase
export class UserRoutes { ... }         // Routes should not be classes
```

### Key Rules

1. **Classes use PascalCase** with type suffix: `LeadService`, `UserModel`, `OrderRepository`
2. **Routes use camelCase** with Routes suffix: `leadRoutes`, `userRoutes` (these are Elysia instances, not classes)
3. **Constants use UPPER_SNAKE_CASE**: `FOLLOW_UP_TIMING`, `PUBSUB_ACTIONS`
4. **Functions use camelCase**: `createMockLead()`, `getCurrentTime()`
5. **Types/Interfaces use PascalCase** (no suffix): `Lead`, `UserInput`, `OrderStatus`
6. **Multi-word entities** keep all words: `LeadFollowUpService` (not `LeadFollowUpSvc`)
7. **Always include the type suffix** for classes (Service, Model, Repository, etc.)
8. **Be explicit** - avoid abbreviations like `Svc`, `Mgr`, `Repo`, `Srv`

### ❌ Anti-patterns

```typescript
// Wrong - no type suffix
export class Lead { ... }

// Wrong - PascalCase for routes (should be camelCase)
export const LeadRoutes = new Elysia()

// Wrong - routes as a class
export class UserRoutes { ... }

// Wrong - inconsistent capitalization
export class leadService { ... }

// Wrong - abbreviations
export class LeadSvc { ... }

// Wrong - type suffix doesn't match file type
export class LeadFactory { ... } // in lead.service.ts

// Wrong - PascalCase for constants
export const FollowUpTiming = { ... }

// Wrong - camelCase for classes
export const leadService = new LeadService()
```

## Class Pattern: Static vs Instance

### Principle

- **Static classes**: When logic has no internal state and works as pure functions
- **Instance classes**: When there's state, configurable dependencies, or need for polymorphism

### When to Use Static Classes (preferred)

Use static when **ALL** of these are true:

1. No mutable internal state
2. Will not be extended (no inheritance)
3. No dependency injection needed
4. All methods are purely functional operations
5. Class is a semantic grouping of functions (Helpers, Utils, Parsers, Validators)
6. Tests can call methods directly without complex mocks

```typescript
// ✅ CORRECT: Static class - no state, pure functions
export class LeadService {
  static async create(data: CreateLead): Promise<Lead> { ... }
  static async findById(id: string): Promise<Lead | null> { ... }
}

// Usage
await LeadService.create(data)
```

### When to Use Instance Classes

Use instance when **ANY** of these are true:

1. Has internal state (config, cache, options, context)
2. Behavior varies per instance
3. Has external dependency that varies between environments (repos, APIs)
4. Needs mock, spy, or substitution in tests
5. May serve as extension point (polymorphism)
6. Lifecycle matters (setup, teardown, connection, temp storage)

```typescript
// ✅ CORRECT: Instance class - has state and dependencies
export class NotificationSender {
  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly config: NotificationConfig
  ) {}

  async send(notification: Notification): Promise<void> { ... }
}

// Usage
const sender = new NotificationSender(emailProvider, config)
await sender.send(notification)
```

### Anti-pattern

Never force static classes when:

- Domain clearly represents an entity with its own behavior
- Code may need variations in the future
- Testability depends on controlling dependencies
- Using "static" just to avoid writing `new`

### Helper Functions Placement

When a function is used by **only one method**, define it as a local `const` inside that method:

| Scope             | When to use                     | Example                                         |
| ----------------- | ------------------------------- | ----------------------------------------------- |
| Local `const`     | Used by single method only      | `const extractData = () => {...}` inside method |
| `private static`  | Shared between multiple methods | `private static validate()` in class            |
| Exported function | Reused across modules           | `export function formatDate()`                  |

```typescript
// ✅ CORRECT: Helper used only by this method - define locally
static async processItems(): Promise<void> {
  const processItem = async (item: Item): Promise<void> => {
    await service.save(item)
  }

  for (const item of items) {
    await processItem(item)
  }
}

// ✅ CORRECT: Helper shared between methods - private static
export class OrderHandler {
  private static validateOrder(order: Order): boolean {
    return order.items.length > 0
  }

  static async create() { /* uses validateOrder */ }
  static async update() { /* uses validateOrder */ }
}
```

## Tests

Tests are **co-located** with source files:

```
controllers/
├── lead.controller.ts
└── lead.controller.test.ts    ← Same folder
services/
├── lead.service.ts
└── lead.service.test.ts    ← Same folder
routes/
├── lead.routes.ts
└── lead.routes.test.ts     ← Same folder
```

### Required Tests

The following file types **MUST** have co-located tests:

| File Type         | Test Required | Example Test File          |
| ----------------- | ------------- | -------------------------- |
| `*.controller.ts` | **Yes**       | `lead.controller.test.ts`  |
| `*.service.ts`    | **Yes**       | `lead.service.test.ts`     |
| `*.routes.ts`     | **Yes**       | `lead.routes.test.ts`      |
| `*.handler.ts`    | **Yes**       | `followup.handler.test.ts` |
| `*.model.ts`      | Optional      | `lead.model.test.ts`       |
| `*.constants.ts`  | No            | -                          |
| `*.types.ts`      | No            | -                          |

### Controller Test Pattern

Controllers should be tested by mocking their dependencies (services, i18n):

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MyController } from './my.controller'
import { MyService } from '../services/my.service'
import * as i18nModule from '@i18n'

describe('MyController', () => {
  beforeEach(() => {
    vi.spyOn(i18nModule, 'getLanguageFromHeader').mockReturnValue('en')
    vi.spyOn(i18nModule, 'getTranslation').mockImplementation((key) => `translated:${key}`)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return data when found', async () => {
    vi.spyOn(MyService, 'findById').mockResolvedValue({ id: '123' })
    const context = createMockContext({ params: { id: '123' } })

    const result = await MyController.getById(context as never)

    expect(result).toEqual({ id: '123' })
  })
})
```

## Module Structure Example

```
leads/
├── index.ts                           # Public exports (re-exports from submodules)
├── CLAUDE.md                          # Module docs (optional)
├── controllers/
│   ├── lead.controller.ts             # HTTP request/response handling
│   └── lead.controller.test.ts
├── routes/
│   ├── lead.routes.ts                 # Elysia instance, delegates to controller
│   └── lead.routes.test.ts
├── services/
│   ├── lead.service.ts                # Business logic (decoupled from HTTP/Pub/Sub)
│   └── lead.service.test.ts
├── models/
│   ├── lead.model.ts
│   └── lead.model.test.ts
├── core/
│   └── lead.types.ts
│   └── lead.constants.ts
├── test/
│   └── factories/
│       └── lead.factory.ts
└── submodules/
    └── follow-up/
        ├── index.ts                   # Exports handler + services
        ├── handlers/
        │   └── followup.handler.ts    # Pub/Sub handling for follow-up domain
        ├── services/
        │   ├── followup-scheduler.service.ts
        │   ├── message-generator.service.ts
        │   └── whatsapp-publisher.service.ts
        └── core/
            └── followup.constants.ts
```

## Index Exports

```typescript
// modules/leads/index.ts
import { leadRoutes } from './routes/lead.routes'

export const leadsModule = leadRoutes

// Re-export controllers for external use (HTTP)
export { LeadController } from './controllers/lead.controller'

// Re-export services for external use
export { LeadService } from './services/lead.service'
export type { Lead } from './core/lead.types'

// Re-export from submodules (handler + services)
export {
  FollowUpHandler,
  FollowUpScheduler,
  MessageGenerator,
  WhatsAppPublisher,
} from './submodules/follow-up'
```

```typescript
// modules/leads/submodules/follow-up/index.ts
export { FollowUpHandler } from './handlers/followup.handler'
export { FollowUpScheduler } from './services/followup-scheduler.service'
export { MessageGenerator } from './services/message-generator.service'
export { WhatsAppPublisher } from './services/whatsapp-publisher.service'
export * from './core/followup.constants'
```

## Inter-Module Communication

```typescript
// Read: Direct import
import { LeadService } from '../leads'
const lead = await LeadService.findById(id)

// Write: Pub/Sub events
await pubsub.topic('lead-created').publish({ leadId })
```

## Typegoose Best Practices

### Importing Ref Type (v13+)

**CRITICAL:** `Ref` is a type-only export from `@typegoose/typegoose`. Always import it with `type` keyword to prevent runtime errors.

#### ✅ CORRECT: Type-Only Import

```typescript
import type { Ref } from '@typegoose/typegoose'
import { prop, getModelForClass } from '@typegoose/typegoose'
import { Project } from './project.model'

export class Message {
  @prop({ required: true, ref: () => Project })
  public projectId!: Ref<Project>
}
```

#### ❌ WRONG: Runtime Import

```typescript
// This causes: SyntaxError: Export named 'Ref' not found in module
import { Ref } from '@typegoose/typegoose' // ❌ Runtime import
```

### Why This Matters

- `Ref<T>` is purely a TypeScript type used by Typegoose for type checking
- It doesn't exist at runtime and cannot be imported as a regular value
- Using `import type` ensures TypeScript erases it at compile time
- Prevents "Export named 'Ref' not found" errors during Bun execution

### Disabling "Setting Mixed" Warnings

Typegoose warns when properties allow mixed types (any value). Use `@modelOptions` to suppress or control these warnings.

```typescript
import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose'

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW, // Suppress warnings for flexible data
  },
})
export class Project {
  @prop({ type: () => Object, default: {} })
  public projectProfile!: { [key: string]: unknown } // ✅ No warning
}
```

### Checklist for Typegoose Models

- [ ] Import `Ref` with `type` keyword: `import type { Ref } from '@typegoose/typegoose'`
- [ ] Set `allowMixed: Severity.ALLOW` in `@modelOptions` if model has flexible properties
- [ ] Use `@index` for frequently queried fields (projectId, userId, etc.)
- [ ] Add `@modelOptions` with `timestamps: true` for createdAt/updatedAt
- [ ] Specify collection name in `schemaOptions`
- [ ] Use `public` visibility for all properties
- [ ] Add `!` (non-null assertion) to required properties

## Checklist for New Module

1. [ ] Create folder: `modules/mymodule/`
2. [ ] Add `index.ts` with exports (re-export from submodules if applicable)
3. [ ] Add `routes/*.routes.ts` for HTTP routing
4. [ ] Add `controllers/*.controller.ts` for HTTP request/response handling
5. [ ] Add `handlers/*.handler.ts` for Pub/Sub (root level OR in submodule - see Handler Placement)
6. [ ] Add `services/*.service.ts` for business logic
7. [ ] Add `models/*.model.ts` or `schema/*.schema.ts` for data
8. [ ] Add `core/*.constants.ts` and `core/*.types.ts` if needed
9. [ ] Add `test/factories/*.factory.ts` for test data
10. [ ] **Add co-located tests** for controllers, services, routes, and handlers (see Required Tests)
11. [ ] Register routes in `src/app.ts`
12. [ ] Register handlers in `pubsub-receiver/core/handlers.constants.ts` (import from module index)
