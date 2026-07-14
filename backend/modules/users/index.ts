import { Elysia } from 'elysia'
import { authRoutes } from './routes/auth.routes'
import { userRoutes } from './routes/user.routes'

export const usersModule = new Elysia().use(authRoutes).use(userRoutes)

// Controllers
export { UserController } from './controllers/user.controller'

// Services (module objects — see AGENTS.md § Service patterns)
export { UserService } from './services/user.service'
export { PasswordService } from './services/password.service'

// Schema
export * from './schema/user.schema'
export * from './schema/auth.schema'
