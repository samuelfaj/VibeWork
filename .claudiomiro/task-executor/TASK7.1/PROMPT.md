## PROMPT
Implement the Notification Typegoose model, notification service layer with CRUD operations, response formatter, and mockable Email service with AWS SES interface.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/modules/notifications/models/notification.model.ts`
- `/backend/modules/notifications/core/notification.formatter.ts`
- `/backend/modules/notifications/services/notification.service.ts`
- `/backend/modules/notifications/services/email.service.ts`
- `/backend/modules/notifications/core/__tests__/notification.formatter.test.ts`
- `/backend/modules/notifications/services/__tests__/email.service.test.ts`

### Patterns to Follow

**Typegoose model (notification.model.ts):**
```typescript
import { prop, getModelForClass } from '@typegoose/typegoose'

class Notification {
  @prop({ required: true })
  userId!: string

  @prop({ required: true, enum: ['in-app', 'email'] })
  type!: 'in-app' | 'email'

  @prop({ required: true })
  message!: string

  @prop({ default: false })
  read!: boolean

  @prop({ default: () => new Date() })
  createdAt!: Date
}

export const NotificationModel = getModelForClass(Notification)
```

**Email service interface:**
```typescript
export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>
}

export class SESEmailService implements EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // AWS SES implementation
  }
}

export class MockEmailService implements EmailService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`Mock email to ${to}: ${subject}`)
  }
}

export function createEmailService(useMock?: boolean): EmailService {
  return useMock ?? process.env.EMAIL_SERVICE_MOCK === 'true'
    ? new MockEmailService()
    : new SESEmailService()
}
```

### Integration Points
- Uses schemas from `packages/contract` for type alignment
- Uses MongoDB connection from `backend/infra/database/mongodb.ts`

## EXTRA DOCUMENTATION
- Typegoose: https://typegoose.github.io/typegoose/
- AWS SES SDK: https://docs.aws.amazon.com/ses/

## LAYER
3

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- SES must be mockable for testing
- Filter notifications by userId
- Do not log message content (PII)
