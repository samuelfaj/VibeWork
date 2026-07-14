import { Elysia } from 'elysia'
import { notificationRoutes } from './routes/notification.routes'

export const notificationsModule = new Elysia().use(notificationRoutes)

// Controllers
export { NotificationController } from './controllers/notification.controller'

// Services (module objects / intentional instances — see AGENTS.md § Service patterns)
export { NotificationService } from './services/notification.service'
export { NotificationFormatterService } from './services/notification-formatter.service'
export { NotificationPublisherService } from './services/notification-publisher.service'
export {
  NotificationSubscriberService,
  NotificationSubscriber,
  notificationSubscriber,
  isValidNotificationPayload,
  startNotificationSubscriber,
  stopNotificationSubscriber,
} from './services/notification-subscriber.service'
export { createEmailService } from './services/email.service'
export type { EmailService } from './services/email.service'
