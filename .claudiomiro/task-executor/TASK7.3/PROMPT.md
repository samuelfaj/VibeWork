## PROMPT
Implement Notification API routes (CRUD endpoints), module integration with main Elysia app, and module documentation (CLAUDE.md).

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/modules/notifications/routes/notification.routes.ts`
- `/backend/modules/notifications/index.ts`
- `/backend/modules/notifications/CLAUDE.md`
- `/backend/modules/notifications/__tests__/notification.routes.test.ts`

### Files This Task Will Modify
- `/backend/src/app.ts` - Mount notifications module

### Files From Previous Subtasks to Reference
- `/backend/modules/notifications/services/notification.service.ts` - CRUD operations
- `/backend/modules/notifications/services/notification-publisher.ts` - Pub/Sub publishing
- `/backend/modules/notifications/core/notification.formatter.ts` - Response formatting

### Patterns to Follow

**ElysiaJS routes with TypeBox validation:**
```typescript
import { Elysia, t } from 'elysia'
import { CreateNotificationSchema, NotificationSchema } from '@vibe/contract'
import { notificationService } from './services/notification.service'
import { publishNotificationCreated } from './services/notification-publisher'
import { formatNotificationResponse } from './core/notification.formatter'

export const notificationRoutes = new Elysia({ prefix: '/notifications' })
  .post('/', async ({ body, set }) => {
    const notification = await notificationService.createNotification(body)
    await publishNotificationCreated(notification)
    set.status = 201
    return formatNotificationResponse(notification)
  }, {
    body: CreateNotificationSchema
  })
  .get('/', async ({ query }) => {
    // Get userId from auth context
    const notifications = await notificationService.getUserNotifications(userId)
    return {
      data: notifications.map(formatNotificationResponse),
      total: notifications.length,
      page: query.page ?? 1,
      limit: query.limit ?? 20
    }
  })
  .patch('/:id/read', async ({ params, set }) => {
    // Get userId from auth context
    const notification = await notificationService.markAsRead(params.id, userId)
    if (!notification) {
      set.status = 404
      return { error: 'Notification not found' }
    }
    return formatNotificationResponse(notification)
  })
```

**Module index pattern:**
```typescript
import { Elysia } from 'elysia'
import { notificationRoutes } from './routes/notification.routes'

export const notificationsModule = new Elysia()
  .use(notificationRoutes)
```

### Integration Points
- Uses schemas from `packages/contract`
- Uses auth middleware from TASK6 (or placeholder)
- Mounts in `backend/src/app.ts`

## EXTRA DOCUMENTATION
- ElysiaJS: https://elysiajs.com/

## LAYER
3

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Routes MUST require authentication
- Filter all queries by authenticated userId
- Validate with contract schemas
- Pagination on GET /notifications
