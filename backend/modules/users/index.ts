import { Elysia } from 'elysia'
import { authRoutes } from './routes/auth.routes'
import { userRoutes } from './routes/user.routes'

export const usersModule = new Elysia().use(authRoutes).use(userRoutes)

export * from './schema/user.schema'
export * from './schema/auth.schema'
export * from './services/user.service'
export * from './core/password'
