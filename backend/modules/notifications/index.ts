import { Elysia } from 'elysia'
import { notificationRoutes } from './routes/notification.routes'

export const notificationsModule = new Elysia().use(notificationRoutes)

export { NotificationService } from './services/notification.service'
export * from './schema/notification.schema'
