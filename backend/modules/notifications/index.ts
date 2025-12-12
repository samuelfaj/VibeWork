import { Elysia } from 'elysia'
import { notificationRoutes } from './routes/notification.routes'

export const notificationsModule = new Elysia().use(notificationRoutes)

// Controllers
export { NotificationController } from './controllers/notification.controller'

// Services
export { NotificationService } from './services/notification.service'
export { NotificationFormatterService } from './services/notification-formatter.service'
export { NotificationPublisherService } from './services/notification-publisher.service'
export { NotificationSubscriberService } from './services/notification-subscriber.service'
export { createEmailService } from './services/email.service'
export type { EmailService } from './services/email.service'

// Backward compatibility - deprecated exports
export {
  createNotification,
  getUserNotifications,
  markAsRead,
} from './services/notification.service'
export { formatNotificationResponse } from './services/notification-formatter.service'
export {
  NotificationPublisher,
  publishNotificationCreated,
} from './services/notification-publisher.service'
export {
  handleMessage,
  isValidPayload,
  startNotificationSubscriber,
  stopNotificationSubscriber,
} from './services/notification-subscriber.service'
