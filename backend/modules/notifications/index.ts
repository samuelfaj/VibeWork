import { Elysia } from 'elysia'
import { notificationRoutes } from './routes/notification.routes'

export const notificationsModule = new Elysia().use(notificationRoutes)

export * from './services/notification.service'
export * from './services/notification-publisher'
export * from './core/notification.formatter'
